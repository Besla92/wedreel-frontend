import { registerSW } from 'virtual:pwa-register'
registerSW()

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext.jsx'
import { CssBaseline, ThemeProvider } from '@mui/material'
import theme from './theme'
import { BrowserRouter } from 'react-router-dom'
import './i18n'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <NotificationProvider>
                    <BrowserRouter>
                        <App />
                    </BrowserRouter>
                </NotificationProvider>
            </AuthProvider>
        </ThemeProvider>
    </React.StrictMode>
)
