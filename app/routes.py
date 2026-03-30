from fastapi import APIRouter, UploadFile
import cv2
import numpy as np

from inference.pipeline import run_pipeline
from explainability.gradcam import generate_gradcam
from llm.ollama_service import ask_llm
from monitoring.patient_db import save_visit
from monitoring.progression_analysis import predict_progression
from app.schemas import QuestionRequest

router = APIRouter()


@router.post("/predict")
async def predict(file: UploadFile, patient_id: str):

    contents = await file.read()

    image = cv2.imdecode(
        np.frombuffer(contents, np.uint8),
        cv2.IMREAD_COLOR
    )

    result = run_pipeline(image)

    save_visit(patient_id, result["cdr"])

    heatmap = generate_gradcam(image)

    return {
        "prediction": result["prediction"],
        "cdr": result["cdr"],
        "vessel_risk": result["vessel_risk"],
        "disc_box": result["disc_box"],
        "cup_box": result["cup_box"],
        "detections": result.get("detections", []),
        "image_width": int(result["image_width"]),
        "image_height": int(result["image_height"]),
        "gradcam": heatmap
    }


@router.post("/ask")
def ask_llm_question(data: QuestionRequest):

    response = ask_llm(data.question)

    return {"answer": response}