import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Analysis from './pages/Analysis';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children }) => {
    const { token, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="login" element={<Login />} />
                        <Route path="register" element={<Register />} />
                        
                        <Route path="analyze" element={
                            <ProtectedRoute>
                                <Analysis />
                            </ProtectedRoute>
                        } />
                        
                        <Route path="profile" element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        } />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
