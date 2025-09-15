import React, { useState, useEffect, useRef } from 'react';
import type { User, Conversation, Message } from '../types';
import { CONVERSATIONS_DATA, CLEANERS_DATA } from '../constants';

interface MessagesPageProps {
    user: User;
    onNavigate: (page: string, props?: any) => void;
    initialConversationId?: string;
}

const MessagesPage: React.FC<MessagesPageProps> = ({ user, onNavigate, initialConversationId }) => {
    const [conversations, setConversations] = useState<Conversation[]>(CONVERSATIONS_DATA);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const enrichConversations = (convos: Conversation[]): Conversation[] => {
        return convos.map(convo => {
            const lastMessage = convo.messages[convo.messages.length - 1];
            return {
                ...convo,
                lastMessagePreview: lastMessage ? lastMessage.text : 'No messages yet.',
                lastMessageTimestamp: lastMessage ? lastMessage.timestamp : new Date(0).toISOString(),
            };
        });
    };

    useEffect(() => {
        let convos = [...CONVERSATIONS_DATA];
        if (initialConversationId) {
            const existing = convos.find(c => c.id === initialConversationId);
            if (!existing) {
                const cleanerId = parseInt(initialConversationId.split('-')[1], 10);
                const cleaner = CLEANERS_DATA.find(c => c.id === cleanerId);
                if (cleaner) {
                    const newConversation: Conversation = {
                        id: initialConversationId,
                        cleaner: cleaner,
                        messages: [],
                    };
                    convos.push(newConversation);
                }
            }
            setActiveConversationId(initialConversationId);
        } else if (convos.length > 0) {
            setActiveConversationId(convos[0].id);
        }
        setConversations(enrichConversations(convos));
    }, [initialConversationId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConversationId, conversations]);

    const activeConversation = conversations.find(c => c.id === activeConversationId);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;

        const message: Message = {
            id: `msg-${Date.now()}`,
            senderId: 'client',
            text: newMessage.trim(),
            timestamp: new Date().toISOString(),
        };

        const updatedConversations = conversations.map(convo => 
            convo.id === activeConversation.id 
                ? { ...convo, messages: [...convo.messages, message] }
                : convo
        );
        setConversations(enrichConversations(updatedConversations));
        setNewMessage('');
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };

    return (
        <div className="flex h-screen w-full bg-base-200 dark:bg-neutral-focus font-sans animate-fade-in">
            {/* Sidebar with conversation list */}
            <aside className={`
                ${activeConversationId ? 'hidden md:flex' : 'flex'}
                flex-col w-full md:w-1/3 lg:w-1/4
                bg-base-100 dark:bg-neutral
                border-r border-base-300 dark:border-slate-700
            `}>
                <div className="flex items-center justify-between p-4 border-b border-base-300 dark:border-slate-700 flex-shrink-0">
                    <h1 className="text-xl font-bold text-neutral-focus dark:text-base-200">Messages</h1>
                    <button onClick={() => onNavigate('dashboard')} className="p-2 rounded-full hover:bg-base-200 dark:hover:bg-neutral-focus">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {conversations.sort((a, b) => new Date(b.lastMessageTimestamp!).getTime() - new Date(a.lastMessageTimestamp!).getTime()).map(convo => (
                        <div key={convo.id} onClick={() => setActiveConversationId(convo.id)} className={`flex items-center p-3 cursor-pointer border-l-4 ${activeConversationId === convo.id ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-base-200 dark:hover:bg-neutral-focus'}`}>
                            <img src={convo.cleaner.imageUrl} alt={convo.cleaner.name} className="w-12 h-12 rounded-full object-cover mr-3" />
                            <div className="flex-grow overflow-hidden">
                                <p className="font-semibold text-neutral-focus dark:text-base-200 truncate">{convo.cleaner.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{convo.lastMessagePreview}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main chat view */}
            <main className={`
                ${!activeConversationId ? 'hidden md:flex' : 'flex'}
                flex-col w-full md:w-2/3 lg:w-3/4
            `}>
                {activeConversation ? (
                    <>
                        <header className="flex items-center p-3 border-b border-base-300 dark:border-slate-700 bg-base-100 dark:bg-neutral flex-shrink-0">
                            <button onClick={() => setActiveConversationId(null)} className="md:hidden mr-3 p-1 rounded-full hover:bg-base-200 dark:hover:bg-neutral-focus">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            </button>
                            <img src={activeConversation.cleaner.imageUrl} alt={activeConversation.cleaner.name} className="w-10 h-10 rounded-full object-cover mr-3" />
                            <h2 className="font-bold text-lg text-neutral-focus dark:text-base-200">{activeConversation.cleaner.name}</h2>
                        </header>
                        <div className="flex-grow p-4 overflow-y-auto bg-base-200 dark:bg-neutral-focus">
                            <div className="space-y-4">
                                {activeConversation.messages.map(msg => (
                                    <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === 'client' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.senderId !== 'client' && <img src={activeConversation.cleaner.imageUrl} alt="cleaner" className="w-6 h-6 rounded-full self-start"/>}
                                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.senderId === 'client' ? 'bg-primary text-primary-content rounded-br-none' : 'bg-base-100 dark:bg-neutral text-neutral-focus dark:text-base-200 rounded-bl-none'}`}>
                                            <p>{msg.text}</p>
                                            <p className={`text-xs mt-1 opacity-70 ${msg.senderId === 'client' ? 'text-right' : 'text-left'}`}>{formatTimestamp(msg.timestamp)}</p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>
                        <div className="p-4 bg-base-100 dark:bg-neutral border-t border-base-300 dark:border-slate-700 flex-shrink-0">
                            <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-grow block w-full px-4 py-2 bg-base-200 dark:bg-neutral-focus border border-slate-300 dark:border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <button type="submit" className="bg-primary text-primary-content p-3 rounded-full hover:bg-primary-focus transition duration-300 shadow-lg" aria-label="Send message">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <h2 className="text-xl font-semibold">Welcome to your Inbox</h2>
                        <p>Select a conversation to start messaging.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MessagesPage;