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
    <Toaster position='bottom-right' toastOptions={{ style: { background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' } }} />
    </AuthProvider>
  </StrictMode>,
)
