import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * AuthForm: Generic authentication form component for Login & Signup.
 * @param {string} formType - 'login' or 'signup'
 * @param {function} onSubmit - Function to call on submit
 * @param {boolean} loading - Submission in progress
 * @param {string} message - Success message
 * @param {string} error - Error message
 * @returns Rendered form
 */
const AuthForm = ({ formType, onSubmit, loading, message, error, switchLink, switchText, forgotLink }) => {
    // Set initial form state based on formType
    const [fields, setFields] = useState(
        formType === 'signup'
            ? { name: '', email: '', password: '', confirmPassword: '' }
            : { email: '', password: '' }
    );
    const [touched, setTouched] = useState({});

    /** Handle input changes */
    const handleChange = (e) => {
        setFields({ ...fields, [e.target.name]: e.target.value });
    };

    /** Mark field as touched for validation */
    const handleBlur = (e) => {
        setTouched({ ...touched, [e.target.name]: true });
    };

    /** Validate fields and display error messages */
    const validate = () => {
        const errs = {};
        if (formType === 'signup' && !fields.name.trim()) errs.name = 'Name is required';
        if (!fields.email.trim()) errs.email = 'Email is required';
        if (!fields.password) errs.password = 'Password is required';
        if (formType === 'signup') {
            if (!fields.confirmPassword) errs.confirmPassword = 'Please confirm password';
            else if (fields.password !== fields.confirmPassword) errs.confirmPassword = 'Passwords do not match';
        }
        return errs;
    };

    const errors = validate();
    const isValid = Object.keys(errors).length === 0;

    /** Handle form submit */
    const handleSubmit = (e) => {
        e.preventDefault();
        setTouched(Object.keys(fields).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
        if (isValid && !loading) {
            onSubmit(fields);
        }
    };

    return (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {formType === 'signup' && (
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                        name="name"
                        type="text"
                        placeholder="Your name"
                        value={fields.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={touched.name && errors.name ? 'has-error' : ''}
                        autoComplete="name"
                    />
                    {touched.name && errors.name && <span className="error-text">{errors.name}</span>}
                </div>
            )}
            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                    name="email"
                    type="email"
                    placeholder="Email address"
                    value={fields.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.email && errors.email ? 'has-error' : ''}
                    autoComplete="email"
                />
                {touched.email && errors.email && <span className="error-text">{errors.email}</span>}
            </div>
            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={fields.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.password && errors.password ? 'has-error' : ''}
                    autoComplete={formType === 'signup' ? 'new-password' : 'current-password'}
                />
                {touched.password && errors.password && <span className="error-text">{errors.password}</span>}
            </div>
            {formType === 'signup' && (
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm password"
                        value={fields.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={touched.confirmPassword && errors.confirmPassword ? 'has-error' : ''}
                        autoComplete="new-password"
                    />
                    {touched.confirmPassword && errors.confirmPassword && (
                        <span className="error-text">{errors.confirmPassword}</span>
                    )}
                </div>
            )}
            <button className="primary-btn" type="submit" disabled={!isValid || loading}>
                {loading ? (formType === 'login' ? 'Logging in...' : 'Creating Account...') : (formType === 'login' ? 'Login' : 'Create Account')}
            </button>
            <div className="form-links">
                <span>
                    {switchText} <a href={switchLink}>{formType === 'login' ? 'Sign up' : 'Login'}</a>
                </span>
            </div>
            {/* Forgot Password link should be below the form-links */}
            {formType === 'login' && (
                <div className="forgot-link">
                    <a href={forgotLink}>
                        Forgot Password?
                    </a>
                </div>
            )}
            {error && <div className="error-alert">{error}</div>}
            {message && <div className="success-alert">{message}</div>}
        </form>
    );
};

AuthForm.propTypes = {
    formType: PropTypes.oneOf(['login', 'signup']).isRequired,
    onSubmit: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    message: PropTypes.string,
    error: PropTypes.string,
    switchLink: PropTypes.string.isRequired,
    switchText: PropTypes.string.isRequired,
    forgotLink: PropTypes.string,
};

export default AuthForm;
