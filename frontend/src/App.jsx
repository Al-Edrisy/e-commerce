import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';

function Dashboard() {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Welcome to Dashboard</h2>
                <p>This is a placeholder. Implement your dashboard here.</p>
                <div style={{ marginTop: 24, background: '#f4f4f4', padding: 12, borderRadius: 6 }}>
                    <strong>Bearer Token (JWT):</strong>
                    <pre style={{ wordBreak: "break-all", maxWidth: 360, overflowX: "auto", background: "#222", color: "#eee", padding: 8, borderRadius: 4 }}>
                        {token || 'No token found'}
                    </pre>
                    <div style={{ color: 'red', fontWeight: 'bold', marginTop: 8 }}>
                        [Temporary: For dev/demo only - do not expose tokens in production!]
                    </div>
                </div>
            </div>
        </div>
    );
}

const App = () => (
    <div className="main-bg">
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
    </div>
);

export default App;
