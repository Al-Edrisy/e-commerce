import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import AuthForm from "../components/AuthForm";

const Signup = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSignup = async (fields) => {
        setLoading(true);
        setError("");
        setMessage("");
        try {
            // Firebase registration
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                fields.email,
                fields.password
            );
            const user = userCredential.user;
            // Set user's display name
            await updateProfile(user, { displayName: fields.name });
            // Get ID token
            const token = await user.getIdToken();
            localStorage.setItem("token", token);
            setMessage("Account created! Redirecting to dashboard...");
            setTimeout(() => navigate("/dashboard"), 1200);
        } catch (err) {
            setError("Signup failed: " + (err.message || "Check the details."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Sign Up</h2>
                <AuthForm
                    formType="signup"
                    onSubmit={handleSignup}
                    loading={loading}
                    message={message}
                    error={error}
                    switchLink="/login"
                    switchText="Already have an account?"
                />
            </div>
        </div>
    );
};

export default Signup;
