import React from 'react';
import type { Cleaner } from '../types';

interface JobStatusTrackerProps {
    cleaner: Cleaner;
    statuses: string[];
    currentStatusIndex: number;
    eta: number;
}

const JobStatusTracker: React.FC<JobStatusTrackerProps> = ({ cleaner, statuses, currentStatusIndex, eta }) => {
    return (
        <div className="bg-base-100 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
            {/* Header */}
            <div className="flex items-center pb-4 border-b border-slate-200">
                <img src={cleaner.imageUrl} alt={cleaner.name} className="w-14 h-14 rounded-full object-cover mr-4" />
                <div>
                    <h3 className="font-bold text-lg text-neutral-focus">{statuses[currentStatusIndex]}</h3>
                    {currentStatusIndex < 3 && eta > 0 ? (
                         <p className="text-primary font-semibold">Arriving in ~{eta} min</p>
                    ) : (
                         <p className="text-slate-500">Cleaning is in progress</p>
                    )}
                </div>
            </div>

            {/* Status Steps */}
            <div className="pt-5">
                <ol className="relative ml-2">
                    {statuses.map((status, index) => {
                        const isCompleted = index < currentStatusIndex;
                        const isCurrent = index === currentStatusIndex;

                        return (
                            <li key={status} className={`pl-8 pb-6 border-l-2 last:pb-0 ${isCompleted ? 'border-primary' : 'border-slate-200'}`}>
                                <span className={`absolute -left-[11px] flex items-center justify-center w-5 h-5 rounded-full ring-4 ring-white
                                    ${isCurrent ? 'bg-primary' : (isCompleted ? 'bg-primary' : 'bg-slate-200')}`}>
                                    {isCompleted && !isCurrent && (
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    )}
                                     {isCurrent && (
                                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                     )}
                                </span>
                                <p className={`font-semibold ${isCurrent ? 'text-primary' : (isCompleted ? 'text-neutral-focus' : 'text-slate-400')}`}>
                                    {status}
                                </p>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </div>
    );
};

export default JobStatusTracker;