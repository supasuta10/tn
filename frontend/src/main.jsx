import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { TextScaleProvider } from './context/TextScaleContext.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TextScaleProvider>
      <App />
    </TextScaleProvider>
  </StrictMode>,
)
