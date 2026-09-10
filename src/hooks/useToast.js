import { useCallback, useRef, useState } from 'react';

export function useToast() {
  const [message, setMessage] = useState('');
  const [show, setShow] = useState(false);
  const timerRef = useRef(null);

  const toast = useCallback((msg) => {
    setMessage(msg);
    setShow(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShow(false), 2600);
  }, []);

  return { message, show, toast };
}
