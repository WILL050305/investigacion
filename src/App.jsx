import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import Login from './modules/Login';
import Dashboard from './modules/Dashboard';
import WarehouseIntake from './modules/WarehouseIntake';
import PurchasingModule from './modules/PurchasingModule';
import InventoryManagement from './modules/InventoryManagement';
import AlertsDashboard from './modules/AlertsDashboard';
import Layout from './components/Layout';

// Componente de ruta protegida
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <InventoryProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/warehouse" 
              element={
                <ProtectedRoute>
                  <WarehouseIntake />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/purchasing" 
              element={
                <ProtectedRoute>
                  <PurchasingModule />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/inventory" 
              element={
                <ProtectedRoute>
                  <InventoryManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/alerts" 
              element={
                <ProtectedRoute>
                  <AlertsDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </InventoryProvider>
    </AuthProvider>
  );
}

export default App;
