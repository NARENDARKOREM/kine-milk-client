import React, { createContext, useContext } from 'react';

// Define SI units for weight and volume
const siUnits = {
  weight: [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'g', label: 'Gram (g)' },
    { value: 'mg', label: 'Milligram (mg)' },
    { value: 't', label: 'Tonne (t)' },
    { value: 'µg', label: 'Microgram (µg)' },
  ],
  volume: [
    { value: 'L', label: 'Liter (L)' },
    { value: 'mL', label: 'Milliliter (mL)' },
    { value: 'cm³', label: 'Cubic Centimeter (cm³)' },
    { value: 'dm³', label: 'Cubic Decimeter (dm³)' },
    { value: 'm³', label: 'Cubic Meter (m³)' },
  ],
};

// Create the Unit Context
const UnitContext = createContext();

// Unit Provider component
export const UnitProvider = ({ children }) => {
  return (
    <UnitContext.Provider value={siUnits}>
      {children}
    </UnitContext.Provider>
  );
};

// Custom hook to use the Unit Context
export const useUnits = () => {
  const context = useContext(UnitContext);
  if (!context) {
    throw new Error('useUnits must be used within a UnitProvider');
  }
  return context;
};