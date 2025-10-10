import React, { useState, useEffect } from 'react';
import type { TaskList } from '../types';

/**
 * Props for the GenerateListModal component.
 */
interface GenerateListModalProps {
    /** Whether the modal is open. */
    isOpen: boolean;
    /** Callback function to close the modal. */
    onClose: () => void;
    /** Callback function to handle the newly generated task list. */
    onListGenerated: (list: TaskList) => void;
}

/**
 * A modal that allows users to generate a task list using an AI prompt.
 * @param {GenerateListModalProps} props The props for the component.
 * @returns {JSX.Element | null} The rendered component or null if not open.
 */
const GenerateListModal: React.FC<GenerateListModalProps> = ({ isOpen, onClose, onListGenerated }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
            // Reset state on close
            setPrompt('');
            setIsLoading(false);
            setError(null);
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);


    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError("Please describe the cleaning you need.");
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:3001/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'An error occurred.');
            }

            const generatedData = await response.json();
            
            if (!generatedData.listName || !Array.isArray(generatedData.tasks)) {
                 throw new Error("Invalid response format from the server.");
            }

            const newList: TaskList = {
                id: Date.now().toString(),
                name: generatedData.listName,
                tasks: generatedData.tasks.map((task: { text: string }, index: number) => ({
                    id: `${Date.now()}-${index}`, // More robust ID
                    text: task.text,
                    completed: false,
                })),
            };

            onListGenerated(newList);
            onClose();

        } catch (e: any) {
            console.error("Error generating task list:", e);
            setError(e.message || "Sorry, an error occurred while generating the list. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div
                className="relative bg-base-100 rounded-2xl shadow-2xl w-full max-w-lg p-8 transform transition-all duration-300 scale-95 animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <style>{`
                    @keyframes fade-in-up {
                        from { opacity: 0; transform: translateY(20px) scale(0.95); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }
                    .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
                `}</style>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors z-10"
                    aria-label="Close modal"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-neutral mb-2">Generate a Task List with AI</h2>
                    <p className="text-gray-600 mb-6">Describe the cleaning job, and we'll create a checklist for you. For example: "Post-party cleanup for a 2-bedroom apartment".</p>
                </div>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="ai-prompt" className="sr-only">Cleaning description</label>
                        <textarea
                            id="ai-prompt"
                            rows={3}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="What needs to be cleaned?"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full flex justify-center items-center space-x-2 bg-primary text-primary-content font-bold py-3 px-4 rounded-lg hover:bg-primary-focus transition-all duration-300 transform hover:scale-105 disabled:bg-primary/50 disabled:scale-100"
                    >
                        {isLoading && (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        <span>{isLoading ? 'Generating...' : 'Generate Checklist'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GenerateListModal;