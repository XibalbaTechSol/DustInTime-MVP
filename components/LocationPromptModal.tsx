
import React, { useEffect } from 'react';

interface LocationPromptModalProps {
  isOpen: boolean;
  onAllow: () => void;
  onDeny: () => void;
}

const LocationPromptModal: React.FC<LocationPromptModalProps> = ({ isOpen, onAllow, onDeny }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
    >
      <div
        className="relative bg-base-100 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center transform transition-all duration-300 scale-95 animate-fade-in-up"
      >
        <style>{`
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
        `}</style>
        
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        </div>

        <h2 className="text-2xl font-bold text-neutral mb-2">See Cleaners Near You</h2>
        <p className="text-gray-600 mb-6">
            Allow "Dust in Time" to access your location to find and sort the best cleaning professionals in your area.
        </p>

        <div className="flex flex-col gap-3">
             <button
                onClick={onAllow}
                className="w-full bg-primary text-primary-content font-bold py-3 px-4 rounded-lg hover:bg-primary-focus transition-all duration-300 transform hover:scale-105"
            >
                Allow Location
            </button>
            <button
                onClick={onDeny}
                className="w-full bg-transparent text-gray-600 font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 transition duration-300"
            >
                Maybe Later
            </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPromptModal;
