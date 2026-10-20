/**
 * Webcam with hand landmarks drawn on top.
 *
 * The MediaPipe parts — createFromOptions and its option values, the
 * detectForVideo call, the canvas clip and the drawConnectors/drawLandmarks
 * calls — are taken from the official MediaPipe web samples:
 *   https://github.com/google-ai-edge/mediapipe-samples-web
 *   src/workers/hand-landmarker.worker.ts, src/tasks/hand-landmarker.ts
 *
 *   Copyright 2026 The MediaPipe Authors.
 *   Licensed under the Apache License, Version 2.0
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * The camera picture never leaves the browser. Only landmark numbers are
 * passed on, through onLandmarks.
 */
import {
  DrawingUtils,
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult,
} from "@mediapipe/tasks-vision"
import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"

const WASM_PATH =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm"
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"

type Status = "idle" | "starting" | "running" | "error"

interface HandTrackerProps {
  onLandmarks?: (result: HandLandmarkerResult) => void
}

export function HandTracker({ onLandmarks }: HandTrackerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const landmarkerRef = useRef<HandLandmarker | null>(null)
  const frameRef = useRef<number | null>(null)
  const lastTimeRef = useRef(-1)
  const [status, setStatus] = useState<Status>("idle")
  const { t } = useTranslation()

  const stop = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
    const video = videoRef.current
    const stream = video?.srcObject as MediaStream | null
    for (const track of stream?.getTracks() ?? []) {
      track.stop()
    }
    if (video) {
      video.srcObject = null
    }
    landmarkerRef.current?.close()
    landmarkerRef.current = null
    setStatus("idle")
  }, [])

  useEffect(() => stop, [stop])

  const detect = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const landmarker = landmarkerRef.current
    if (!video || !canvas || !landmarker) {
      return
    }

    if (video.currentTime !== lastTimeRef.current && video.videoWidth > 0) {
      lastTimeRef.current = video.currentTime
      const result = landmarker.detectForVideo(video, performance.now())

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.beginPath()
        ctx.rect(0, 0, canvas.width, canvas.height)
        ctx.clip()

        const drawingUtils = new DrawingUtils(ctx)
        for (const landmarks of result.landmarks) {
          drawingUtils.drawConnectors(
            landmarks,
            HandLandmarker.HAND_CONNECTIONS,
            { color: "#00FF00", lineWidth: 5 },
          )
          drawingUtils.drawLandmarks(landmarks, {
            color: "#FF0000",
            lineWidth: 2,
          })
        }
      }

      onLandmarks?.(result)
    }

    frameRef.current = requestAnimationFrame(detect)
  }, [onLandmarks])

  const start = useCallback(async () => {
    setStatus("starting")
    try {
      const vision = await FilesetResolver.forVisionTasks(WASM_PATH)
      landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
        runningMode: "VIDEO",
      })

      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      const video = videoRef.current
      if (!video) {
        return
      }
      video.srcObject = stream
      await video.play()

      setStatus("running")
      frameRef.current = requestAnimationFrame(detect)
    } catch {
      stop()
      setStatus("error")
    }
  }, [detect, stop])

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-xl border bg-muted">
        <video
          ref={videoRef}
          className="w-full -scale-x-100"
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full -scale-x-100"
        />
      </div>

      <div className="flex items-center gap-3">
        {status === "running" ? (
          <Button variant="outline" onClick={stop}>
            {t("camera.stop")}
          </Button>
        ) : (
          <Button onClick={start} disabled={status === "starting"}>
            {status === "starting" ? t("camera.starting") : t("camera.start")}
          </Button>
        )}
        {status === "error" && (
          <p className="text-sm text-destructive">{t("camera.error")}</p>
        )}
      </div>
    </div>
  )
}
