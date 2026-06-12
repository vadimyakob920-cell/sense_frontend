import { FaMobileAlt, FaExclamationTriangle } from 'react-icons/fa'
import Bowser from 'bowser'
import NavBar from './NavBar'
import Footer from './Footer'
import Page from './Page'

const DeviceGuard = ({ children }) => {
  const bowser = Bowser.getParser(window.navigator.userAgent)

  const AlertBlock = ({ type, icon, title, message }) => {
    const alertClass = {
      error: 'alert-error',
      warning: 'alert-warning',
      info: 'alert-info',
    }[type]

    return (
      <div className={`alert ${alertClass} shadow-md rounded-lg max-w-xl mx-auto`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-base-content">{message}</p>
          </div>
        </div>
      </div>
    )
  }

  if (bowser.getPlatformType(true) !== 'desktop') {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-base-200 text-base-content">
        <NavBar showProgress={false} />
        <Page>
          <AlertBlock
            type="error"
            icon={<FaMobileAlt />}
            title="Desktop Device Required"
            message="This web application is designed for desktop environments to ensure optimal performance, security, and compatibility."
          />
        </Page>
        <Footer />
      </div>
    )
  }

  if (!['macos', 'windows'].includes(bowser.getOSName(true))) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-base-200 text-base-content">
        <NavBar showProgress={false} />
        <Page>
          <AlertBlock
            type="error"
            icon={<FaExclamationTriangle />}
            title="Unsupported Operating System"
            message="This web application is optimized for Windows and macOS to ensure compatibility with enterprise-grade security protocols, camera access layers, and AI verification tools."
          />
        </Page>
        <Footer />
      </div>
    )
  }

  return <>{children}</>
}

export default DeviceGuard
