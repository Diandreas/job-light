import { useState, useEffect } from 'react';

// Median.co bridge hook
export function useMedian() {
  const [isReady, setIsReady] = useState(false);
  const [isAndroidApp, setIsAndroidApp] = useState(false);

  useEffect(() => {
    // Check if running in Median app
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isMedianAndroid = userAgent.includes('median') && userAgent.includes('android');

      setIsAndroidApp(isMedianAndroid);
      setIsReady(true);
    }
  }, []);

  return {
    isReady,
    isAndroidApp,
  };
}
