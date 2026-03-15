export const YOLOV8_CODE = `import cv2
import torch
import time
import numpy as np
import argparse
import os
from threading import Thread, Lock
from ultralytics import YOLO


class VideoStream:
    """Threaded video capture with latest-frame approach."""
    def __init__(self, src=0, width=640, height=480):
        self.stream = cv2.VideoCapture(src)
        if not self.stream.isOpened():
            raise Exception("Cannot open camera")
        self.stream.set(cv2.CAP_PROP_FRAME_WIDTH, width)
        self.stream.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
        self.lock = Lock()
        self.frame = None
        self.stopped = False

    def start(self):
        Thread(target=self.update, daemon=True).start()
        return self

    def update(self):
        while not self.stopped:
            grabbed, frame = self.stream.read()
            if grabbed:
                with self.lock:
                    self.frame = frame

    def read(self):
        with self.lock:
            return self.frame.copy() if self.frame is not None else None

    def stop(self):
        self.stopped = True
        self.stream.release()


class InferenceThread:
    """Threaded YOLO inference, processing only the latest frame."""
    def __init__(self, model_path="yolov8s.pt", device="cpu", conf_thresh=0.3):
        self.model = YOLO(model_path).to(device)

        if device == "cuda":
            self.model.model.half()

        self.conf_thresh = conf_thresh
        self.latest_frame = None
        self.result = None
        self.lock = Lock()
        self.stopped = False

    def start(self):
        Thread(target=self.run_inference, daemon=True).start()
        return self

    def run_inference(self):
        while not self.stopped:
            frame = None
            with self.lock:
                if self.latest_frame is not None:
                    frame = self.latest_frame.copy()

            if frame is not None:
                results = self.model.predict(frame, conf=self.conf_thresh, iou=0.45, imgsz=640)
                with self.lock:
                    self.result = (frame, results)

    def process_frame(self, frame):
        with self.lock:
            self.latest_frame = frame

    def get_results(self):
        with self.lock:
            return self.result

    def stop(self):
        self.stopped = True


def draw_boxes(frame, results, names):
    if results is None:
        return frame

    for result in results:
        for box in result.boxes:
            confidence = box.conf[0].item()

            x1, y1, x2, y2 = map(int, box.xyxy[0])
            class_id = int(box.cls[0].item())
            label = names.get(class_id, "Unknown")
            color = (0, 255, 0)

            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            label_text = f"{label} ({confidence:.2f})"
            cv2.putText(frame, label_text, (x1, y1 - 5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
    return frame


def main():
    parser = argparse.ArgumentParser(description="YOLOv8 Live Detection")
    parser.add_argument('--model', type=str, default="yolov8s.pt", help="Name of YOLO model file")
    parser.add_argument('--src', type=int, default=0, help="Camera source index")
    parser.add_argument('--width', type=int, default=640, help="Frame width")
    parser.add_argument('--height', type=int, default=480, help="Frame height")
    parser.add_argument('--conf_thresh', type=float, default=0.3, help="Confidence threshold")
    parser.add_argument('--max_fps', type=int, default=60, help="Limit FPS")
    args = parser.parse_args()

    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(script_dir, args.model)

    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Model file not found at {model_path}."
        )

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")
    print(f"Loading YOLO model from: {model_path}")

    vs = VideoStream(src=args.src, width=args.width, height=args.height).start()
    inference = InferenceThread(model_path=model_path, device=device, conf_thresh=args.conf_thresh).start()
    time.sleep(1)

    cv2.namedWindow("YOLO Object Detection", cv2.WINDOW_NORMAL)
    cv2.resizeWindow("YOLO Object Detection", args.width, args.height)

    fps = 0
    frame_count = 0
    start_time = time.time()
    min_frame_time = 1.0 / args.max_fps

    try:
        while True:
            loop_start = time.time()

            frame = vs.read()
            if frame is None:
                continue

            inference.process_frame(frame)
            result_data = inference.get_results()

            if result_data:
                frame, results = result_data
                frame = draw_boxes(frame, results, inference.model.names)

            frame_count += 1
            elapsed_time = time.time() - start_time
            if elapsed_time >= 1:
                fps = frame_count / elapsed_time
                frame_count = 0
                start_time = time.time()

            cv2.putText(frame, f"FPS: {fps:.2f}", (20, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

            cv2.imshow("YOLO Object Detection", frame)

            frame_time = time.time() - loop_start
            sleep_time = max(0, min_frame_time - frame_time - 0.002)
            time.sleep(sleep_time)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    except KeyboardInterrupt:
        print("Interrupted by user")
    finally:
        vs.stop()
        inference.stop()
        cv2.destroyAllWindows()


if __name__ == '__main__':
    main()
`;
