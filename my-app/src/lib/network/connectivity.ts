import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

/**
 * NetInfo pushes state changes as they happen (no polling), so the
 * indicator updates well within the 2-second budget from the brief.
 */
export function useIsOnline(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });
    NetInfo.fetch().then((state) => {
      setIsOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });
    return unsubscribe;
  }, []);

  return isOnline;
}
