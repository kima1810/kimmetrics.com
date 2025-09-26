import { useState, useEffect } from 'react';
import type { APIResponse } from '../../types/common';

export function useAPI<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
): APIResponse<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(undefined);
        
        const result = await apiCall();
        
        if (!isCancelled) {
          setData(result);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err.response?.data?.error || err.message || 'An error occurred');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, dependencies);

  return { data, error, loading };
}
