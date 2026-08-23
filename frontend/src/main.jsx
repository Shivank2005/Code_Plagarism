import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './hooks/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    <Toaster position='bottom-right' toastOptions={{ style: { background: '#161b22', color: '#c9d1d9', border: '1px solid #30363d' } }} />
    </AuthProvider>
  </StrictMode>,
)
