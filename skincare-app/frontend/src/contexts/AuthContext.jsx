import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const API_URL = "http://localhost:8000";

    useEffect(() => {
        let isMounted = true;
        
        const fetchUser = async () => {
            try {
                const response = await axios.get(`${API_URL}/users/me`);
                if (isMounted) {
                    setUser(response.data);
                }
            } catch (error) {
                if (isMounted) {
                    logout();
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        } else {
            delete axios.defaults.headers.common['Authorization'];
            setLoading(false);
        }

        return () => {
            isMounted = false;
        };
    }, [token]);

    const login = async (email, password) => {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);

        const response = await axios.post(`${API_URL}/login`, formData);
        const { access_token } = response.data;
        localStorage.setItem('token', access_token);
        setToken(access_token);
        
        // Headers will be set by the useEffect when token state changes
        return true;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, API_URL, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
