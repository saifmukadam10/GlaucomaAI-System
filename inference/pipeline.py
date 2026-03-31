import numpy as np
from core.model_loader import models
from utils.cdr_calculation import calculate_cdr
from utils.vessel_density import vessel_density_score
from inference.feature_builder import build_feature_vector


def run_pipeline(image):
    # image is expected to be a numpy array from OpenCV (H, W, 3)
    img_height, img_width = image.shape[:2]

    deep_features = models.resnet.extract_features(image)

    disc_box, cup_box, detections = models.rcnn.detect(image)

    if disc_box is None:
        disc_box = [0, 0, 1, 1]
    if cup_box is None:
        cup_box = [0, 0, 0, 0]

    cdr = calculate_cdr(disc_box, cup_box)

    vessel_mask = models.unet.segment(image)
    # Convert to a black-and-white mask for UI rendering:
    # vessels = white (255), background = black (0)
    #vessel_mask_bw = (vessel_mask > 0).astype(np.uint8) * 255
    vessel_mask_bw = vessel_mask * 255
    vessel_risk = vessel_density_score(vessel_mask_bw)

    features = build_feature_vector(deep_features, cdr, vessel_risk)

    prediction = models.xgb.predict(features)
    #print("disc" + disc_box)
    #print("cup" + cup_box)
    return {
        "prediction": prediction.tolist(),
        "cdr": float(cdr),
        "vessel_risk": float(vessel_risk),
        "vessel_mask": vessel_mask_bw,  # numpy array (encoded later in the API layer)
        # Box format assumed to be [x1, y1, x2, y2] in the same pixel space
        # as the input image (RCNN preprocessing does not resize).
        "disc_box": disc_box.tolist() if hasattr(disc_box, "tolist") else disc_box,
        "cup_box": cup_box.tolist() if hasattr(cup_box, "tolist") else cup_box,
        "detections": detections,
        "image_width": int(img_width),
        "image_height": int(img_height),
    }