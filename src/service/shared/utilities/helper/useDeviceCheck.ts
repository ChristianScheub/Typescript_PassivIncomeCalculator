import { useState, useEffect } from 'react';

export const useDeviceCheck = () => {
  const [isDesktop, setIsDesktop] = useState<boolean>(false);

  useEffect(() => {
    const checkDevice = () => {
      if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
        setIsDesktop(true);
      } else {
        setIsDesktop(false);
      }
    };
    if (typeof window !== 'undefined') {
      checkDevice();
      window.addEventListener('resize', checkDevice);
      return () => window.removeEventListener('resize', checkDevice);
    }
    // Im Server/Worker-Kontext: immer false
    setIsDesktop(false);
    return undefined;
  }, []);

  return isDesktop;
};