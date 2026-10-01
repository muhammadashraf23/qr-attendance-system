'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Camera, CheckCircle, Loader } from 'lucide-react';
import api from '@/utils/api';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
const CONFIDENCE = 0.85;

const STATUS = {
  INIT: 'init',
  READY: 'ready',
  SCANNING: 'scanning',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;

type StatusType = (typeof STATUS)[keyof typeof STATUS];

interface FaceScannerProps {
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

export default function FaceScanner({ onSuccess, onCancel }: FaceScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<any>(null);

  const [status, setStatus] = useState<StatusType>(STATUS.INIT);
  const [message, setMessage] = useState('Loading face recognition models...');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [faceApi, setFaceApi] = useState<any>(null);

  async function startCamera(fapi: any) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setStatus(STATUS.READY);
          setMessage('Position your face in the frame');
          startDetection(fapi);
        };
      }
    } catch {
      setMessage('Camera access denied. Please allow camera and try again.');
      setStatus(STATUS.FAILED);
    }
  }

  function stopCamera() {
    clearInterval(intervalRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  const startDetection = useCallback((fapi: any) => {
    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;
      try {
        const detection = await fapi
          .detectSingleFace(videoRef.current, new fapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detection) {
          setMessage('No face detected — please center your face');
          return;
        }

        if (canvasRef.current && videoRef.current) {
          const dims = fapi.matchDimensions(canvasRef.current, videoRef.current, true);
          const resized = fapi.resizeResults(detection, dims);
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            fapi.draw.drawDetections(canvasRef.current, resized);
            fapi.draw.drawFaceLandmarks(canvasRef.current, resized);
          }
        }

        const score = detection.detection.score;
        if (score >= CONFIDENCE) {
          clearInterval(intervalRef.current);
          setStatus(STATUS.SCANNING);
          setMessage('Face detected! Verifying identity...');

          const embedding = Array.from(detection.descriptor);
          await verifyWithBackend(embedding);
        } else {
          setMessage(`Detection score: ${(score * 100).toFixed(0)}% — move closer`);
        }
      } catch (_) {}
    }, 800);
  }, []);

  function getGPS(): Promise<Record<string, any>> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve({});
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
        () => resolve({})
      );
    });
  }

  async function verifyWithBackend(embedding: any) {
    try {
      const location = await getGPS();
      const { data } = await api.post('/face/verify', {
        embedding,
        ...location,
        device_id: navigator.userAgent.slice(0, 80),
      });

      if (data.success) {
        const actionData = {
          employee_id: data.data.employee_id,
          ...location,
          method: 'face',
          device_id: navigator.userAgent.slice(0, 80),
        };

        try {
          await api.post('/attendance/check-in', actionData);
        } catch (err: any) {
          if (err.response?.data?.error !== 'ALREADY_CHECKED_IN')
            console.warn('Check-in after face:', err.response?.data?.message);
        }

        setResult(data.data);
        setStatus(STATUS.SUCCESS);
        setMessage(`Welcome, ${data.data.employee_name || data.data.name}!`);
        stopCamera();
        onSuccess?.(data.data);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Face not recognized.';
      toast.error(msg);
      setStatus(STATUS.READY);
      setMessage('Not recognized — please try again');
      startDetection(faceApi);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function loadModels() {
      try {
        setMessage('Loading models (1/3)...');
        setProgress(10);
        const fapi = await import('face-api.js');

        setMessage('Loading face detector (2/3)...');
        setProgress(40);
        await fapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);

        setMessage('Loading face recognizer (3/3)...');
        setProgress(75);
        await fapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await fapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

        if (!mounted) return;
        setProgress(100);
        setFaceApi(fapi);
        setMessage('Models loaded. Starting camera...');
        await startCamera(fapi);
      } catch (err) {
        console.error('face-api load error:', err);
        setMessage('Failed to load face recognition models. Use QR code instead.');
        setStatus(STATUS.FAILED);
      }
    }

    loadModels();
    return () => {
      mounted = false;
      stopCamera();
    };
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full mx-auto border border-zinc-200">
      <div className="text-center mb-4">
        <Camera className="w-8 h-8 text-black mx-auto mb-2" />
        <h2 className="font-bold text-gray-800 text-lg">Face Recognition</h2>
        <p className="text-sm text-gray-500">{message}</p>
      </div>

      {status === STATUS.INIT && (
        <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
          <div
            className="bg-black h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div
        className="relative mb-4 rounded-2xl overflow-hidden bg-gray-900"
        style={{ aspectRatio: '4/3' }}
      >
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {status === STATUS.SCANNING && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="text-center text-white">
              <Loader className="w-10 h-10 animate-spin mx-auto mb-2" />
              <p className="text-sm font-medium">Verifying...</p>
            </div>
          </div>
        )}

        {status === STATUS.SUCCESS && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center text-white">
              <CheckCircle className="w-16 h-16 mx-auto mb-2 text-white" />
              <p className="font-bold text-lg">{result?.employee_name || result?.name}</p>
              <p className="text-sm opacity-80">Attendance recorded ✓</p>
            </div>
          </div>
        )}

        {(status === STATUS.READY || status === STATUS.SCANNING) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-56 border-4 border-white rounded-full opacity-60" />
          </div>
        )}
      </div>

      {status === STATUS.READY && (
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <div className="flex-1 bg-gray-100 rounded-full h-1.5">
            <div className="bg-black h-1.5 rounded-full w-0 transition-all" />
          </div>
          <span>Confidence threshold: ${(CONFIDENCE * 100).toFixed(0)}%</span>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => {
            stopCamera();
            onCancel?.();
          }}
          className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
        >
          Use QR Instead
        </button>
        {status === STATUS.FAILED && (
          <button onClick={() => window.location.reload()} className="btn-primary flex-1 text-sm py-2.5">
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
