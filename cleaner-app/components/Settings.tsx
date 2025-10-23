
import React, { useState, useEffect } from 'react';
import type { User, ClientProfile, CleanerProfile } from '../types';

const ALL_SERVICES = ['Deep Cleaning', 'Residential', 'Move-in/out', 'Eco-Friendly', 'Office', 'Windows', 'Laundry'];

/**
 * Props for the Settings component.
 * @interface SettingsProps
 */
interface SettingsProps {
    /** The currently authenticated user object, or null if not available. */
    user: User | null;
    /** Callback function to navigate to different pages. */
    onNavigate: (page: string, props?: any) => void;
}

/**
 * A component that displays a settings form for the user's profile.
 * It dynamically renders different fields based on the user's role (client or cleaner).
 * Note: The functionality to save changes is currently disabled in this component.
 *
 * @param {SettingsProps} props The props for the component.
 * @returns {React.ReactElement} The rendered settings page.
 */
const Settings: React.FC<SettingsProps> = ({ user, onNavigate }) => {
    const [formData, setFormData] = useState<any>({});
    
    useEffect(() => {
        if (user) {
            // Initialize form data from user context
            const initialData = {
                name: user.name,
                ...user.profile
            };
            setFormData(initialData);
        }
    }, [user]);

    if (!user || !user.profile) {
        return <div>Loading profile...</div>;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        // Handle number inputs specifically
        const isNumberField = ['hourlyRate', 'bedrooms', 'bathrooms'].includes(name);
        setFormData((prev: any) => ({
            ...prev,
            [name]: isNumberField ? parseInt(value, 10) : value,
        }));
    };

    const handleServiceToggle = (service: string) => {
        setFormData((prev: any) => {
            const currentServices = prev.services || [];
            const newServices = currentServices.includes(service)
                ? currentServices.filter((s: string) => s !== service)
                : [...currentServices, service];
            return { ...prev, services: newServices };
        });
    };
    
    // NOTE: The handleSubmit and updateProfile logic has been removed. Changes will not be saved.

    return (
        <div className="max-w-4xl mx-auto animate-fade-in-up">
            <style>{`
                @keyframes fade-in-up {
                  from { opacity: 0; transform: translateY(20px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.4s ease-out forwards; }
            `}</style>

            <h1 className="text-3xl md:text-4xl font-bold text-neutral mb-6">Settings</h1>

            <div className="bg-base-100 p-8 rounded-xl shadow-lg">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral mb-1">My Profile</h2>
                        <p className="text-gray-500">View your profile information below. Saving changes has been disabled.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                        {/* Common Fields */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input type="email" id="email" name="email" value={user.email} disabled className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-500" />
                        </div>
                    </div>

                    {/* Client-specific Fields */}
                    {user.role === 'client' && (
                        <div className="space-y-6 pt-6 border-t">
                             <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Primary Address</label>
                                <input type="text" id="address" name="address" value={formData.address || ''} onChange={handleInputChange} placeholder="e.g. 123 Main St, San Francisco, CA" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">Property Type</label>
                                    <select id="propertyType" name="propertyType" value={formData.propertyType || 'Apartment'} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                                        <option>Apartment</option>
                                        <option>House</option>
                                        <option>Townhouse</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">Bedrooms</label>
                                    <input type="number" id="bedrooms" name="bedrooms" min="0" value={formData.bedrooms || 0} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                                </div>
                                <div>
                                    <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">Bathrooms</label>
                                    <input type="number" id="bathrooms" name="bathrooms" min="1" value={formData.bathrooms || 1} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cleaner-specific Fields */}
                    {user.role === 'cleaner' && (
                        <div className="space-y-6 pt-6 border-t">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">Your Hourly Rate ($)</label>
                                    <input type="number" id="hourlyRate" name="hourlyRate" min="10" value={formData.hourlyRate || 25} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                                </div>
                                 <div>
                                    <label htmlFor="serviceArea" className="block text-sm font-medium text-gray-700">Primary Service Area</label>
                                    <input type="text" id="serviceArea" name="serviceArea" value={formData.serviceArea || ''} onChange={handleInputChange} placeholder="e.g. San Francisco, CA or 94102" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Short Bio</label>
                                <textarea id="bio" name="bio" value={formData.bio || ''} onChange={handleInputChange} rows={3} placeholder="Tell clients about your experience..." required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"></textarea>
                            </div>
                            <div>
                            </div>
                            {user.onboardingComplete === 0 && (
                                <div className="pt-4 border-t">
                                    <h3 className="text-xl font-bold text-neutral mb-2">Onboarding</h3>
                                    <p className="text-gray-500 mb-4">It looks like you haven't completed your onboarding yet. Please complete it to unlock full features.</p>
                                    <button onClick={() => onNavigate('cleanerOnboarding')} className="btn btn-primary">Complete Onboarding</button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                        <button type="button" disabled className="bg-primary text-primary-content font-bold py-2 px-6 rounded-lg opacity-50 cursor-not-allowed">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;