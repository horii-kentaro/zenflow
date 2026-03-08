import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

type ApiState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export function useApiGet<T>(path: string, deps: unknown[] = []) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const refetch = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await api.get<T>(path);
      setState({ data, loading: false, error: null });
    } catch (e: any) {
      setState({ data: null, loading: false, error: e.message });
    }
  }, [path, ...deps]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}
