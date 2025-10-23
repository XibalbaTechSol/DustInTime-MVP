import React, { useState } from 'react';
import type { User } from '../types';

interface CleanerOnboardingProps {
  user: User;
  onOnboardingComplete: () => void;
}

const CleanerOnboarding: React.FC<CleanerOnboardingProps> = ({ user, onOnboardingComplete }) => {
  const [services, setServices] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState(20);
  const [location, setLocation] = useState(''); // This would ideally be a map input or address lookup
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const allAvailableServices = [
    'General Cleaning', 'Deep Cleaning', 'Window Cleaning', 'Carpet Cleaning', 'Upholstery Cleaning'
  ];

  const handleServiceChange = (service: string) => {
    setServices(prev => 
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // In a real app, you'd use a geocoding service to get lat/lng from location
      const lat = 0; // Placeholder
      const lng = 0; // Placeholder

      const response = await fetch('/api/onboarding/cleaner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token') || '',
        },
        body: JSON.stringify({
          services, hourlyRate, location_lat: lat, location_lng: lng
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
    <div className="flex items-center justify-center min-h-screen bg-neutral-focus">
      <div className="w-full max-w-md p-8 space-y-6 bg-neutral rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-base-200">Cleaner Onboarding</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">
              <span className="text-base label-text text-base-200">Services Offered</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {allAvailableServices.map(service => (
                <label key={service} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={services.includes(service)}
                    onChange={() => handleServiceChange(service)}
                  />
                  <span className="label-text text-base-200">{service}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="label">
              <span className="text-base label-text text-base-200">Hourly Rate ($)</span>
            </label>
            <input
              type="number"
              placeholder="Hourly Rate"
              className="w-full input input-bordered bg-base-100 text-base-200"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(parseInt(e.target.value))}
              min="10"
              required
            />
          </div>
          <div>
            <label className="label">
              <span className="text-base label-text text-base-200">Location (e.g., City, State)</span>
            </label>
            <input
              type="text"
              placeholder="Your primary service area"
              className="w-full input input-bordered bg-base-100 text-base-200"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
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

export default CleanerOnboarding;
