import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-base-100 dark:bg-neutral-focus flex justify-center items-center z-50">
      <div className="text-center animate-fade-in">
        <img src="/logo.png" alt="Dust in Time Logo" className="h-48 w-48 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-neutral dark:text-base-100">Dust in Time</h1>
        <p className="text-neutral-500 dark:text-neutral-400">Your time is precious.</p>
      </div>
    </div>
  );
};

export default SplashScreen;