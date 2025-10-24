import React, { useState } from 'react';
import { BASE_URL } from '../constants';

/**
 * Props for the LoginPage component.
 * @interface LoginPageProps
 */
interface LoginPageProps {
  /** Callback function to be invoked upon successful login. */
  onLoginSuccess: () => void;
  /** Callback function to navigate to the registration page. */
  onNavigateToRegister: () => void;
}

/**
 * A component that renders a login form for user authentication.
 * It handles form submission, API calls to the login endpoint, and displays errors.
 *
 * @param {LoginPageProps} props The props for the component.
 * @returns {React.ReactElement} The rendered login page.
 */
const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigateToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                onLoginSuccess();
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-base-200">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center">Client Login</h1>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="label">
                            <span className="text-base label-text">Email</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            className="w-full input input-bordered"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="label">
                            <span className="text-base label-text">Password</span>
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter Password"
                            className="w-full input input-bordered"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="text-sm text-center text-red-500">{error}</p>}
                    <div>
                        <button type="submit" className="w-full btn btn-primary">
                            Login
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <p>
                        Don't have an account?{' '}
                        <button onClick={onNavigateToRegister} className="link link-primary">
                            Register
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
