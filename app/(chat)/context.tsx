import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the type for your context value
interface AppContextType {
    userId: string | null;
    setGlobalUserId: (id: string | null) => void;
    getGlobalUserId: () => string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode; 
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [userId, setUserId] = useState<string | null>(null);

    const setGlobalUserId = (id: string | null) => {
        setUserId(id);
    };

    const getGlobalUserId = () => {
        return userId;
    }

    return (
        <AppContext.Provider value={{ userId, setGlobalUserId, getGlobalUserId }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};