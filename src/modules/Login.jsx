import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Lock, Mail } from 'lucide-react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(credentials);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  const quickLogin = (email) => {
    const result = login({ email, password: 'password123' });
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4 overflow-auto">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Sistema de Gestión Farmacéutica
          </h1>
          <p className="text-blue-100">
            Control de Inventario con Validación Automática
          </p>
        </div>

        <Card className="shadow-2xl">
          {error && (
            <Alert 
              type="error" 
              message={error}
              onClose={() => setError('')}
              className="mb-4"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Correo Electrónico"
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              placeholder="usuario@pharma.com"
              required
              icon={Mail}
            />

            <Input
              label="Contraseña"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              placeholder="••••••••"
              required
              icon={Lock}
            />

            <Button type="submit" className="w-full" icon={LogIn}>
              Iniciar Sesión
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3 text-center">Acceso rápido de prueba:</p>
            <div className="space-y-2">
              <Button 
                onClick={() => quickLogin('almacen@pharma.com')}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Operador de Almacén
              </Button>
              <Button 
                onClick={() => quickLogin('compras@pharma.com')}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Administrador de Compras
              </Button>
              <Button 
                onClick={() => quickLogin('admin@pharma.com')}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Administrador del Sistema
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Contraseña para todos: password123
            </p>
          </div>
        </Card>

        <div className="mt-6 text-center text-white text-sm">
          <p>Sistema desarrollado según normas BPMN y PEPS/FIFO</p>
          <p className="mt-2 opacity-75">© 2025 - Sistema de Gestión Farmacéutica</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
