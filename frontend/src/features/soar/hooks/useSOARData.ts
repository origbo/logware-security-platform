import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { setLoading, setError } from "../slices/soarSlice";

/**
 * Hook for optimized data fetching in SOAR components
 *
 * This hook standardizes data fetching, loading states, caching,
 * error handling, and provides performance optimizations
 *
 * @param queryHook - RTK Query hook (e.g., useGetPlaybooksQuery)
 * @param queryParams - Parameters to pass to the query hook
 * @param options - Additional options for customizing behavior
 */
function useSOARData<T, P = void>(
  queryHook: (params: P) => {
    data: T | undefined;
    isLoading: boolean;
    isError: boolean;
    error: any;
    refetch: () => void;
  },
  queryParams: P,
  options: {
    featureType:
      | "automation"
      | "hunting"
      | "anomaly"
      | "incidents"
      | "collaboration";
    transformData?: (data: T) => any;
    enableCaching?: boolean;
    refreshInterval?: number;
    skipQuery?: boolean;
  }
) {
  const {
    featureType,
    transformData,
    enableCaching = true,
    refreshInterval = 0,
    skipQuery = false,
  } = options;

  const dispatch = useDispatch();
  const [cachedData, setCachedData] = useState<any>(null);

  // Get query results from RTK Query hook
  const { data, isLoading, isError, error, refetch } = queryHook(queryParams);

  // Transform data if transform function is provided
  const processedData = transformData && data ? transformData(data) : data;

  // Update global loading and error states
  useEffect(() => {
    if (!skipQuery) {
      dispatch(setLoading({ type: featureType, value: isLoading }));
    }
  }, [dispatch, featureType, isLoading, skipQuery]);

  useEffect(() => {
    if (isError && error && !skipQuery) {
      dispatch(
        setError({
          type: featureType,
          value: error.message || "An error occurred while fetching data",
        })
      );
    } else if (!isError && !skipQuery) {
      dispatch(setError({ type: featureType, value: null }));
    }
  }, [dispatch, featureType, isError, error, skipQuery]);

  // Cache data when it's loaded if caching is enabled
  useEffect(() => {
    if (enableCaching && processedData && !isLoading && !isError) {
      setCachedData(processedData);
    }
  }, [enableCaching, processedData, isLoading, isError]);

  // Set up refresh interval if provided
  useEffect(() => {
    if (refreshInterval > 0 && !skipQuery) {
      const intervalId = setInterval(() => {
        refetch();
      }, refreshInterval);

      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, refetch, skipQuery]);

  // Force refresh function with debounce protection
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(() => {
    if (!isRefreshing && !skipQuery) {
      setIsRefreshing(true);
      refetch();
      // Prevent multiple refreshes within 500ms
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, [isRefreshing, refetch, skipQuery]);

  return {
    // Return cached data if available, otherwise return processed data
    data: (enableCaching && cachedData) || processedData,
    isLoading,
    isError,
    error,
    refresh,
    isRefreshing,
  };
}

export default useSOARData;
