import { useCallback, useEffect, useState } from "react";

/**
 * Generic data-fetching hook for GET-style requests.
 * requestFn must be a stable-enough function (e.g. wrapped in useCallback by
 * the caller, or an inline arrow re-created per dependency change).
 */
export default function useFetch(requestFn, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    requestFn()
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.friendlyMessage || err.message || "Failed to load data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const cancel = load();
    return cancel;
  }, [load]);

  return { data, error, loading, refetch: load };
}
