import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { onlineManager, QueryClient } from '@tanstack/react-query';

/** React Query has no signal of its own on native — without this it assumes the device is
 * always online and every offline screen would see fetches hang instead of pausing. */
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
  });
});

/** Treatment guidance, prices and Sell Smart results all rely on this cache
 * surviving app restarts so cached screens render with no network. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 30, // 30 days — treatment guidance changes rarely
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'scc.query-cache',
});
