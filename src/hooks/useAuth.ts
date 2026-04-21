import { useState } from 'react';

// Basic useAuth hook to manage token/user locally
export const useAuth = () => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [user, setUser] = useState<any | null>(null);

    const login = (newToken: string, userInfo: any) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userInfo);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return { token, user, login, logout, isAuthenticated: !!token };
};
