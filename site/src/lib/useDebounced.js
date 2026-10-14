import { useEffect, useState } from 'react';

// Returns `value`, but only after it stopped changing for `ms` milliseconds.
// Used for text inputs so the preview doesn't request a new badge on every keystroke.
export function useDebounced(value, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}
