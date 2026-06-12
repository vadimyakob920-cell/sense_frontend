import { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js'
import { FaUserShield, FaCheckCircle, FaTimesCircle, FaTimes } from 'react-icons/fa'
import { TbFaceId } from 'react-icons/tb'

const FaceVerificationModal = ({ isOpen, onClose, onSubmit }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [faceDetected, setFaceDetected] = useState(false)
  const [streamStarted, setStreamStarted] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const loadModelsAndStartVideo = async () => {
      const MODEL_URL = '/models'
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ])

      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      videoRef.current.srcObject = stream
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play()
        setStreamStarted(true)
      }
    }

    loadModelsAndStartVideo()
  }, [isOpen])

  useEffect(() => {
    if (!streamStarted) return

    const video = videoRef.current
    const canvas = canvasRef.current

    const detectFace = async () => {
      if (!video || video.readyState !== 4) return

      const result = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()

      const dims = video.getBoundingClientRect()
      canvas.width = dims.width
      canvas.height = dims.height

      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (result) {
        const resized = faceapi.resizeResults(result, dims)
        faceapi.draw.drawFaceLandmarks(canvas, resized)
        setFaceDetected(true)
      } else {
        setFaceDetected(false)
      }
    }

    const interval = setInterval(detectFace, 500)
    return () => clearInterval(interval)
  }, [streamStarted])

  const accept = () => {
    if (!faceDetected) return

    // Create an offscreen canvas for resizing
    const targetWidth = 640 // adjust as needed
    const targetHeight = 480 // adjust as needed

    const captureCanvas = document.createElement('canvas')
    captureCanvas.width = targetWidth
    captureCanvas.height = targetHeight

    const ctx = captureCanvas.getContext('2d')

    // Draw the current video frame scaled to target size
    ctx.drawImage(
      videoRef.current,
      0,
      0,
      videoRef.current.videoWidth,
      videoRef.current.videoHeight, // source
      0,
      0,
      targetWidth,
      targetHeight // destination
    )

    // Convert to Blob for secure upload
    captureCanvas.toBlob(
      (blob) => {
        if (onSubmit) {
          onSubmit(blob) // send blob to server
        }
      },
      'image/jpeg',
      0.9
    ) // JPEG with 90% quality
  }

  return (
    <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box max-w-3xl bg-base-100 rounded-xl shadow-xl space-y-5 p-0 overflow-hidden">
        {/* Header - minimal, no border */}
        <div className="flex items-center justify-between px-5 pt-5 select-none">
          <div className="flex items-center gap-3">
            <FaUserShield className="text-primary text-2xl" />
            <h3 className="font-bold text-xl">Secure Face Check</h3>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Instructions */}
        <p className="text-sm text-gray-500 text-center px-5 select-none">
          Align your face within the frame. Our AI is analyzing in real time.
        </p>

        {/* Video feed with floating status */}
        <div className="relative w-full aspect-video bg-black">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />

          {/* Floating AI status */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full backdrop-blur-md bg-black/40 flex items-center gap-2 text-white text-sm font-medium shadow-md select-none">
            {faceDetected ? (
              <>
                <FaCheckCircle className="text-green-400" />
                <span>Detected</span>
              </>
            ) : (
              <>
                <FaTimesCircle className="text-red-400" />
                <span>Scanning…</span>
              </>
            )}
          </div>
        </div>

        {/* Actions - minimal, no border */}
        <div className="flex justify-end gap-3 px-5 pb-5">
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary gap-2" onClick={accept} disabled={!faceDetected}>
            <TbFaceId size={20} />
            Submit
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default FaceVerificationModal
