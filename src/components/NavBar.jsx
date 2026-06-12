import { useLocation } from 'react-router-dom'
import Bowser from 'bowser'
import logo from '../assets/logo.png'

const NavBar = ({ showProgress = true }) => {
  const location = useLocation()
  const bowser = Bowser.getParser(window.navigator.userAgent)

  const getStepFromPath = (pathname) => {
    if (pathname === '/' || pathname === '/candidate') return 1
    if (pathname === '/check') return 2
    if (pathname === '/complete') return 3
    return 1
  }

  const step = getStepFromPath(location.pathname)

  return (
    <div className="py-2.5 bg-white z-[100] sticky top-0 border-b border-gray-200">
      <div className="w-[90%] mx-auto flex items-center justify-start h-[60px] max-w-[1300px]">
        <a href="https://nodit.io/" className="h-full">
          <img
            src={logo}
            width="60"
            alt=""
            className="ml-[5px] pt-[3px]"
          ></img>
        </a>
        {showProgress && (
          <div className="text-xs text-gray-600 flex justify-center w-[calc(100%-130px)]">
            <ul className="steps">
              <li className="step step-primary">Questions</li>
              {bowser.getOSName(true) !== 'windows' && (
                <li className={`step ${step > 1 ? 'step-primary' : ''}`}>Check</li>
              )}
              <li className={`step ${step > 2 ? 'step-primary' : ''}`}>Check</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default NavBar
