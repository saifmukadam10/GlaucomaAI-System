import cv2
import numpy as np
import torch
from torchvision.models.detection import maskrcnn_resnet50_fpn

from core.config import settings


class DiscCupDetector:
    def __init__(self, model_path, score_threshold=0.5):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.score_threshold = score_threshold
        self.model = maskrcnn_resnet50_fpn(num_classes=3)
        state_dict = torch.load(model_path, map_location=self.device)
        self.model.load_state_dict(state_dict)
        self.model.to(self.device)
        self.model.eval()

    @staticmethod
    def _pick_best_box(boxes, labels, scores, target_label):
        idxs = (labels == target_label).nonzero(as_tuple=True)[0]
        if len(idxs) == 0:
            return None
        best_local_idx = scores[idxs].argmax().item()
        best_idx = idxs[best_local_idx].item()
        return boxes[best_idx].round().int().cpu().numpy()

    @staticmethod
    def _normalize_input_image(image):
        if isinstance(image, str):
            loaded = cv2.imread(image)
            if loaded is None:
                raise ValueError(f"Image not found: {image}")
            return loaded

        if not isinstance(image, np.ndarray):
            raise ValueError("detect expects either an image path or a numpy image array")

        return image

    def detect(self, image, threshold=None):
        img_bgr = self._normalize_input_image(image)
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        img_tensor = torch.from_numpy(img_rgb).permute(2, 0, 1).float() / 255.0
        img_tensor = img_tensor.to(self.device)

        with torch.no_grad():
            prediction = self.model([img_tensor])[0]

        threshold = self.score_threshold if threshold is None else threshold
        mask = prediction["scores"] > threshold

        boxes = prediction["boxes"][mask]
        labels = prediction["labels"][mask]
        scores = prediction["scores"][mask]

        disc_box = self._pick_best_box(boxes, labels, scores, target_label=1)
        cup_box = self._pick_best_box(boxes, labels, scores, target_label=2)

        detections = []
        for box, label, score in zip(boxes, labels, scores):
            detections.append(
                {
                    "label": "disc" if int(label.item()) == 1 else "cup" if int(label.item()) == 2 else "other",
                    "score": float(score.item()),
                    "box": box.round().int().cpu().numpy().tolist(),
                }
            )

        return disc_box, cup_box, detections


def load_rcnn():
    return DiscCupDetector(settings.RCNN_PATH)