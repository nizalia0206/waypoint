import { useCallback, useEffect, useState } from 'react';
import { getPoints, updatePoints, POINTS_UPDATED_EVENT } from '../data/rewardsStore';

// Same [value, setValue] shape as useState (setPoints accepts either a
// number or an updater function), but the value is shared across every
// component that calls this hook, since it's backed by rewardsStore.
export function usePoints() {
  const [points, setPointsState] = useState(getPoints);

  useEffect(() => {
    const onUpdate = () => setPointsState(getPoints());
    window.addEventListener(POINTS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(POINTS_UPDATED_EVENT, onUpdate);
  }, []);

  const setPoints = useCallback((updater) => {
    setPointsState(updatePoints(updater));
  }, []);

  return [points, setPoints];
}
