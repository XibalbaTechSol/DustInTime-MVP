import React from 'react';
import type { User } from '../types';

interface ProfilePageProps {
  user: User;
  onNavigate: (page: string, props?: any) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onNavigate }) => {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p>Welcome, {user.name}!</p>
    </div>
  );
};

export default ProfilePage;
