import cv2
import numpy as np
from PIL import Image
import torch
from torchvision import transforms


# =========================
# COMMON LOADER
# =========================
def load_image(image_input):

    if isinstance(image_input, str):
        image = Image.open(image_input).convert("RGB")

    elif isinstance(image_input, np.ndarray):
        image = Image.fromarray(image_input).convert("RGB")

    elif isinstance(image_input, Image.Image):
        image = image_input.convert("RGB")

    else:
        raise ValueError("Unsupported image input type")

    return image


# =========================
# RESNET PREPROCESSING
# =========================
resnet_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225]
    )
])


def preprocess_for_resnet(image_input):

    image = load_image(image_input)

    tensor = resnet_transform(image)

    return tensor.unsqueeze(0)  # [1, 3, 224, 224]


# =========================
# RCNN PREPROCESSING
# =========================
def preprocess_for_rcnn(image_input):

    image = load_image(image_input)
    image = np.array(image)

    # NO resize (very important)
    tensor = torch.from_numpy(image).permute(2, 0, 1).float() / 255.0

    return [tensor]  # list format REQUIRED


# =========================
# UNET PREPROCESSING
# =========================
def apply_clahe(image):

    img = np.array(image)

    lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l = clahe.apply(l)

    enhanced = cv2.merge([l, a, b])
    enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2RGB)

    return enhanced


def preprocess_for_unet(image_input):

    image = load_image(image_input)
    image = np.array(image)

    # Resize to training size
    image = cv2.resize(image, (256, 256))

    # CLAHE enhancement
    image = apply_clahe(image)

    # Green channel emphasis (same as training)
    green_channel = image[:, :, 1]
    processed = image.copy()
    processed[:, :, 1] = green_channel

    # Normalize to [0,1]
    processed = processed / 255.0

    # HWC → CHW
    processed = np.transpose(processed, (2, 0, 1))

    # Add batch
    processed = np.expand_dims(processed, axis=0)

     # 🔥 FIX: convert to torch tensor
    processed = torch.tensor(processed, dtype=torch.float32)
    
    return processed


# =========================
# GRADCAM VISUALIZATION
# =========================
def denormalize_resnet(tensor):

    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])

    image = tensor.squeeze().permute(1, 2, 0).cpu().numpy()

    image = std * image + mean
    image = np.clip(image, 0, 1)

    return image