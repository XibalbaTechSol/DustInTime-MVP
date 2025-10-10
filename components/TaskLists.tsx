import React, { useState, useEffect, useMemo } from 'react';
import type { Task, TaskList } from '../types';
import GenerateListModal from './GenerateListModal';

const STORAGE_KEY = 'dust_in_time_task_lists';

/**
 * A component for managing task lists, including creating, deleting, and updating tasks.
 * It also supports generating task lists with AI and sending notifications for due tasks.
 * @returns {JSX.Element} The rendered component.
 */
const TaskLists: React.FC = () => {
    // State for all task lists
    const [taskLists, setTaskLists] = useState<TaskList[]>([]);
    
    // State for UI interaction
    const [activeListId, setActiveListId] = useState<string | null>(null);
    const [newListName, setNewListName] = useState('');
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState('default');

    // On mount, check notification permission status
    useEffect(() => {
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
        }
    }, []);

    // Load from localStorage on initial render
    useEffect(() => {
        try {
            const storedData = localStorage.getItem(STORAGE_KEY);
            if (storedData) {
                const parsedData: TaskList[] = JSON.parse(storedData);
                setTaskLists(parsedData);
                // Set the first list as active if it exists
                if (parsedData.length > 0 && !activeListId) {
                    setActiveListId(parsedData[0].id);
                }
            }
        } catch (error) {
            console.error("Failed to load task lists from localStorage", error);
        }
    }, []); // Empty dependency array means this runs once on mount

    // Save to localStorage whenever taskLists change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(taskLists));
        } catch (error) {
            console.error("Failed to save task lists to localStorage", error);
        }
    }, [taskLists]);

    const activeList = useMemo(() => {
        return taskLists.find(list => list.id === activeListId) || null;
    }, [taskLists, activeListId]);

    const markReminderAsSent = (listId: string, taskId: string) => {
        setTaskLists(prevLists =>
            prevLists.map(list => {
                if (list.id === listId) {
                    return {
                        ...list,
                        tasks: list.tasks.map(task =>
                            task.id === taskId ? { ...task, reminderSent: true } : task
                        ),
                    };
                }
                return list;
            })
        );
    };

    // Reminder checking logic
    useEffect(() => {
        if (notificationPermission !== 'granted') return;

        const interval = setInterval(() => {
            const now = new Date();
            taskLists.forEach(list => {
                list.tasks.forEach(task => {
                    if (task.dueDate && !task.reminderSent && new Date(task.dueDate) <= now) {
                        new Notification('Task Due: Dust in Time', {
                            body: `"${task.text}" from your "${list.name}" list is due now.`,
                            icon: '/vite.svg',
                        });
                        markReminderAsSent(list.id, task.id);
                    }
                });
            });
        }, 15000); // Check every 15 seconds

        return () => clearInterval(interval);
    }, [taskLists, notificationPermission]);

    // --- List Handlers ---
    const handleCreateList = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newListName.trim()) return;
        const newList: TaskList = {
            id: Date.now().toString(),
            name: newListName.trim(),
            tasks: [],
        };
        const updatedLists = [...taskLists, newList];
        setTaskLists(updatedLists);
        setActiveListId(newList.id);
        setNewListName('');
    };

    const handleDeleteList = (listId: string) => {
        const updatedLists = taskLists.filter(list => list.id !== listId);
        setTaskLists(updatedLists);
        // If the deleted list was the active one, reset active list
        if (activeListId === listId) {
            setActiveListId(updatedLists.length > 0 ? updatedLists[0].id : null);
        }
    };
    
    const handleListGenerated = (newList: TaskList) => {
        const updatedLists = [...taskLists, newList];
        setTaskLists(updatedLists);
        setActiveListId(newList.id);
    };

    // --- Task Handlers ---
    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskText.trim() || !activeListId) return;
        const newTask: Task = {
            id: Date.now().toString(),
            text: newTaskText.trim(),
            completed: false,
            dueDate: newTaskDueDate || undefined,
            reminderSent: false,
        };
        const updatedLists = taskLists.map(list => 
            list.id === activeListId
                ? { ...list, tasks: [...list.tasks, newTask] }
                : list
        );
        setTaskLists(updatedLists);
        setNewTaskText('');
        setNewTaskDueDate('');
    };

    const handleToggleTask = (taskId: string) => {
        if (!activeListId) return;
        const updatedLists = taskLists.map(list => {
            if (list.id === activeListId) {
                return {
                    ...list,
                    tasks: list.tasks.map(task => 
                        task.id === taskId ? { ...task, completed: !task.completed } : task
                    ),
                };
            }
            return list;
        });
        setTaskLists(updatedLists);
    };

    const handleDeleteTask = (taskId: string) => {
        if (!activeListId) return;
        const updatedLists = taskLists.map(list => {
            if (list.id === activeListId) {
                return {
                    ...list,
                    tasks: list.tasks.filter(task => task.id !== taskId),
                };
            }
            return list;
        });
        setTaskLists(updatedLists);
    };

    const handleRequestNotificationPermission = () => {
        if (!('Notification' in window)) {
            alert("This browser does not support desktop notification");
            return;
        }
        Notification.requestPermission().then(permission => {
            setNotificationPermission(permission);
        });
    };

    const formatDueDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <div className="bg-base-100 p-6 rounded-xl shadow-lg mt-8">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h2 className="text-2xl font-bold text-neutral">Task Lists</h2>
                <div className="flex items-center gap-2">
                    {notificationPermission === 'default' && (
                        <button onClick={handleRequestNotificationPermission} className="flex items-center space-x-2 bg-slate-100 text-slate-700 font-semibold py-2 px-3 rounded-lg hover:bg-slate-200 transition duration-300 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
                            <span>Enable Reminders</span>
                        </button>
                    )}
                    <button
                        onClick={() => setIsGenerateModalOpen(true)}
                        className="flex items-center space-x-2 bg-primary/10 text-primary-focus font-semibold py-2 px-3 rounded-lg hover:bg-primary/20 transition duration-300 text-sm"
                        aria-label="Generate a new task list with AI"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        <span>Generate with AI</span>
                    </button>
                </div>
            </div>
            {notificationPermission === 'denied' && (
                 <p className="text-xs text-center text-red-600 mb-4 -mt-2">Notifications are blocked. You won't receive task reminders. Please enable them in your browser settings.</p>
            )}

            <div className="flex flex-col md:flex-row gap-6">
                
                {/* Left Column: List of Lists */}
                <div className="md:w-1/3 border-r-0 md:border-r md:pr-6 border-gray-200">
                    <form onSubmit={handleCreateList} className="mb-4">
                        <label htmlFor="new-list-name" className="sr-only">New list name</label>
                        <div className="flex gap-2">
                            <input
                                id="new-list-name"
                                type="text"
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                placeholder="Create new list..."
                                className="flex-grow block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            />
                            <button type="submit" className="bg-primary text-primary-content font-semibold p-2 rounded-lg hover:bg-primary-focus transition duration-300" aria-label="Add new list">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    </form>
                    <ul className="space-y-2">
                        {taskLists.map(list => (
                            <li key={list.id} className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition-colors ${activeListId === list.id ? 'bg-primary/10 text-primary-focus' : 'hover:bg-gray-100'}`}>
                                <button onClick={() => setActiveListId(list.id)} className="flex-grow text-left font-medium">
                                    {list.name}
                                </button>
                                <button onClick={() => handleDeleteList(list.id)} className="text-gray-400 hover:text-red-500 ml-2 p-1 rounded-full" aria-label={`Delete list ${list.name}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </li>
                        ))}
                         {taskLists.length === 0 && (
                            <p className="text-center text-gray-500 text-sm mt-4">No task lists yet.</p>
                        )}
                    </ul>
                </div>

                {/* Right Column: Tasks for Active List */}
                <div className="md:w-2/3">
                    {activeList ? (
                        <>
                            <h3 className="text-xl font-bold text-neutral mb-4">{activeList.name}</h3>
                            <form onSubmit={handleAddTask} className="mb-4 space-y-2">
                               <div className="flex gap-2">
                                    <input
                                        id="new-task-text"
                                        type="text"
                                        value={newTaskText}
                                        onChange={(e) => setNewTaskText(e.target.value)}
                                        placeholder="Add a new task..."
                                        className="flex-grow block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                    />
                                    <button type="submit" className="bg-primary text-primary-content font-semibold py-2 px-4 rounded-lg hover:bg-primary-focus transition duration-300">Add</button>
                                </div>
                                 <div>
                                    <label htmlFor="new-task-due-date" className="sr-only">Set reminder date and time</label>
                                    <input
                                        id="new-task-due-date"
                                        type="datetime-local"
                                        value={newTaskDueDate}
                                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                                        className="block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm text-gray-600"
                                        title="Set an optional reminder date and time"
                                    />
                                </div>
                            </form>
                            <ul className="space-y-3">
                                {activeList.tasks.map(task => (
                                    <li key={task.id} className="flex items-start p-2 rounded-md hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={task.completed}
                                            onChange={() => handleToggleTask(task.id)}
                                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary mt-0.5"
                                        />
                                        <div className="flex-grow mx-3">
                                            <span className={`${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{task.text}</span>
                                            {task.dueDate && (
                                                <div className={`flex items-center text-xs mt-1 ${task.reminderSent && !task.completed ? 'text-gray-400' : 'text-primary'}`}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>{formatDueDate(task.dueDate)}</span>
                                                    {task.reminderSent && !task.completed && <span className="italic ml-2">(Reminder sent)</span>}
                                                </div>
                                            )}
                                        </div>
                                        <button onClick={() => handleDeleteTask(task.id)} className="text-gray-400 hover:text-red-500 p-1 rounded-full flex-shrink-0" aria-label={`Delete task ${task.text}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                        </button>
                                    </li>
                                ))}
                                {activeList.tasks.length === 0 && (
                                    <p className="text-center text-gray-500 text-sm mt-4">This list is empty. Add a task!</p>
                                )}
                            </ul>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Select a list to view its tasks, or create a new one.</p>
                        </div>
                    )}
                </div>
            </div>
             <GenerateListModal 
                isOpen={isGenerateModalOpen}
                onClose={() => setIsGenerateModalOpen(false)}
                onListGenerated={handleListGenerated}
            />
        </div>
    );
};

export default TaskLists;