---
title: GlaucomaAI System
emoji: 👁️
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
pinned: false
---

glaucoma-ai-system/

│
├── app/
│   ├── app.py
│   ├── routes.py
│   └── schemas.py
│
├── core/
│   ├── config.py
│   └── model_loader.py
│
├── inference/
│   ├── pipeline.py
│   └── feature_builder.py
│
├── models/
│   ├── weights/
│   │   ├── resnet_feature_extractor.pth
│   │   ├── rcnn_detector.pth
│   │   ├── unet_vessel_segmentation.pth
│   │   └── xgboost_model.pkl
│   │
│   ├── feature_extractor.py
│   ├── disc_cup_detector.py
│   ├── vessel_segmenter.py
│   └── classifier.py
│
├── explainability/
│   └── gradcam.py
│
├── llm/
│   └── ollama_service.py
│
├── monitoring/
│   ├── patient_db.py
│   ├── progression_analysis.py
│   └── cdr_plot.py
│
├── utils/
│   ├── preprocessing.py
│   ├── cdr_calculation.py
│   └── vessel_density.py
│
├── data/
│   └── patient_records.json
│
├── tests/
│
├── requirements.txt
└── README.md
