
import React from 'react';

/**
 * A simple, stateless footer component for the application.
 * It displays the copyright year and a company tagline.
 *
 * @returns {React.ReactElement} The rendered footer element.
 */
const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-focus text-base-200 mt-auto">
      <div className="container mx-auto px-4 py-6 text-center">
        <p>&copy; {new Date().getFullYear()} Dust in Time. All rights reserved.</p>
        <p className="text-sm text-slate-400 mt-1">Your time is precious. Let us handle the dust.</p>
      </div>
    </footer>
  );
};

export default Footer;