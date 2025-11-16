import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'antd/dist/reset.css'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'

if (import.meta.env.DEV) {
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args) => {
    const message = args[0]?.toString() || '';

    if (
      message.includes('[antd: compatible]') ||
      message.includes('antd v5 support React is 16 ~ 18')
    ) {
      return;
    }

    if (
      message.includes('404') &&
      (
        message.includes('/api/exam/') && message.includes('/exported-info') ||
        message.includes('/api/exam/') && message.includes('/import-status') ||
        message.includes('/api/marking/assignment/') ||
        (message.includes('/api/marking') && message.includes('assignmentId')) ||
        message.includes('/api/finalscore/solution/')
      )
    ) {
      return;
    }
    
    originalError.apply(console, args);
  };
  
  console.warn = (...args) => {
    const message = args[0]?.toString() || '';
    if (
      message.includes('[antd: compatible]') ||
      message.includes('antd v5 support React is 16 ~ 18')
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
