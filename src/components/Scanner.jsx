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
    setError('');
    setShowCamera(true);
    setIsScanning(true);

    // Esperar a que el video esté en el DOM
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      console.log('Iniciando cámara...');
      
      // Intentar iniciar directamente con undefined para usar la cámara por defecto
      await reader.decodeFromVideoDevice(
        undefined, // undefined usa la cámara por defecto
        videoRef.current,
        (result, err) => {
          if (result) {
            console.log('Código detectado:', result.getText());
            const scannedCode = result.getText();
            setCode(scannedCode);
            stopCamera();
          }
          if (err && err.name !== 'NotFoundException') {
            console.error('Error en escaneo:', err);
          }
        }
      );
      
      console.log('Cámara iniciada exitosamente');
      setIsScanning(false); // La cámara está activa pero no "escaneando"
      
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      
      let errorMessage = 'Error al acceder a la cámara. ';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage += 'Debes permitir el acceso a la cámara en tu navegador.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage += 'No se encontró ninguna cámara en este dispositivo.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage += 'La cámara está siendo usada por otra aplicación.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage += 'Este navegador no soporta acceso a la cámara. Usa Chrome, Firefox o Safari.';
      } else if (err.name === 'SecurityError') {
        errorMessage += 'Por seguridad, la cámara solo funciona en conexiones HTTPS.';
      } else {
        errorMessage += err.message || 'Verifica los permisos y que otra app no esté usando la cámara.';
      }
      
      setError(errorMessage);
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
          <div className="relative bg-black rounded-lg overflow-hidden min-h-[300px] flex items-center justify-center">
            <video 
              ref={videoRef} 
              className="w-full h-auto max-h-96"
              autoPlay
              playsInline
              muted
            />
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-3"></div>
                  <p className="text-sm">Iniciando cámara...</p>
                </div>
              </div>
            )}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4">
              <p className="text-white text-center text-sm">
                {isScanning ? 'Cargando cámara...' : 'Apunta la cámara al código de barras'}
              </p>
            </div>
          </div>
        )}

        {/* Mensajes de error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm font-medium mb-2">{error}</p>
            <div className="text-red-700 text-xs space-y-1">
              <p>📱 <strong>En móvil:</strong> Toca "Permitir" cuando aparezca el mensaje de permisos</p>
              <p>💻 <strong>En PC:</strong> Haz clic en el ícono de cámara 🎥 en la barra de direcciones</p>
              <p>🔒 <strong>HTTPS requerido:</strong> La cámara solo funciona en sitios seguros (https://)</p>
            </div>
          </div>
        )}

        {/* Información sobre HTTPS */}
        {!showCamera && !error && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 text-xs">
              💡 <strong>Nota:</strong> El escáner de cámara requiere HTTPS (conexión segura). 
              En desarrollo local (localhost) funciona sin problemas. En Vercel se usa HTTPS automáticamente.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default Scanner;
