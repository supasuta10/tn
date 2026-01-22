import React, { createContext, useContext, useState, useEffect } from 'react';

const TextScaleContext = createContext();

export const useTextScale = () => {
  const context = useContext(TextScaleContext);
  if (!context) {
    throw new Error('useTextScale must be used within a TextScaleProvider');
  }
  return context;
};

export const TextScaleProvider = ({ children }) => {
  const [scale, setScale] = useState(() => {
    // Get scale from localStorage or default to 'normal'
    const savedScale = localStorage.getItem('textScale');
    return savedScale || 'normal';
  });

  // Apply scale to the html element
  useEffect(() => {
    const html = document.documentElement;

    // Remove all scale classes
    html.classList.remove('text-scale-small', 'text-scale-normal', 'text-scale-large', 'text-scale-xlarge');

    // Add the current scale class
    html.classList.add(`text-scale-${scale}`);

    // Save to localStorage
    localStorage.setItem('textScale', scale);
  }, [scale]);


  const value = {
    scale,
    setScale,
    isSmall: scale === 'small',
    isNormal: scale === 'normal',
    isLarge: scale === 'large',
  };

  return (
    <TextScaleContext.Provider value={value}>
      {children}
    </TextScaleContext.Provider>
  );
};