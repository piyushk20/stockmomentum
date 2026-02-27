import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

try {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (error) {
  console.error("Critical Render Error:", error);
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="background: #fee2e2; color: #991b1b; padding: 2rem; border-radius: 1rem; border: 1px solid #fecaca; font-family: sans-serif; margin: 2rem;">
        <h1 style="margin-top: 0;">Application Error</h1>
        <p>The application failed to start. Please check the browser console for details.</p>
        <pre style="background: white; padding: 1rem; border-radius: 0.5rem; overflow: auto;">${error.message}</pre>
      </div>
    `;
  }
}
