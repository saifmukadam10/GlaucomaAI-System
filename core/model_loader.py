import torch
import xgboost as xgb
from models.feature_extractor import load_resnet          
from models.feature_extractor_gradcam import load_resnet_gradcam  
from models.disc_cup_detector import load_rcnn
from models.vessel_segmenter import load_unet
from models.classifier import load_xgboost


class ModelLoader:
    def __init__(self):
        self.resnet = load_resnet()
        self.resnetGradcam = load_resnet_gradcam()
        self.rcnn = load_rcnn()
        self.unet = load_unet()
        self.xgb = load_xgboost()


models = ModelLoader()