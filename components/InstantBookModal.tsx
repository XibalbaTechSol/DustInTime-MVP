import React, { useState, useEffect, useMemo } from 'react';
import type { Cleaner, User, Booking } from '../types';
import { calculateAvailableSlots } from '../utils';

interface InstantBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    cleaner: Cleaner;
    user: User;
    existingBookings: Booking[];
    onBookingComplete: (booking: Booking) => void;
}

const PLATFORM_FEE_PERCENTAGE = 0.05;

const InstantBookModal: React.FC<InstantBookModalProps> = ({
    isOpen,
    onClose,
    cleaner,
    user,
    existingBookings,
    onBookingComplete
}) => {
    const today = useMemo(() => new Date().toISOString().split('T')[0], []);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const bookingDuration = 3; // Standard 3-hour booking

    // Reset state when cleaner changes or modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setSelectedDate('');
            setSelectedTime(null);
            setAvailableSlots([]);
            setIsConfirmed(false);
        }
    }, [isOpen, cleaner]);

    // Calculate available slots when a date is selected
    useEffect(() => {
        if (selectedDate) {
            setIsLoadingSlots(true);
            // Simulate a brief delay for a better UX
            setTimeout(() => {
                const dateObj = new Date(selectedDate + 'T00:00:00');
                const slots = calculateAvailableSlots(dateObj, cleaner, existingBookings, bookingDuration);
                setAvailableSlots(slots);
                setSelectedTime(null); // Reset time selection when date changes
                setIsLoadingSlots(false);
            }, 200);
        } else {
            setAvailableSlots([]);
        }
    }, [selectedDate, cleaner, existingBookings]);
    
    const costDetails = useMemo(() => {
        const subtotal = cleaner.hourlyRate * bookingDuration;
        const platformFee = subtotal * PLATFORM_FEE_PERCENTAGE;
        const total = subtotal + platformFee;
        // FIX: Added missing 'specializedTasksTotal' property to match the CostDetails type. Quick Book does not include specialized tasks.
        return { subtotal, specializedTasksTotal: 0, platformFee, total };
    }, [cleaner.hourlyRate, bookingDuration]);

    const handleConfirmBooking = () => {
        if (!selectedDate || !selectedTime || !user.profile || !('address' in user.profile) || !('location' in user.profile)) {
            console.error('Missing required booking information.');
            return;
        }

        // Convert "3:00 PM" to a full Date object
        const [time, period] = selectedTime.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        const bookingDateTime = new Date(selectedDate + 'T00:00:00');
        bookingDateTime.setHours(hours, minutes);

        const newBooking: Booking = {
            id: `booking-${Date.now()}`,
            cleaner,
            clientName: user.name,
            clientLocation: user.profile.location,
            clientAddress: user.profile.address,
            date: bookingDateTime.toISOString(),
            status: 'upcoming',
            service: `Standard ${bookingDuration}-Hour Cleaning`,
            hours: bookingDuration,
            costDetails,
        };
        
        setIsConfirmed(true);
        onBookingComplete(newBooking);
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 animate-fade-in">
            <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold text-neutral-focus">Quick Book: {cleaner.name}</h2>
                    <button onClick={onClose} className="p-1 -mt-1 -mr-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {isConfirmed ? (
                    <div className="text-center py-8">
                         <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <h3 className="text-2xl font-bold text-neutral-focus mb-2">Booking Confirmed!</h3>
                        <p className="text-slate-600">Your appointment is set. Redirecting to your dashboard...</p>
                    </div>
                ) : (
                    <div className="mt-6 space-y-6">
                        {/* Date Selection */}
                        <div>
                             <label htmlFor="booking-date" className="block text-sm font-medium text-slate-700 mb-1">1. Select a date</label>
                             <input
                                type="date"
                                id="booking-date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={today}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                             />
                        </div>

                        {/* Time Slot Selection */}
                        {selectedDate && (
                            <div className="animate-fade-in">
                                <label className="block text-sm font-medium text-slate-700 mb-2">2. Select an available {bookingDuration}-hour slot</label>
                                {isLoadingSlots ? (
                                    <div className="text-center p-4 text-slate-500">Checking availability...</div>
                                ) : availableSlots.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-2">
                                        {availableSlots.map(slot => (
                                            <button 
                                                key={slot} 
                                                onClick={() => setSelectedTime(slot)}
                                                className={`py-2 px-1 text-sm font-semibold rounded-md border transition-colors ${selectedTime === slot ? 'bg-primary text-primary-content border-primary-focus' : 'bg-base-100 hover:border-primary hover:text-primary'}`}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center p-4 bg-slate-50 rounded-md text-slate-600">
                                        No available {bookingDuration}-hour slots on this day. Please try another date.
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Cost Summary & Confirmation */}
                        {selectedTime && (
                             <div className="space-y-4 pt-4 border-t animate-fade-in">
                                <h3 className="font-semibold text-lg">Cost Summary</h3>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between"><span className="text-slate-600">{bookingDuration} hours at ${cleaner.hourlyRate}/hr</span><span>${costDetails.subtotal.toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-600">Platform Fee</span><span>${costDetails.platformFee.toFixed(2)}</span></div>
                                    <div className="flex justify-between font-bold text-base pt-1 border-t"><span className="text-neutral-focus">Total</span><span>${costDetails.total.toFixed(2)}</span></div>
                                </div>
                                <button
                                    onClick={handleConfirmBooking}
                                    className="w-full bg-primary text-primary-content font-bold py-3 px-4 rounded-lg hover:bg-primary-focus transition-all duration-300"
                                >
                                    Confirm Booking for {selectedTime}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstantBookModal;