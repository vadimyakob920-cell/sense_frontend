import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

const STORAGE_KEY = 'eligibility'

// Helper to update eligibility from anywhere
export function updateEligibility(updates) {
  const current = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}')
  const newData = {
    formSubmitted: updates.formSubmitted ?? current.formSubmitted ?? false,
    verificationPassed: updates.verificationPassed ?? current.verificationPassed ?? false,
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
  window.dispatchEvent(new Event('storage'))
}

const Block = () => {
  window.location.replace('about:blank')
}

export default function RouteGuard({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  const [eligibility, setEligibility] = useState({
    formSubmitted: false,
    verificationPassed: false,
  })

  const [ready, setReady] = useState(false)
  const [err, setErr] = useState(null)
  const [blocked, setBlocked] = useState(false)

  // Listen for storage updates (instant reaction)
  useEffect(() => {
    const onStorage = () => {
      try {
        const data = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {
          formSubmitted: false,
          verificationPassed: false,
        }
        setEligibility(data)
      } catch {
        setEligibility({ formSubmitted: false, verificationPassed: false })
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Fetch from API on mount to validate
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const statusRes = await axios.get('/check-status')
        if (cancelled) return

        // Handle status response
        setBlocked(statusRes.data.blocked || false)
        if (statusRes.data.blocked) {
          Block()
        }
        const data = {
          formSubmitted: statusRes.data.completed,
          verificationPassed: statusRes.data.completed,
        }
        setEligibility(data)
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        setReady(true)
      } catch (err) {
        console.error('Eligibility check failed', err)
        setErr(err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Redirect logic
  useEffect(() => {
    if (!ready) return // Wait for API check on first load
    if (blocked) return // Prevent loops

    const { formSubmitted, verificationPassed } = eligibility
    const path = location.pathname

    // Once both are true, force /complete
    if (formSubmitted && verificationPassed && path !== '/complete') {
      navigate('/complete', { replace: true })
    }

    // Always allow root
    if (path === '/') return

    // Step 2 guard
    if (path === '/check' && !formSubmitted) {
      navigate('/', { replace: true })
      return
    }

    // Step 3 guard
    if (path === '/complete' && !verificationPassed) {
      navigate('/', { replace: true })
      return
    }
  }, [location, eligibility, navigate, ready, blocked])

  if (blocked) {
    Block()
    return null
  }

  if (err) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-base-content/70">
        <p className="mb-4 text-center">
          An error occurred while checking your eligibility. Please try again later.
        </p>
        <p className="text-sm text-base-content/50">{err.message || 'Unknown error'}</p>
      </div>
    )
  }

  // if (!ready) {
  //   return (
  //     <div className="flex items-center justify-center py-20 text-base-content/70">
  //       <span className="loading loading-spinner loading-md mr-2" />
  //       Checking eligibility…
  //     </div>
  //   )
  // }

  return children
}
