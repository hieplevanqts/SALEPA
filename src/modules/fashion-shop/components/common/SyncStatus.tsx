import { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, Cloud, CloudOff, AlertCircle } from 'lucide-react';
// import { supabaseService } from '../../../../lib/fashion-shop-lib/supabaseService'; // Removed - using localStorage only
import { useTranslation } from '../../../../lib/fashion-shop-lib/useTranslation';

export function SyncStatus() {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update pending count every 5 seconds
    const interval = setInterval(() => {
      // setPendingCount(supabaseService.getPendingSyncCount()); // Removed - no sync needed
      setPendingCount(0); // Always 0 for localStorage-only app
    }, 5000);

    // Get last sync status
    // Removed - no sync in localStorage-only app
    // supabaseService.getSyncStatus().then((status) => {
    //   if (status) {
    //     setLastSync(status.lastSync);
    //   }
    // });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleManualSync = async () => {
    // Removed - no sync in localStorage-only app
    setSyncing(true);
    try {
      // await supabaseService.syncFromServer();
      setLastSync(new Date().toISOString());
      setPendingCount(0);
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-white rounded-lg shadow-lg border-2 p-3 flex items-center gap-3 transition-all ${
        isOnline ? 'border-green-500' : 'border-orange-500'
      }`}>
        {/* Online/Offline Status */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <Wifi className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-sm font-medium text-green-700">{t('online')}</div>
                {lastSync && (
                  <div className="text-xs text-gray-500">
                    {t('lastSync')}: {new Date(lastSync).toLocaleTimeString('vi-VN')}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <WifiOff className="w-5 h-5 text-orange-600" />
              <div>
                <div className="text-sm font-medium text-orange-700">{t('offline')}</div>
                <div className="text-xs text-gray-500">{t('offlineMode')}</div>
              </div>
            </>
          )}
        </div>

        {/* Pending Sync Count */}
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 pl-3 border-l border-gray-300">
            <Cloud className="w-4 h-4 text-blue-600" />
            <div>
              <div className="text-xs text-gray-600">{t('pendingSync')}</div>
              <div className="text-sm font-medium text-blue-700">{pendingCount} {t('itemsPending')}</div>
            </div>
          </div>
        )}

        {/* Manual Sync Button */}
        {isOnline && (
          <button
            onClick={handleManualSync}
            disabled={syncing}
            className={`p-2 rounded-lg transition-all ${
              syncing 
                ? 'bg-blue-100 text-blue-400 cursor-not-allowed' 
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }`}
            title={t('manualSync')}
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
    </div>
  );
}