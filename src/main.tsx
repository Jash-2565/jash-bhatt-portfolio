import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { trackUiScale } from './utils/uiScale'

// Before the first render, so the icons and the circuit ground are drawn at
// the right scale from the first frame.
trackUiScale()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Any component that throws used to take the whole tree down to a blank
        page. The boundary keeps a name, a reload, and a way to get in touch on
        screen instead. */}
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
