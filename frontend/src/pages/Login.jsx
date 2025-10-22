import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import AuthForm from "../components/AuthForm";

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (fields) => {
        setLoading(true);
        setError("");
        setMessage("");
        try {
            // Authenticate with Firebase
            const userCredential = await signInWithEmailAndPassword(
                auth,
                fields.email,
                fields.password
            );
            const user = userCredential.user;
            const token = await user.getIdToken();
            localStorage.setItem("token", token);
            setMessage("Login successful! Redirecting...");
            setTimeout(() => navigate("/dashboard"), 1200);
        } catch (err) {
            setError("Login failed: " + (err.message || "Check your credentials."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Login</h2>
                <AuthForm
                    formType="login"
                    onSubmit={handleLogin}
                    loading={loading}
                    message={message}
                    error={error}
                    switchLink="/signup"
                    switchText="Don’t have an account?"
                    forgotLink="/forgot-password"
                />
            </div>
        </div>
    );
};

export default Login;
