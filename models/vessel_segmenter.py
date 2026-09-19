import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.models as models
import numpy as np
import segmentation_models_pytorch as smp

from utils.preprocessing import preprocess_for_unet
from core.config import settings


# =========================
# 🔥 Decoder Block
# =========================
class DecoderBlock(nn.Module):
    def __init__(self, in_channels, skip_channels, out_channels):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels + skip_channels, out_channels, 3, padding=1)
        self.relu = nn.ReLU(inplace=True)
        self.conv2 = nn.Conv2d(out_channels, out_channels, 3, padding=1)

    def forward(self, x, skip):
        x = F.interpolate(x, scale_factor=2, mode="bilinear", align_corners=False)

        if skip is not None:
            x = torch.cat([x, skip], dim=1)

        x = self.relu(self.conv1(x))
        x = self.relu(self.conv2(x))
        return x


# =========================
# 🔥 CORRECT UNet (ResNet34 Encoder)
# =========================
class UNet(torch.nn.Module):
    def __init__(self):
        super().__init__()

        self.model = smp.Unet(
            encoder_name="resnet34",   # 🔥 MOST LIKELY (try this first)
            encoder_weights=None,      # IMPORTANT
            in_channels=3,
            classes=1
        )

    def forward(self, x):
        return self.model(x)


# =========================
# 🔥 Segmenter
# =========================
class VesselSegmenter:

    def __init__(self, model_path):

        checkpoint = torch.load(model_path, map_location="cpu", weights_only=False)

        if "model_state_dict" in checkpoint:
            state_dict = checkpoint["model_state_dict"]
        else:
            state_dict = checkpoint

        self.model = UNet()

        # 🔥 IMPORTANT: strict=True (default)
        # 🔥 Fix prefix mismatch
        new_state_dict = {}

        for k, v in state_dict.items():
            new_key = "model." + k   # add prefix
            new_state_dict[new_key] = v

        self.model.load_state_dict(new_state_dict, strict=True)

        self.model.eval()

    def segment(self, image):

        tensor = preprocess_for_unet(image)
        tensor = tensor.to(next(self.model.parameters()).device)

        with torch.no_grad():
            output = self.model(tensor)

        mask = torch.sigmoid(output)
        mask = mask.squeeze().cpu().numpy()

        # =========================
        # 🔍 DEBUG (TEMP)
        # =========================
        print("UNet Output Stats:")
        print("Min:", mask.min())
        print("Max:", mask.max())
        print("Mean:", mask.mean())

        # =========================
        # 🔥 Threshold
        # =========================
        binary_mask = (mask > 0.5).astype(np.uint8)

        return binary_mask


# =========================
# 🔥 Loader
# =========================
def load_unet():
    return VesselSegmenter(settings.UNET_PATH)