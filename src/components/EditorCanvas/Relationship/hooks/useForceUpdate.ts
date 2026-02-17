import { useState, useCallback } from 'react';

export default function useForceUpdate() {
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => {
    setTick(tick => tick + 1);
  }, []);
  return forceUpdate;
}
