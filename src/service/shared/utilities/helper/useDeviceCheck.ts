import { useState, useEffect } from 'react';

export const useDeviceCheck = () => {
  const [isDesktop, setIsDesktop] = useState<boolean>(false);

  useEffect(() => {
    const checkDevice = () => {
      if (window.innerWidth >= 1024) {
        setIsDesktop(true);
      }
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return isDesktop;
};