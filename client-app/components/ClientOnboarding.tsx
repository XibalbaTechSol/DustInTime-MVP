import React, { useState } from 'react';
import type { User, ClientProfile } from '../types';

interface ClientOnboardingProps {
  user: User;
  onOnboardingComplete: () => void;
}

const ClientOnboarding: React.FC<ClientOnboardingProps> = ({ user, onOnboardingComplete }) => {
  const clientProfile = user.profile as ClientProfile; // Type assertion
  const [address, setAddress] = useState(clientProfile?.address || '');
  const [propertyType, setPropertyType] = useState(clientProfile?.propertyType || 'Apartment');
  const [bedrooms, setBedrooms] = useState(clientProfile?.bedrooms || 1);
  const [bathrooms, setBathrooms] = useState(clientProfile?.bathrooms || 1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // In a real app, you'd use a geocoding service to get lat/lng from address
      const lat = 0; // Placeholder
      const lng = 0; // Placeholder

      const response = await fetch('/api/onboarding/client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token') || '',
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
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Client Onboarding</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">
              <span className="text-base label-text">Address</span>
            </label>
            <input
              type="text"
              placeholder="Your Address"
              className="w-full input input-bordered"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">
              <span className="text-base label-text">Property Type</span>
            </label>
            <select
              className="w-full select select-bordered"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as "Apartment" | "House" | "Townhouse" | "Other")}
            >
              <option>Apartment</option>
              <option>House</option>
              <option>Townhouse</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="label">
              <span className="text-base label-text">Bedrooms</span>
            </label>
            <input
              type="number"
              placeholder="Number of Bedrooms"
              className="w-full input input-bordered"
              value={bedrooms}
              onChange={(e) => setBedrooms(parseInt(e.target.value))}
              min="1"
              required
            />
          </div>
          <div>
            <label className="label">
              <span className="text-base label-text">Bathrooms</span>
            </label>
            <input
              type="number"
              placeholder="Number of Bathrooms"
              className="w-full input input-bordered"
              value={bathrooms}
              onChange={(e) => setBathrooms(parseInt(e.target.value))}
              min="1"
              required
            />
          </div>
          {error && <p className="text-sm text-center text-red-500">{error}</p>}
          <div>
            <button type="submit" className="w-full btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Complete Onboarding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientOnboarding;
