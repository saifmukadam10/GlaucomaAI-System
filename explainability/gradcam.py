import threading
from typing import Optional, Tuple

import cv2
import numpy as np
import torch
import torch.nn.functional as F

from models.feature_extractor import load_resnet
from utils.preprocessing import load_image, preprocess_for_resnet

_MODEL = None
_MODEL_DEVICE = None
_LOCK = threading.Lock()


def _get_model():
    global _MODEL, _MODEL_DEVICE
    if _MODEL is not None:
        return _MODEL

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    extractor = load_resnet()
    backbone = extractor.model.to(device).eval()

    _MODEL = backbone
    _MODEL_DEVICE = device
    return _MODEL


def _normalize_heatmap(cam: np.ndarray) -> np.ndarray:
    cam = cam.astype(np.float32)
    cam_min = float(cam.min())
    cam_max = float(cam.max())
    denom = cam_max - cam_min
    if denom <= 1e-8:
        return np.zeros_like(cam, dtype=np.float32)
    return (cam - cam_min) / denom


def generate_gradcam(image_input, target_layer: str = "layer4") -> np.ndarray:
    """
    Generate a Grad-CAM heatmap for the given image using the project's ResNet.

    Returns:
        np.ndarray: float32 heatmap in [0, 1] with shape (H, W) matching the input image.
    """
    # Avoid concurrent hook overwrites on shared model.
    with _LOCK:
        model = _get_model()
        device = _MODEL_DEVICE

        # Original spatial size for resizing CAM back to input resolution.
        pil_img = load_image(image_input)
        orig_w, orig_h = pil_img.size

        x = preprocess_for_resnet(image_input).to(device)  # [1, 3, 224, 224]

        activations: Optional[torch.Tensor] = None
        gradients: Optional[torch.Tensor] = None

        target_module = getattr(model, target_layer, None)
        if target_module is None:
            raise ValueError(f"ResNet has no layer named '{target_layer}'.")

        def forward_hook(_module, _inp, out):
            nonlocal activations
            activations = out

        def backward_hook(_module, _grad_in, grad_out):
            nonlocal gradients
            # grad_out[0] matches the module output gradient: [B, C, H, W]
            gradients = grad_out[0]

        h1 = target_module.register_forward_hook(forward_hook)
        h2 = target_module.register_full_backward_hook(backward_hook)
        try:
            model.zero_grad(set_to_none=True)

            # Forward.
            output = model(x)  # [1, D] where fc is Identity() in your extractor

            # Scalar objective: use L2-norm of the ResNet feature vector.
            # This keeps gradients meaningful even though you don't have class logits here.
            score = output.norm(p=2)

            # Backward.
            torch.set_grad_enabled(True)
            score.backward()

            if activations is None or gradients is None:
                raise RuntimeError("Failed to capture activations/gradients for Grad-CAM.")

            # Grad-CAM: weights are global-average pooled gradients.
            # cam: [1, H, W]
            weights = gradients.mean(dim=(2, 3), keepdim=True)  # [1, C, 1, 1]
            cam = (weights * activations).sum(dim=1)  # [1, H, W]
            cam = F.relu(cam)

            cam_np = cam.squeeze(0).detach().cpu().numpy()  # [H, W] at feature resolution
            cam_np = _normalize_heatmap(cam_np)

            # Upsample to original image resolution.
            cam_resized = cv2.resize(cam_np, (orig_w, orig_h), interpolation=cv2.INTER_LINEAR)
            return cam_resized.astype(np.float32)
        finally:
            h1.remove()
            h2.remove()