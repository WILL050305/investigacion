import React, { useState } from 'react';
import { Scan, Camera } from 'lucide-react';
import Input from './Input';
import Button from './Button';
import Card from './Card';

const Scanner = ({ onScan, label = 'Escanear Código', placeholder = 'Código de lote' }) => {
  const [code, setCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);

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

  // Simular escaneo con cámara (en producción usarías una librería de QR/Barcode)
  const simulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const mockCode = `LOT-${Date.now().toString().slice(-8)}`;
      setCode(mockCode);
      setIsScanning(false);
      onScan(mockCode);
    }, 1500);
  };

  return (
    <Card>
      <div className="flex gap-4 items-end">
        <div className="flex-1">
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
        <div className="flex gap-2 mb-4">
          <Button onClick={handleScan} disabled={!code.trim() || isScanning}>
            Registrar
          </Button>
          <Button 
            onClick={simulateScan} 
            variant="secondary"
            icon={Camera}
            disabled={isScanning}
          >
            {isScanning ? 'Escaneando...' : 'Escanear'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Scanner;
