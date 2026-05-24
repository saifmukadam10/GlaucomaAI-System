    # from fastapi import FastAPI, UploadFile
    # import cv2
    # import numpy as np
    # import base64
    # from fastapi.middleware.cors import CORSMiddleware

    # from inference.pipeline import run_pipeline
    # from explainability.gradcam import generate_gradcam
    # from llm.ollama_service import ask_llm
    # from app.schemas import QuestionRequest, LLMResponse

    # app = FastAPI(title="Glaucoma AI System")

    # # ✅ CORS CONFIG
    # origins = [
    #     "http://localhost:8080",   
    #     "http://127.0.0.1:3000",
    # ]

    # app.add_middleware(
    #     CORSMiddleware,
    #     allow_origins=origins,        # or ["*"] for all (not recommended for prod)
    #     allow_credentials=True,
    #     allow_methods=["*"],          # GET, POST, etc.
    #     allow_headers=["*"],          # allow all headers
    # )

    # # 🔥 Helper: Convert image → base64 string
    # def encode_image(image_array):
    #     # Ensure uint8 format
    #     if image_array.dtype != np.uint8:
    #         image_array = (image_array * 255).astype(np.uint8)

    #     _, buffer = cv2.imencode(".png", image_array)
    #     encoded = base64.b64encode(buffer).decode("utf-8")
    #     return encoded


    # @app.post("/predict")
    # async def predict(file: UploadFile):

    #     contents = await file.read()
    #     image = cv2.imdecode(np.frombuffer(contents, np.uint8), cv2.IMREAD_COLOR)

    #     result = run_pipeline(image)

    #     # UNet vessel mask -> base64 black/white PNG for the UI
    #     vessel_bw_encoded = ""
    #     vessel_mask = result.get("vessel_mask")
    #     if vessel_mask is not None:
    #         # Ensure uint8 so cv2.imencode renders correctly
    #         vessel_bw = vessel_mask
    #         if vessel_bw.dtype != np.uint8:
    #             # If mask is 0..1, scale; otherwise just cast.
    #             vessel_bw = (vessel_bw * 255).astype(np.uint8) if vessel_bw.max() <= 1 else vessel_bw.astype(np.uint8)
    #         vessel_bw_encoded = encode_image(vessel_bw)

    #     heatmap = generate_gradcam(image)
        
    #     heatmap = (heatmap * 255).astype(np.uint8)
    #     heatmap_color = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

    #     overlay = cv2.addWeighted(image, 0.6, heatmap_color, 0.4, 0)

    #     heatmap_encoded = encode_image(overlay)

    #     return {
    #         "prediction": result["prediction"],
    #         "cdr": result["cdr"],
    #         "vessel_risk": result["vessel_risk"],
    #         "disc_box": result["disc_box"],
    #         "cup_box": result["cup_box"],
    #         "detections": result.get("detections", []),
    #         "image_width": int(result["image_width"]),
    #         "image_height": int(result["image_height"]),
    #         "gradcam": heatmap_encoded,   # ✅ now renderable
    #         "vessel_bw": vessel_bw_encoded,  # ✅ now renderable
    #     }


    # @app.post("/ask", response_model=LLMResponse)
    # async def ask(data: QuestionRequest):
    #     """
    #     Ask the glaucoma-specialized LLM a question.
    #     Accepts a JSON body: { "question": "..." }.
    #     """
    #     answer = ask_llm(data.question)
    #     return {"answer": answer}
from fastapi import FastAPI, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import base64
import os

from inference.pipeline import run_pipeline
from explainability.gradcam import generate_gradcam
from app.schemas import QuestionRequest, LLMResponse

app = FastAPI(title="Glaucoma AI System", version="0.1.0")

# ── CORS ──────────────────────────────────────────────────────────────────────
# In production (HF Spaces) the React build is served by FastAPI itself,
# so CORS is only needed for local dev.
IS_PROD = os.environ.get("ENVIRONMENT", "development") == "production"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if not IS_PROD else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Helpers ───────────────────────────────────────────────────────────────────
def encode_image(image_array: np.ndarray) -> str:
    """Convert a numpy image array to a base64-encoded PNG string."""
    if image_array.dtype != np.uint8:
        image_array = (image_array * 255).astype(np.uint8) \
            if image_array.max() <= 1 else image_array.astype(np.uint8)
    _, buffer = cv2.imencode(".png", image_array)
    return base64.b64encode(buffer).decode("utf-8")


# ── API Routes ────────────────────────────────────────────────────────────────
@app.post("/predict")
async def predict(file: UploadFile):
    contents = await file.read()
    image = cv2.imdecode(np.frombuffer(contents, np.uint8), cv2.IMREAD_COLOR)

    result = run_pipeline(image)

    # Vessel mask → base64 B&W PNG
    vessel_bw_encoded = ""
    vessel_mask = result.get("vessel_mask")
    if vessel_mask is not None:
        vessel_bw = vessel_mask
        if vessel_bw.dtype != np.uint8:
            vessel_bw = (vessel_bw * 255).astype(np.uint8) \
                if vessel_bw.max() <= 1 else vessel_bw.astype(np.uint8)
        vessel_bw_encoded = encode_image(vessel_bw)

    # GradCAM heatmap overlay
    heatmap = generate_gradcam(image)
    heatmap = (heatmap * 255).astype(np.uint8)
    heatmap_color = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(image, 0.6, heatmap_color, 0.4, 0)
    heatmap_encoded = encode_image(overlay)

    return {
        "prediction":   result["prediction"],
        "cdr":          result["cdr"],
        "vessel_risk":  result["vessel_risk"],
        "disc_box":     result["disc_box"],
        "cup_box":      result["cup_box"],
        "detections":   result.get("detections", []),
        "image_width":  int(result["image_width"]),
        "image_height": int(result["image_height"]),
        "gradcam":      heatmap_encoded,
        "vessel_bw":    vessel_bw_encoded,
    }


@app.post("/ask", response_model=LLMResponse)
async def ask(data: QuestionRequest):
    """Ask the glaucoma-specialized LLM a question."""
    # Import here so the LLM provider can be configured without slowing app startup.
    from llm.ollama_service import ask_llm
    answer = ask_llm(data.question)
    return {"answer": answer}


# ── Static / React Frontend ───────────────────────────────────────────────────
# The built React app lives in /app/static (copied there by the Dockerfile).
# This block must come AFTER all API routes so /predict and /ask are not
# shadowed by the catch-all.
_static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
if os.path.isdir(_static_dir):
    # Serve Vite's hashed asset chunks (JS, CSS, images)
    _assets_dir = os.path.join(_static_dir, "assets")
    if os.path.isdir(_assets_dir):
        app.mount("/assets", StaticFiles(directory=_assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_react(full_path: str):
        """Return index.html for every non-API path (client-side routing)."""
        return FileResponse(os.path.join(_static_dir, "index.html"))
