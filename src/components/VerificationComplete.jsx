import { useState } from 'react'
import { FaCheckCircle } from 'react-icons/fa'
import axios from 'axios'

const VerificationComplete = () => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await axios.post('/update-passwords', {
        password,
      })

      setError('')
      setSuccess(true)
    } catch (err) {
      console.error('Error saving password:', err)
      setError('An error occurred while saving your password. Please try again.')
      setSuccess(false)
    }
  }

  return (
    <div className="flex items-center justify-center px-4">
      <div className="card w-full max-w-3xl bg-base-100 shadow-xl border border-base-300">
        <div className="card-body items-center text-center space-y-10">
          {/* Success Icon */}
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-success/10">
            <FaCheckCircle className="text-success text-5xl" />
          </div>

          {/* Title */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-success">Profile Submission Complete</h2>
            <p className="text-gray-600 max-w-lg leading-relaxed">
              Thank you for completing your profile and submitting your application for the new role
              at <strong>Nodit</strong>. Our recruitment and AI-powered review systems have
              securely processed your submission.
            </p>
          </section>

          {/* Password Setup */}
          <section className="w-full space-y-3 text-left bg-base-200 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-base-content flex items-center gap-3">
              Setup Password
            </h2>
            <p className="text-sm text-gray-600 max-w-lg">
              Creating a password now lets you securely access your candidate portal in the next
              steps.
            </p>

            <form onSubmit={handleSubmit} className="space-y-2">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Password <span className="text-error">*</span>
                </legend>
                <input
                  type="password"
                  name="password"
                  className={`input input-bordered w-full ${error ? 'input-error' : ''}`}
                  placeholder="Enter a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </fieldset>

              {error && <p className="text-xs text-error">{error}</p>}
              {success && (
                <p className="text-xs text-success">
                  Password successfully set! You may now safely close this window.
                </p>
              )}

              <div className="flex justify-end">
                <button type="submit" className="btn btn-success px-6" disabled={!password}>
                  Save Password
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

export default VerificationComplete
