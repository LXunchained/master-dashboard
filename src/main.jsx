import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, info) {
        console.error('Dashboard crashed:', error, info);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#020617', flexDirection: 'column', gap: '16px', padding: '32px'
                }}>
                    <div style={{ fontSize: '48px' }}>⚠️</div>
                    <h1 style={{ color: '#f87171', fontFamily: 'monospace', fontSize: '18px' }}>Dashboard Error</h1>
                    <pre style={{
                        color: '#94a3b8', fontFamily: 'monospace', fontSize: '12px', maxWidth: '800px',
                        whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#0f172a',
                        padding: '16px', borderRadius: '8px', border: '1px solid #1e293b'
                    }}>
                        {String(this.state.error)}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <HashRouter>
                <App />
            </HashRouter>
        </ErrorBoundary>
    </React.StrictMode>,
)
