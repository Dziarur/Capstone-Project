import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Login_page from './Login_page.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Login_page />

  </StrictMode>,
)
