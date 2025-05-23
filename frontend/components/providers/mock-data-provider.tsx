'use client';

import { useEffect } from 'react';

export function MockDataProvider() {
  useEffect(() => {
    // Disable mock data since we're now using real data from Email Bison API
    if (process.env.NODE_ENV === 'development') {
      window.process = window.process || {};
      window.process.env = window.process.env || {};
      // Set to false to use real API data
      window.process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
      console.log('Using real data from Email Bison API');
    }
  }, []);

  return null;
}
