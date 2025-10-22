import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        if (!email) {
            setError('Email is required');
            return;
        }
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/users/forgot-password', { email });
            setMessage('If the email exists, a reset link has been sent.');
        } catch (err) {
            setError(
                err.response && err.response.data && err.response.data.message
                    ? err.response.data.message
                    : 'Failed to send reset link.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Forgot Password</h2>
                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                            className={error && !email ? 'has-error' : ''}
                        />
                    </div>
                    <button className="primary-btn" type="submit" disabled={loading || !email}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                    <div className="form-links">
                        <span>
                            <Link to="/login">Back to Login</Link>
                        </span>
                    </div>
                    {error && <div className="error-alert">{error}</div>}
                    {message && <div className="success-alert">{message}</div>}
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
