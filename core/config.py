import os

class Settings:

    # Base directory of project (GlaucomaAI-System)
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    MODEL_DIR = os.path.join(BASE_DIR, "models", "weights")

    RESNET_PATH = os.path.join(MODEL_DIR, "resnet_feature_extractor.pth")
    RESNET_GRADCAM_PATH = os.path.join(MODEL_DIR, "best_resnet_model.pth")
    RCNN_PATH = os.path.join(MODEL_DIR, "mask_cnn_refuge2.pth")
    UNET_PATH = os.path.join(MODEL_DIR, "unet_vessel_segmentation.pth")
    XGB_PATH = os.path.join(MODEL_DIR, "xgboost_model.pkl")

    PATIENT_DB = os.path.join(BASE_DIR, "data", "patient_records.json")

    IMAGE_SIZE = 224

    LLM_MODEL = "llama3"


settings = Settings()