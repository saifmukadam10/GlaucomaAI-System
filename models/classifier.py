import pickle
import os

def load_xgboost():
    model_path = os.path.join("models", "weights", "xgboost_model.pkl")

    print(f"📂 Loading XGBoost model from {model_path}")

    with open(model_path, "rb") as f:
        model = pickle.load(f)

    return model