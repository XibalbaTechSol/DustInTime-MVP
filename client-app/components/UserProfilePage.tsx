import React, { useState } from 'react';
import type { User, ClientProfile } from '../types';
import { BASE_URL } from '../constants';

interface UserProfilePageProps {
  user: User;
  onUpdateProfile: (user: User) => void;
  onBack: () => void;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ user, onUpdateProfile, onBack }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const clientProfile = user.profile as ClientProfile; // Type assertion
  const [address, setAddress] = useState(clientProfile?.address || '');
  const [propertyType, setPropertyType] = useState(clientProfile?.propertyType || 'Apartment');
  const [bedrooms, setBedrooms] = useState(clientProfile?.bedrooms || 1);
  const [bathrooms, setBathrooms] = useState(clientProfile?.bathrooms || 1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ ...user, name, email });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // In a real app, you'd use a geocoding service to get lat/lng from address
      const lat = 0; // Placeholder
      const lng = 0; // Placeholder

      const response = await fetch(`${BASE_URL}/api/onboarding/client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          address, propertyType, bedrooms, bathrooms, lat, lng
        }),
      });

      if (response.ok) {
        onOnboardingComplete();
      } else {
        const data = await response.json();
        setError(data.message || 'Onboarding failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <button onClick={onBack} className="btn btn-ghost mb-4">
        &larr; Back to Dashboard
      </button>
      <h1 className="text-2xl font-bold">My Profile</h1>
      <form onSubmit={handleUpdate} className="mt-4 space-y-4">
        <div>
          <label className="label">
            <span className="text-base label-text">Name</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full input input-bordered"
          />
        </div>
        <div>
          <label className="label">
            <span className="text-base label-text">Email</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full input input-bordered"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Update Profile
        </button>
      </form>
      <div className="mt-8">
        <h2 className="text-xl font-bold">Client Onboarding</h2>
        <button onClick={() => onNavigate('clientOnboarding')} className="btn btn-primary mt-4">
          Complete Onboarding
        </button>
      </div>
    </div>
  );
};

export default UserProfilePage;
