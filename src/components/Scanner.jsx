import React, { useState, useRef, useEffect } from 'react';
import { Scan, Camera, X } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import Input from './Input';
import Button from './Button';
import Card from './Card';

const Scanner = ({ onScan, label = 'Escanear Código', placeholder = 'Código de lote' }) => {
  const [code, setCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const readerRef = useRef(null);

  useEffect(() => {
    return () => {
      // Limpiar recursos al desmontar
      if (readerRef.current) {
        readerRef.current.reset();
      }
    };
  }, []);

  const handleScan = () => {
    if (code.trim()) {
      onScan(code.trim());
      setCode('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    setIsScanning(true);
    setError('');

    try {
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      // Lista todos los dispositivos de video disponibles
      const devices = await reader.listVideoInputDevices();
      
      if (devices.length === 0) {
        setError('No se encontró ninguna cámara');
        setIsScanning(false);
        setShowCamera(false);
        return;
      }

      // Priorizar cámara trasera en móviles
      const device = devices.length > 1
        ? devices.find(d => d.label.toLowerCase().includes('back')) || devices[0]
        : devices[0];

      // Iniciar escaneo continuo
      await reader.decodeFromVideoDevice(
        device.deviceId,
        videoRef.current,
        (result, err) => {
          if (result) {
            const scannedCode = result.getText();
            setCode(scannedCode); // Pone el código en el campo de entrada
            stopCamera(); // Cierra la cámara
            // No llamamos onScan aquí, dejamos que el usuario presione "Registrar"
          }
          // Ignorar errores de lectura continua
        }
      );
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      setError('Error al acceder a la cámara. Verifica los permisos.');
      setIsScanning(false);
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (readerRef.current) {
      readerRef.current.reset();
      readerRef.current = null;
    }
    setIsScanning(false);
    setShowCamera(false);
    setError('');
  };

  return (
    <Card padding="lg">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <Input
              label={label}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              icon={Scan}
              disabled={isScanning}
            />
          </div>
          <div className="flex gap-3 mb-4 w-full sm:w-auto">
            <Button 
              onClick={handleScan} 
              disabled={!code.trim() || isScanning}
              size="md"
              className="flex-1 sm:flex-none"
            >
              Registrar
            </Button>
            <Button 
              onClick={showCamera ? stopCamera : startCamera}
              variant="secondary"
              icon={showCamera ? X : Camera}
              disabled={isScanning && !showCamera}
              size="md"
              className="flex-1 sm:flex-none"
            >
              {showCamera ? 'Cerrar' : 'Escanear'}
            </Button>
          </div>
        </div>

        {/* Visor de cámara */}
        {showCamera && (
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video 
              ref={videoRef} 
              className="w-full h-auto max-h-96"
              autoPlay
              playsInline
            />
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4">
              <p className="text-white text-center text-sm">
                Apunta la cámara al código de barras
              </p>
            </div>
          </div>
        )}

        {/* Mensajes de error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default Scanner;
