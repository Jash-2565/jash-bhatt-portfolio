import { useEffect, useRef, useState } from 'react';
import * as ort from 'onnxruntime-web';

const INPUT_SIZE = 640;
const CONF_THRESHOLD = 0.2;
const IOU_THRESHOLD = 0.45;
const SIGMOID = (value: number) => 1 / (1 + Math.exp(-value));

const COCO_CLASSES = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
  'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat',
  'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack',
  'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
  'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
  'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
  'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair',
  'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse',
  'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
  'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier',
  'toothbrush'
];

type Detection = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  score: number;
  classId: number;
};

type PostprocessResult = {
  detections: Detection[];
  info: string;
};

const getBaseUrl = () => {
  try {
    // @ts-ignore: Vite environment
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) {
      // @ts-ignore
      return import.meta.env.BASE_URL;
    }
  } catch (e) {
    // Ignore
  }

  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && process.env.PUBLIC_URL) {
    // @ts-ignore
    return process.env.PUBLIC_URL;
  }

  return '/';
};

const baseUrl = getBaseUrl().replace(/\/$/, '');
const modelUrl = `${baseUrl}/models/yolov8s.onnx`;
const wasmBaseUrl = new URL(`${baseUrl}/onnxruntime/`, window.location.origin).toString();

const preprocess = (data: Uint8ClampedArray) => {
  const size = INPUT_SIZE * INPUT_SIZE;
  const floatData = new Float32Array(3 * size);
  for (let i = 0; i < size; i += 1) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    floatData[i] = r / 255;
    floatData[i + size] = g / 255;
    floatData[i + size * 2] = b / 255;
  }
  return floatData;
};

const iou = (a: Detection, b: Detection) => {
  const x1 = Math.max(a.x1, b.x1);
  const y1 = Math.max(a.y1, b.y1);
  const x2 = Math.min(a.x2, b.x2);
  const y2 = Math.min(a.y2, b.y2);
  const w = Math.max(0, x2 - x1);
  const h = Math.max(0, y2 - y1);
  const intersection = w * h;
  const areaA = Math.max(0, a.x2 - a.x1) * Math.max(0, a.y2 - a.y1);
  const areaB = Math.max(0, b.x2 - b.x1) * Math.max(0, b.y2 - b.y1);
  const union = areaA + areaB - intersection;
  return union === 0 ? 0 : intersection / union;
};

const nonMaxSuppression = (boxes: Detection[], threshold: number) => {
  const sorted = [...boxes].sort((a, b) => b.score - a.score);
  const results: Detection[] = [];

  while (sorted.length > 0) {
    const current = sorted.shift();
    if (!current) {
      break;
    }
    results.push(current);
    for (let i = sorted.length - 1; i >= 0; i -= 1) {
      if (iou(current, sorted[i]) > threshold) {
        sorted.splice(i, 1);
      }
    }
  }

  return results;
};

const decodeOutput = (
  data: Float32Array,
  channels: number,
  numDetections: number,
  isChannelsFirst: boolean,
  confThreshold: number
) => {
  const candidates: Detection[] = [];
  const hasObjectness = channels === COCO_CLASSES.length + 5;
  const numClasses = hasObjectness ? COCO_CLASSES.length : channels - 4;
  if (numClasses <= 0) {
    return candidates;
  }
  const classOffset = hasObjectness ? 5 : 4;

  for (let i = 0; i < numDetections; i += 1) {
    let bestScore = 0;
    let classId = 0;
    let seenLogits = false;

    for (let c = 0; c < numClasses; c += 1) {
      const index = isChannelsFirst
        ? (classOffset + c) * numDetections + i
        : i * channels + (classOffset + c);
      const rawScore = data[index];
      if (rawScore < 0 || rawScore > 1) {
        seenLogits = true;
      }
      const score = seenLogits ? SIGMOID(rawScore) : rawScore;
      if (score > bestScore) {
        bestScore = score;
        classId = c;
      }
    }

    let objectness = 1;
    if (hasObjectness) {
      const objIndex = isChannelsFirst
        ? 4 * numDetections + i
        : i * channels + 4;
      const rawObj = data[objIndex];
      objectness = rawObj < 0 || rawObj > 1 ? SIGMOID(rawObj) : rawObj;
    }

    const finalScore = bestScore * objectness;
    if (finalScore < confThreshold) {
      continue;
    }

    let x = isChannelsFirst ? data[i] : data[i * channels];
    let y = isChannelsFirst ? data[numDetections + i] : data[i * channels + 1];
    let w = isChannelsFirst ? data[numDetections * 2 + i] : data[i * channels + 2];
    let h = isChannelsFirst ? data[numDetections * 3 + i] : data[i * channels + 3];

    const maxVal = Math.max(x, y, w, h);
    if (maxVal > 0 && maxVal <= 2) {
      x *= INPUT_SIZE;
      y *= INPUT_SIZE;
      w *= INPUT_SIZE;
      h *= INPUT_SIZE;
    }

    const x1 = x - w / 2;
    const y1 = y - h / 2;
    const x2 = x + w / 2;
    const y2 = y + h / 2;

    candidates.push({ x1, y1, x2, y2, score: finalScore, classId });
  }

  return candidates;
};

const postprocess = (output: ort.Tensor, confThreshold: number, iouThreshold: number): PostprocessResult => {
  const data = output.data as Float32Array;
  const dims = output.dims;
  if (dims.length !== 3) {
    return { detections: [], info: `Unexpected output dims: ${dims.join('x')}` };
  }
  const [batch, dim1, dim2] = dims;
  if (batch !== 1) {
    return { detections: [], info: `Unexpected batch size: ${batch}` };
  }

  const channelsFirst = dim1 < dim2;
  const channelsA = channelsFirst ? dim1 : dim2;
  const detectionsA = channelsFirst ? dim2 : dim1;
  const candidatesA = decodeOutput(data, channelsA, detectionsA, channelsFirst, confThreshold);

  const channelsB = channelsFirst ? dim2 : dim1;
  const detectionsB = channelsFirst ? dim1 : dim2;
  const candidatesB = decodeOutput(data, channelsB, detectionsB, !channelsFirst, confThreshold);

  const candidates = candidatesB.length > candidatesA.length ? candidatesB : candidatesA;
  const filtered = candidates.filter((det) => det.score >= confThreshold);
  const detections = nonMaxSuppression(filtered, iouThreshold);
  const info = `LayoutA ${channelsA}x${detectionsA}: ${candidatesA.length} | LayoutB ${channelsB}x${detectionsB}: ${candidatesB.length}`;
  return { detections, info };
};

const YoloV8Demo = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sessionRef = useRef<ort.InferenceSession | null>(null);
  const inputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isProcessingRef = useRef(false);
  const isRunningRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastInferenceRef = useRef(0);
  const lastDebugRef = useRef(0);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState('Idle');
  const [debug, setDebug] = useState('Waiting for model');

  useEffect(() => {
    inputCanvasRef.current = document.createElement('canvas');
    return () => {
      stopDemo(false);
    };
  }, []);

  const loadModel = async () => {
    if (sessionRef.current) {
      return sessionRef.current;
    }
    setStatus('Loading model...');
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.wasmPaths = wasmBaseUrl;
    // Hint WebGL for faster inference when available.
    // @ts-ignore: onnxruntime-web webgl options
    ort.env.webgl = { powerPreference: 'high-performance' };

    let session: ort.InferenceSession;
    let providerLabel = 'wasm';
    try {
      session = await ort.InferenceSession.create(modelUrl, {
        executionProviders: ['webgl', 'wasm']
      });
      providerLabel = 'webgl';
    } catch (err) {
      session = await ort.InferenceSession.create(modelUrl, {
        executionProviders: ['wasm']
      });
    }
    sessionRef.current = session;
    setStatus('Model ready');
    setDebug(`Model loaded (${providerLabel}). Input: ${session.inputNames.join(', ')} | Output: ${session.outputNames.join(', ')}`);
    return session;
  };

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 640 },
        height: { ideal: 480 }
      },
      audio: false
    });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
  };

  const stopDemo = (resetState = true) => {
    if (resetState) {
      setIsRunning(false);
    }
    isRunningRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const renderLoop = async () => {
    if (!isRunningRef.current) {
      return;
    }
    rafRef.current = requestAnimationFrame(renderLoop);
    if (isProcessingRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const inputCanvas = inputCanvasRef.current;
    const session = sessionRef.current;
    const now = performance.now();
    if (!video || !canvas || !inputCanvas || !session) {
      if (now - lastDebugRef.current > 1000) {
        setDebug('Waiting for video, canvas, or model session');
        lastDebugRef.current = now;
      }
      return;
    }

    if (video.readyState < 2) {
      if (now - lastDebugRef.current > 1000) {
        setDebug('Waiting for video stream');
        lastDebugRef.current = now;
      }
      return;
    }

    const previous = lastInferenceRef.current;
    if (now - previous < 250) {
      return;
    }
    lastInferenceRef.current = now;

    if (!video.videoWidth || !video.videoHeight) {
      if (now - lastDebugRef.current > 1000) {
        setDebug('Waiting for video dimensions');
        lastDebugRef.current = now;
      }
      return;
    }

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    inputCanvas.width = INPUT_SIZE;
    inputCanvas.height = INPUT_SIZE;
    const inputCtx = inputCanvas.getContext('2d', { willReadFrequently: true });
    if (!inputCtx) {
      return;
    }

    inputCtx.drawImage(video, 0, 0, INPUT_SIZE, INPUT_SIZE);
    const imageData = inputCtx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE);
    const tensor = new ort.Tensor('float32', preprocess(imageData.data), [1, 3, INPUT_SIZE, INPUT_SIZE]);

    isProcessingRef.current = true;
    try {
      const feeds = { [session.inputNames[0]]: tensor };
      const results = await session.run(feeds);
      const output = results[session.outputNames[0]] as ort.Tensor;
      const result = postprocess(output, CONF_THRESHOLD, IOU_THRESHOLD);
      setDebug(`Output: ${output.dims.join('x')} | ${result.info} | NMS: ${result.detections.length}`);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.font = '14px ui-sans-serif, system-ui, -apple-system, sans-serif';

      const scaleX = canvas.width / INPUT_SIZE;
      const scaleY = canvas.height / INPUT_SIZE;

      result.detections.forEach((det) => {
        const x1 = det.x1 * scaleX;
        const y1 = det.y1 * scaleY;
        const x2 = det.x2 * scaleX;
        const y2 = det.y2 * scaleY;

        ctx.strokeStyle = 'rgba(16, 185, 129, 0.95)';
        ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
        ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

        const label = `${COCO_CLASSES[det.classId] ?? 'object'} ${(det.score * 100).toFixed(0)}%`;
        const textWidth = ctx.measureText(label).width;
        const labelY = Math.max(18, y1);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(x1, labelY - 16, textWidth + 8, 18);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, x1 + 4, labelY - 3);
      });

    } catch (err) {
      setStatus('Inference error');
      setDebug('Inference failed');
      setIsRunning(false);
      isRunningRef.current = false;
    } finally {
      isProcessingRef.current = false;
    }
  };

  const handleStart = async () => {
    try {
      setStatus('Initializing...');
      await loadModel();
      await startCamera();
      isRunningRef.current = true;
      setIsRunning(true);
      setStatus('Running');
      renderLoop();
    } catch (err) {
      setStatus('Camera or model error');
      setIsRunning(false);
      isRunningRef.current = false;
    }
  };

  const handleStop = () => {
    stopDemo();
    setStatus('Stopped');
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">Live Webcam Detection</h4>
          <p className="text-sm text-slate-500">Model: `public/models/yolov8s.onnx`</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            {status}
          </span>
        </div>
      </div>
      <p className="text-xs text-slate-500 mb-3">{debug}</p>

      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950">
        <video ref={videoRef} className="w-full h-auto block" muted playsInline />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        {!isRunning && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 text-slate-200 text-sm">
            Click start to enable webcam
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mt-5">
        <button
          type="button"
          onClick={handleStart}
          disabled={isRunning}
          className="px-4 py-2 rounded-full bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Start Demo
        </button>
        <button
          type="button"
          onClick={handleStop}
          className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition"
        >
          Stop
        </button>
      </div>
    </div>
  );
};

export default YoloV8Demo;
