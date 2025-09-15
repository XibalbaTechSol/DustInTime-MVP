import React, { useState, useMemo } from 'react';
import type { Cleaner, User, Booking, SpecializedTask } from '../types';
import StarRating from './StarRating';
import { CLEANERS_DATA } from '../constants';

interface BookingPageProps {
    cleanerId: number;
    user: User;
    onBookingComplete: (bookingDetails: Booking) => void;
    onBack: () => void;
}

const PLATFORM_FEE_PERCENTAGE = 0.05;

const BookingPage: React.FC<BookingPageProps> = ({ cleanerId, user, onBookingComplete, onBack }) => {
    const cleaner = CLEANERS_DATA.find(c => c.id === cleanerId);

    if (!cleaner) {
        // Could show a "Cleaner not found" message
        return <div className="text-center p-12">Cleaner information is missing.</div>;
    }

    const [step, setStep] = useState(1);
    const [bookingDetails, setBookingDetails] = useState({
        datetime: '',
        hours: 3,
        frequency: 'one-time',
        selectedTasks: [] as SpecializedTask[],
    });
    const [isConfirmed, setIsConfirmed] = useState(false);

    const costDetails = useMemo(() => {
        const subtotal = cleaner.hourlyRate * bookingDetails.hours;
        const specializedTasksTotal = bookingDetails.selectedTasks.reduce((acc, task) => {
            // Assuming all specialized tasks are per hour for this calculation
            return acc + (task.rate * bookingDetails.hours);
        }, 0);
        const totalBeforeFee = subtotal + specializedTasksTotal;
        const platformFee = totalBeforeFee * PLATFORM_FEE_PERCENTAGE;
        const total = totalBeforeFee + platformFee;
        return { subtotal, specializedTasksTotal, platformFee, total };
    }, [cleaner.hourlyRate, bookingDetails.hours, bookingDetails.selectedTasks]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setBookingDetails(prev => ({ ...prev, [name]: name === 'hours' ? parseInt(value) : value }));
    };

    const handleTaskToggle = (task: SpecializedTask) => {
        setBookingDetails(prev => {
            const isSelected = prev.selectedTasks.some(t => t.name === task.name);
            if (isSelected) {
                return { ...prev, selectedTasks: prev.selectedTasks.filter(t => t.name !== task.name) };
            } else {
                return { ...prev, selectedTasks: [...prev.selectedTasks, task] };
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (bookingDetails.datetime) {
            setStep(2); // Move to confirmation step
        }
    };

    const handleConfirmBooking = () => {
        if (!user.profile || !('address' in user.profile) || !('location' in user.profile)) {
            console.error('User profile with address and location is required to make a booking.');
            return;
        }

        const newBooking: Booking = {
            id: `booking-${Date.now()}`,
            cleaner: cleaner,
            clientName: user.name,
            clientLocation: user.profile.location,
            clientAddress: user.profile.address,
            date: new Date(bookingDetails.datetime).toISOString(),
            status: 'upcoming',
            service: 'Custom Cleaning',
            hours: bookingDetails.hours,
            costDetails: costDetails,
            specializedTasks: bookingDetails.selectedTasks,
        };
        // Simulate API call
        setIsConfirmed(true);
        setTimeout(() => {
            onBookingComplete(newBooking);
        }, 4000); // Increased delay to allow user to read confirmation
    };

    return (
        <div className="bg-base-200 min-h-full py-8 md:py-12 px-4">
            <div className="container mx-auto max-w-4xl animate-fade-in-up">
                <button onClick={onBack} className="flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 mb-4">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    Back to Profile
                </button>
                <div className="bg-base-100 rounded-2xl shadow-xl overflow-hidden md:grid md:grid-cols-3">
                    {/* Left side: Booking Form */}
                    <div className="md:col-span-2 p-8">
                        {isConfirmed ? (
                            <div className="text-center py-8 px-4">
                                <svg className="w-20 h-20 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <h2 className="text-3xl font-bold text-neutral-focus mb-2">Booking Confirmed!</h2>
                                <p className="text-slate-600 mb-6">Your appointment with {cleaner.name} is set. You will be redirected to your dashboard shortly.</p>
                                
                                <div className="text-left bg-slate-50 border border-slate-200 rounded-lg p-6 max-w-md mx-auto space-y-3">
                                    <div className="flex items-center space-x-4 pb-3 border-b border-slate-200">
                                        <img src={cleaner.imageUrl} alt={cleaner.name} className="w-12 h-12 rounded-full object-cover"/>
                                        <div>
                                            <p className="font-bold text-neutral-focus">Cleaner</p>
                                            <p className="text-slate-600">{cleaner.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Date:</span>
                                        <span className="font-semibold text-neutral-focus">{new Date(bookingDetails.datetime).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Time:</span>
                                        <span className="font-semibold text-neutral-focus">{new Date(bookingDetails.datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Duration:</span>
                                        <span className="font-semibold text-neutral-focus">{bookingDetails.hours} hours</span>
                                    </div>
                                    <div className="flex justify-between pt-3 border-t border-slate-200 text-lg">
                                        <span className="font-bold text-neutral-focus">Total Paid:</span>
                                        <span className="font-bold text-neutral-focus">${costDetails.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h1 className="text-3xl font-bold text-neutral-focus mb-6">Schedule Your Cleaning</h1>
                                {step === 1 ? (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div>
                                            <h2 className="font-semibold text-lg text-neutral-focus">Select Date and Time</h2>
                                            <div className="mt-2">
                                                <label htmlFor="datetime" className="block text-sm font-medium text-slate-700">Appointment Time</label>
                                                <input type="datetime-local" id="datetime" name="datetime" value={bookingDetails.datetime} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                                            </div>
                                        </div>
                                         <div>
                                            <h2 className="font-semibold text-lg text-neutral-focus">Set Duration</h2>
                                            <div className="mt-2">
                                                <label htmlFor="hours" className="block text-sm font-medium text-slate-700">How many hours?</label>
                                                <select id="hours" name="hours" value={bookingDetails.hours} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                                                    {[2, 3, 4, 5, 6, 7, 8].map(h => <option key={h} value={h}>{h} hours</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        {cleaner.specializedTasks && cleaner.specializedTasks.length > 0 && (
                                            <div>
                                                <h2 className="font-semibold text-lg text-neutral-focus">Add Specialized Services</h2>
                                                <div className="mt-2 space-y-2">
                                                    {cleaner.specializedTasks.map(task => (
                                                        <label key={task.name} className="flex items-center p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                                                            <input
                                                                type="checkbox"
                                                                checked={bookingDetails.selectedTasks.some(t => t.name === task.name)}
                                                                onChange={() => handleTaskToggle(task)}
                                                                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                                            />
                                                            <span className="ml-3 font-medium text-neutral-focus">{task.name}</span>
                                                            <span className="ml-auto text-primary font-semibold">+${task.rate}/{task.unit.split(' ')[1]}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-4 border-t border-slate-200">
                                            <button type="submit" className="w-full bg-primary text-primary-content font-bold py-3 px-4 rounded-lg hover:bg-primary-focus transition-all duration-300">
                                                Proceed to Confirmation
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-neutral-focus">Confirm and Pay</h2>
                                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                                            <div className="flex justify-between"><span className="text-slate-600">Date:</span><span className="font-semibold">{new Date(bookingDetails.datetime).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-600">Time:</span><span className="font-semibold">{new Date(bookingDetails.datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-600">Duration:</span><span className="font-semibold">{bookingDetails.hours} hours</span></div>
                                        </div>
                                        
                                        <div>
                                            <h3 className="font-semibold text-lg text-neutral-focus">Payment Details</h3>
                                            <div className="mt-2 p-4 border rounded-lg bg-slate-50 space-y-4">
                                                {/* Cost Breakdown */}
                                                <div className="space-y-1">
                                                     <div className="flex justify-between text-sm"><span className="text-slate-600">Base Cleaning</span><span className="font-medium">${costDetails.subtotal.toFixed(2)}</span></div>
                                                     {costDetails.specializedTasksTotal > 0 && (
                                                         <div className="flex justify-between text-sm"><span className="text-slate-600">Specialized Services</span><span className="font-medium">${costDetails.specializedTasksTotal.toFixed(2)}</span></div>
                                                     )}
                                                     <div className="flex justify-between text-sm"><span className="text-slate-600">Platform Fee</span><span className="font-medium">${costDetails.platformFee.toFixed(2)}</span></div>
                                                     <div className="flex justify-between text-lg font-bold pt-1 border-t"><span className="text-neutral-focus">Total</span><span>${costDetails.total.toFixed(2)}</span></div>
                                                </div>
                                                
                                                {/* Mock Card Input */}
                                                <div className="pt-4 border-t">
                                                    <label htmlFor="cardNumber" className="block text-sm font-medium text-slate-700">Card Information</label>
                                                    <div className="relative mt-1">
                                                        <input type="text" id="cardNumber" name="cardNumber" className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-400 cursor-not-allowed" placeholder="•••• •••• •••• 4242" disabled />
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                            <svg className="h-6 w-6 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M21.125 12.375C21.125 12.0281 21.0391 11.6875 20.875 11.375H13.625V13.8125H18.1641C18.0078 14.7344 17.2969 15.8281 16.1406 16.6016L16.125 16.7031L18.6797 18.6641L18.8281 18.6719C20.3281 17.2578 21.125 15.0156 21.125 12.375Z" fill="#4285F4"/><path d="M12.375 21.125C15.4141 21.125 17.9375 20.1172 19.8203 18.6719L17.2734 16.7031C16.3281 17.3594 14.9375 17.875 13.625 17.875C11.1328 17.875 9.07031 16.2109 8.25781 14.0781L8.16406 14.0938L5.51562 16.1484L5.46875 16.2422C7.35156 19.2344 9.69531 21.125 12.375 21.125Z" fill="#34A853"/><path d="M8.25781 14.0781C7.82812 12.8906 7.82812 11.6094 8.25781 10.4219L8.25 10.3047L5.58594 8.25781L5.46875 8.26562C4.57812 10.0391 4.57812 12.1406 5.46875 13.9141L8.25781 14.0781Z" fill="#FBBC05"/><path d="M12.375 8.625C14.4375 8.625 15.6562 9.53125 16.4297 10.2578L18.8906 7.85938C17.9297 6.96094 15.4141 5.875 12.375 5.875C9.69531 5.875 7.35156 7.76562 5.46875 10.7578L8.25 12.9219C9.07031 10.7891 11.1328 8.625 12.375 8.625Z" fill="#EA4335"/></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <input type="text" id="expiryDate" name="expiryDate" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-400 cursor-not-allowed" placeholder="MM / YY" disabled />
                                                    </div>
                                                    <div>
                                                        <input type="text" id="cvc" name="cvc" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-400 cursor-not-allowed" placeholder="CVC" disabled />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4 pt-4 border-t border-slate-200">
                                            <button onClick={() => setStep(1)} className="text-slate-600 font-semibold hover:text-slate-900">Go Back</button>
                                            <button onClick={handleConfirmBooking} className="flex-grow bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-all duration-300">
                                                Confirm & Pay
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    {/* Right side: Cleaner Summary */}
                    <div className="bg-slate-50 p-8 border-l border-slate-200">
                        <div className="sticky top-24">
                            <h2 className="text-xl font-bold text-neutral-focus mb-4">Your Cleaner</h2>
                            <div className="flex items-center space-x-4">
                                <img src={cleaner.imageUrl} alt={cleaner.name} className="w-16 h-16 rounded-full object-cover"/>
                                <div>
                                    <p className="font-bold text-lg text-neutral-focus">{cleaner.name}</p>
                                    <div className="flex items-center space-x-1 mt-1">
                                        <StarRating rating={cleaner.rating} />
                                        <span className="text-xs text-slate-500">({cleaner.reviewsCount})</span>
                                    </div>
                                </div>
                            </div>
                            <hr className="my-6"/>
                            <h3 className="font-semibold text-neutral-focus mb-2">Booking Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-slate-600">Base Rate</span><span>${cleaner.hourlyRate}/hr</span></div>
                                <div className="flex justify-between"><span className="text-slate-600">Duration</span><span>{bookingDetails.hours} hours</span></div>
                                <div className="flex justify-between"><span className="text-slate-600">Base Cleaning</span><span>${costDetails.subtotal.toFixed(2)}</span></div>
                                {bookingDetails.selectedTasks.length > 0 && (
                                     <div className="pt-2 mt-2 border-t">
                                        <p className="font-semibold text-slate-700 mb-1">Specialized Services:</p>
                                        {bookingDetails.selectedTasks.map(task => (
                                            <div key={task.name} className="flex justify-between">
                                                <span className="text-slate-600 pl-2">{task.name}</span>
                                                <span>+${(task.rate * bookingDetails.hours).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex justify-between pt-2 border-t"><span className="text-slate-600">Platform Fee</span><span>${costDetails.platformFee.toFixed(2)}</span></div>
                                <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t"><span className="text-neutral-focus">Total</span><span>${costDetails.total.toFixed(2)}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;