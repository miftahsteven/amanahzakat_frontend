import { useEffect, useRef } from 'react';

export function useFocusRecord<T extends { id: string }>(
  focusId: string | undefined,
  list: T[],
  onFound: (row: T) => void,
  onConsumed?: () => void
) {
  const foundRef = useRef(onFound);
  const consumedRef = useRef(onConsumed);
  foundRef.current = onFound;
  consumedRef.current = onConsumed;

  useEffect(() => {
    if (!focusId || list.length === 0) return;
    const row = list.find((item) => item.id === focusId);
    if (!row) return;
    foundRef.current(row);
    consumedRef.current?.();
  }, [focusId, list]);
}
