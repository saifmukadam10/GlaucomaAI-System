import torch
import torch.nn as nn
import torchvision.models as models
import numpy as np
from utils.preprocessing import preprocess_for_resnet
from core.config import settings


class ResNetFeatureExtractor:

    def __init__(self, model_path):

        checkpoint = torch.load(model_path, map_location="cpu")

        if "model_state_dict" in checkpoint:
            state_dict = checkpoint["model_state_dict"]
        else:
            state_dict = checkpoint

        backbone = models.resnet50(weights=None)
        backbone.fc = nn.Identity()

        backbone.load_state_dict(state_dict, strict=False)

        backbone.eval()
        self.model = backbone

    def extract_features(self, image):

        tensor = preprocess_for_resnet(image)

        with torch.no_grad():
            features = self.model(tensor)

        return features.numpy().flatten()
def load_resnet_gradcam():

    return ResNetFeatureExtractor(settings.RESNET_GRADCAM_PATH)