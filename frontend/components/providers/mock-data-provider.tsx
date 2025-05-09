'use client';

import { useEffect } from 'react';

export function MockDataProvider() {
  useEffect(() => {
    // Only run in development mode
    if (process.env.NODE_ENV === 'development') {
      window.process = window.process || {};
      window.process.env = window.process.env || {};
      window.process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'true';
      console.log('Mock data enabled for development');
    }
  }, []);

  return null;
}
