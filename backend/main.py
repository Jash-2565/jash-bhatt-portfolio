import base64
import json
import os
from threading import Lock
from typing import List

import cv2
import numpy as np
import torch
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.getenv("MODEL_PATH", os.path.expanduser("~/Desktop/yolov5su.pt"))
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
_model_lock = Lock()
_model = None
_model_source = None


def get_model():
    global _model, _model_source
    if _model is None:
        with _model_lock:
            if _model is None:
                if os.path.exists(MODEL_PATH):
                    _model_source = MODEL_PATH
                else:
                    _model_source = os.path.basename(MODEL_PATH)
                _model = YOLO(_model_source).to(DEVICE)
    return _model


@app.get("/health")
def health():
    return {
        "status": "ok",
        "device": DEVICE,
        "model": MODEL_PATH,
        "model_loaded": _model is not None,
        "model_source": _model_source,
    }


def _decode_image(data_url: str) -> np.ndarray:
    if "," in data_url:
        _, data_url = data_url.split(",", 1)
    image_bytes = base64.b64decode(data_url)
    image_array = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    if frame is None:
        raise ValueError("Failed to decode image.")
    return frame


def _serialize_detections(results) -> List[dict]:
    detections = []
    for result in results:
        for box in result.boxes:
            conf = float(box.conf[0])
            cls = int(box.cls[0])
            x1, y1, x2, y2 = map(float, box.xyxy[0])
            detections.append(
                {
                    "x1": x1,
                    "y1": y1,
                    "x2": x2,
                    "y2": y2,
                    "conf": conf,
                    "cls": cls,
                    "name": result.names.get(cls, "object"),
                }
            )
    return detections


@app.websocket("/ws")
async def yolo_ws(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            message = await websocket.receive_text()
            payload = json.loads(message)
            data_url = payload.get("image")
            if not data_url:
                await websocket.send_text(json.dumps({"detections": []}))
                continue

            frame = _decode_image(data_url)
            model = get_model()
            results = model(frame, verbose=False)
            detections = _serialize_detections(results)
            response = {
                "width": frame.shape[1],
                "height": frame.shape[0],
                "detections": detections,
            }
            await websocket.send_text(json.dumps(response))
    except Exception:
        await websocket.close()
