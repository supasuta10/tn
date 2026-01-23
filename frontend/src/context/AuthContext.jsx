import React, { createContext, useState, useEffect, useContext } from 'react';
import UserService from '../services/UserService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await UserService.getUserInfo();
                    setUser(response.data.data);
                } catch (error) {
                    console.error("Failed to fetch user:", error);
                    localStorage.removeItem('token'); // Clear invalid token
                }
            }
            setLoading(false);
        };

        fetchUser();
    }, []);

    const login = (userData, token) => {
        setUser(userData);
        localStorage.setItem('token', token);
        // Optionally cache user for instant load next time
        // localStorage.setItem('user_cache', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
