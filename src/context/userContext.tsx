"use client";

import { createContext, useContext } from "react";
import { useAuthContext } from "@/context/AuthContext";

// Legacy user type for compatibility
interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface UserContextType {
    user: User | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    refreshUser: () => Promise<void>;
    logout: () => void;
}

const UserContext = createContext<UserContextType>({
    user: null,
    isLoading: true,
    setUser: () => { },
    refreshUser: async () => { },
    logout: () => { },
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const { user: authUser, loading, logout: authLogout } = useAuthContext();
    
    // Convert new auth user to legacy format
    const legacyUser: User | null = authUser ? {
        id: authUser.uid,
        name: authUser.displayName || authUser.email?.split('@')[0] || 'User',
        email: authUser.email,
        role: 'Admin' // All authenticated users are admins in simplified system
    } : null;

    const setUser = () => {
        // No-op for compatibility
    };

    const refreshUser = async () => {
        // No-op for compatibility
    };

    return (
        <UserContext.Provider value={{ 
            user: legacyUser, 
            isLoading: loading, 
            setUser, 
            refreshUser, 
            logout: authLogout 
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext); 