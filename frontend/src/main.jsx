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
    <Toaster
      position='bottom-right'
      toastOptions={{
        style: {
          background: '#FFFFFF',
          color: '#0F172A',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: 500,
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.10), 0 4px 12px rgba(15, 23, 42, 0.05)',
        },
        success: { iconTheme: { primary: '#16A34A', secondary: '#F0FDF4' } },
        error: { iconTheme: { primary: '#DC2626', secondary: '#FEF2F2' } },
      }}
    />
    </AuthProvider>
  </StrictMode>,
)
