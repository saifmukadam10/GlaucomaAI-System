# Deploying GlaucomaAI-System

The easiest resume-ready deployment is a Hugging Face Space using Docker. This
serves the React UI and FastAPI backend from one public URL.

## 1. Prepare secrets

Create a Groq API key and add it to your Space secrets:

```text
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant
```

Do not put API keys in React files or commit them to GitHub.

## 2. Push code to Hugging Face Spaces

Create a new Space:

- SDK: Docker
- Visibility: Public
- Hardware: CPU basic is okay for a demo, but prediction can be slow with these
  PyTorch models.

Then push this repository to the Space. Hugging Face will detect `Dockerfile`,
build the React app, install the Python backend, and run FastAPI on port `7860`.

## 3. Model weights

The local model weights are large. GitHub rejects files above 100 MB unless you
use Git LFS. For the simplest Hugging Face deployment, either:

- push this whole repository directly to the Hugging Face Space with Git LFS
  enabled for `models/weights/*`, or
- upload weights to a Hugging Face model repo and update the backend to download
  them at startup.

Current expected files:

```text
models/weights/resnet_feature_extractor.pth
models/weights/best_resnet_model.pth
models/weights/mask_cnn_refuge2.pth
models/weights/unet_vessel_segmentation.pth
models/weights/xgboost_model.pkl
```

## 4. Local run

Backend:

```bash
pip install -r requirements.txt
uvicorn app.app:app --host 127.0.0.1 --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

For local separated frontend/backend development, set:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000
```

In Docker production, leave `VITE_API_BASE_URL` unset so the UI calls `/predict`
and `/ask` on the same public app URL.

## 5. Resume link

Use the Space URL:

```text
Glaucoma Detection and Monitoring System
Live Demo: https://huggingface.co/spaces/<your-user>/<your-space>
Tech: React, FastAPI, PyTorch, XGBoost, Groq LLM API, Docker
```
