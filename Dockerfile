FROM node:20-slim AS frontend-builder

WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci --silent

COPY frontend/ ./
RUN npm run build


FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
COPY --from=frontend-builder /frontend/dist ./static

ENV ENVIRONMENT=production
ENV PYTHONUNBUFFERED=1

EXPOSE 7860

CMD ["uvicorn", "app.app:app", "--host", "0.0.0.0", "--port", "7860", "--workers", "1"]
