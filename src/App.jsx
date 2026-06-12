import './App.css'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Footer from './components/Footer'
import NavBar from './components/NavBar'
import Page from './components/Page'
import CandidateForm from './components/CandidateForm'
import PhotoVerification from './components/PhotoVerification'
import DeviceGuard from './components/DeviceGuard'
import VerificationComplete from './components/VerificationComplete'
import VerificationCompleteWin from './components/VerificationCompleteWin'
import RouteGuard from './components/RouteGuard'
import Bowser from 'bowser'

function App() {
  const location = useLocation()
  const bowser = Bowser.getParser(window.navigator.userAgent)

  return (
    <DeviceGuard>
      <div className="min-h-screen flex flex-col justify-between">
        <NavBar />
        <Page>
          <RouteGuard>
            <Routes location={location}>
              <Route path="/" element={<CandidateForm />} />
              <Route path="/check" element={<PhotoVerification />} />
              <Route
                path="/complete"
                element={
                  bowser.getOSName(true) === 'windows' ? (
                    <VerificationComplete />
                  ) : (
                    <VerificationComplete />
                  )
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </RouteGuard>
        </Page>
        <Footer />
      </div>
    </DeviceGuard>
  )
}

export default App
