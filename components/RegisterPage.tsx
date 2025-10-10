import React, { useState } from 'react';

/**
 * Props for the RegisterPage component.
 * @interface RegisterPageProps
 */
interface RegisterPageProps {
  /** Callback function to be invoked upon successful registration. */
  onRegisterSuccess: () => void;
  /** Callback function to navigate to the login page. */
  onNavigateToLogin: () => void;
}

/**
 * A component that renders a registration form for new users.
 * It handles form submission, API calls to the register endpoint, and displays errors.
 *
 * @param {RegisterPageProps} props The props for the component.
 * @returns {React.ReactElement} The rendered registration page.
 */
const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess, onNavigateToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:3001/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                onRegisterSuccess();
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-base-200">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center">Register</h1>
                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label className="label">
                            <span className="text-base label-text">Name</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="w-full input input-bordered"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="label">
                            <span className="text-base label-text">Email</span>
                        </label>
                        <input
                            type="email"
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
                            Register
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <p>
                        Already have an account?{' '}
                        <button onClick={onNavigateToLogin} className="link link-primary">
                            Login
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
