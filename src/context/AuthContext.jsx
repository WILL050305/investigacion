import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay sesión guardada
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (credentials) => {
    // Simulación de login (en producción conectar a API)
    const users = {
      'almacen@pharma.com': { 
        email: 'almacen@pharma.com', 
        name: 'Operador Almacén', 
        role: 'warehouse',
        permissions: ['scan', 'register_intake', 'view_discrepancies']
      },
      'compras@pharma.com': { 
        email: 'compras@pharma.com', 
        name: 'Administrador Compras', 
        role: 'purchasing',
        permissions: ['manage_po', 'review_validations', 'approve_documents']
      },
      'admin@pharma.com': { 
        email: 'admin@pharma.com', 
        name: 'Administrador Sistema', 
        role: 'admin',
        permissions: ['all']
      }
    };

    const foundUser = users[credentials.email];
    if (foundUser && credentials.password === 'password123') {
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      return { success: true, user: foundUser };
    }
    return { success: false, error: 'Credenciales inválidas' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    return user.permissions.includes('all') || user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};
