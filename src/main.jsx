import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthProvider.jsx'
import { AuthModalProvider } from "./context/AuthModalProvider.jsx"

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <AuthModalProvider>
                <App />
            </AuthModalProvider>
        </AuthProvider>
    </StrictMode>,
)