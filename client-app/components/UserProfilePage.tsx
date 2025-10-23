import React, { useState } from 'react';
import type { User } from '../types';

interface UserProfilePageProps {
  user: User;
  onUpdateProfile: (updatedUser: User) => void;
  onBack: () => void;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ user, onUpdateProfile, onBack }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ ...user, name, email });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={onBack} className="mb-4 text-sm font-semibold text-slate-600 hover:text-slate-900">
        &larr; Back
      </button>
      <h1 className="text-3xl font-bold text-neutral-focus mb-6">Your Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
        <button type="submit" className="w-full bg-primary text-primary-content font-bold py-3 px-4 rounded-lg hover:bg-primary-focus transition-all duration-300">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default UserProfilePage;
