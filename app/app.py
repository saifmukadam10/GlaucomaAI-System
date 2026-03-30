from fastapi import FastAPI, UploadFile
import cv2
import numpy as np
import base64
from fastapi.middleware.cors import CORSMiddleware

from inference.pipeline import run_pipeline
from explainability.gradcam import generate_gradcam
from llm.ollama_service import ask_llm

app = FastAPI(title="Glaucoma AI System")

# ✅ CORS CONFIG
origins = [
    "http://localhost:8080",   
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # or ["*"] for all (not recommended for prod)
    allow_credentials=True,
    allow_methods=["*"],          # GET, POST, etc.
    allow_headers=["*"],          # allow all headers
)

# 🔥 Helper: Convert image → base64 string
def encode_image(image_array):
    # Ensure uint8 format
    if image_array.dtype != np.uint8:
        image_array = (image_array * 255).astype(np.uint8)

    _, buffer = cv2.imencode(".png", image_array)
    encoded = base64.b64encode(buffer).decode("utf-8")
    return encoded


@app.post("/predict")
async def predict(file: UploadFile):

    contents = await file.read()
    image = cv2.imdecode(np.frombuffer(contents, np.uint8), cv2.IMREAD_COLOR)

    result = run_pipeline(image)

    heatmap = generate_gradcam(image)

    # 🔥 Encode heatmap for JSON response
    heatmap_encoded = encode_image(heatmap)

    return {
        "prediction": result["prediction"],
        "cdr": result["cdr"],
        "vessel_risk": result["vessel_risk"],
        "gradcam": heatmap_encoded   # ✅ now renderable
    }


@app.post("/ask")
def ask(question: str):
    response = ask_llm(question)
    return {"answer": response}