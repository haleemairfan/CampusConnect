
import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userId, setUserId] = useState(null);

    return (
        <UserContext.Provider value ={{userId, setUserId}}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook for easier usage of the context
export const useUser = () => {
    return useContext(UserContext);
};