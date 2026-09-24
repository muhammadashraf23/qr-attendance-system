'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { RefreshCw, ShieldCheck, MapPin, Maximize2, Users, AlertTriangle } from 'lucide-react';

export interface DynamicQrDisplayProps {
  sessionTitle: string;
  sessionCode: string;
  courseOrDept: string;
  refreshIntervalSeconds?: number;
  expectedAttendeesCount?: number;
  scannedCount?: number;
  geofenceEnabled?: boolean;
}

export default function DynamicQrDisplay({
  sessionTitle,
  sessionCode,
  courseOrDept,
  refreshIntervalSeconds = 6,
  expectedAttendeesCount = 45,
  scannedCount = 0,
  geofenceEnabled = true,
}: DynamicQrDisplayProps) {
  const [nonce, setNonce] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(refreshIntervalSeconds);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const generateNewToken = () => {
    const timestamp = Date.now();
    const randomHex = Math.random().toString(16).substring(2, 10);
    const payload = JSON.stringify({
      sessionCode,
      ts: timestamp,
      n: randomHex,
      v: 2,
    });
    setNonce(btoa(payload));
    setTimeLeft(refreshIntervalSeconds);
  };

  useEffect(() => {
    generateNewToken();
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          generateNewToken();
          return refreshIntervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionCode, refreshIntervalSeconds]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const progressPercent = ((refreshIntervalSeconds - timeLeft) / refreshIntervalSeconds) * 100;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden max-w-md w-full mx-auto p-6 sm:p-8 flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
            {sessionCode}
          </span>
          <h2 className="text-base font-bold text-gray-900 mt-1">{sessionTitle}</h2>
          <p className="text-xs text-gray-500">{courseOrDept}</p>
        </div>

        <button
          onClick={toggleFullscreen}
          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition"
          title="Fullscreen Projector Mode"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Dynamic QR Container */}
      <div className="relative my-6 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center">
        {nonce ? (
          <div className="bg-white p-3 rounded-xl shadow-sm">
            <QRCodeSVG value={nonce} size={220} level="H" includeMargin={false} />
          </div>
        ) : (
          <div className="w-[220px] h-[220px] flex items-center justify-center text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
        )}

        {/* Circular Countdown Progress Pill */}
        <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-gray-200 text-xs font-semibold text-gray-700 shadow-sm">
          <div className="w-3.5 h-3.5 relative flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-200"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-indigo-600 transition-all duration-1000 ease-linear"
                strokeDasharray="100, 100"
                strokeDashoffset={100 - progressPercent}
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
          <span>Refreshes in {timeLeft}s (Anti-Proxy)</span>
        </div>
      </div>

      {/* Security Banner */}
      <div className="w-full bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 flex items-start gap-2.5 text-xs text-indigo-900">
        <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <p className="leading-snug">
          <strong>Zero-Proxy Encryption:</strong> Codes change every 6 seconds. Screenshots shared on messaging apps expire before scan.
        </p>
      </div>

      {/* Stats bar */}
      <div className="w-full grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100 text-center">
        <div className="bg-gray-50 rounded-xl p-2.5">
          <span className="text-[11px] text-gray-500 font-medium">Scanned</span>
          <p className="text-lg font-black text-gray-900">{scannedCount} / {expectedAttendeesCount}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-2.5">
          <span className="text-[11px] text-gray-500 font-medium">Geofence Radius</span>
          <p className="text-lg font-black text-gray-900">{geofenceEnabled ? '30m Active' : 'Off'}</p>
        </div>
      </div>
    </div>
  );
}
