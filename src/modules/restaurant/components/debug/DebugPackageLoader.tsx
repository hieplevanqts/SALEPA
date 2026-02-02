import { useEffect } from 'react';
import { useStore } from '../../../../lib/restaurant-lib/store';
import { loadDemoPackagesV2 } from '../../../../lib/restaurant-lib/demoPackagesV2';

export default function DebugPackageLoader() {
  useEffect(() => {
    // Wait for store to be ready
    const checkAndLoadPackages = () => {
      try {
        const store = useStore.getState();
        const { customerTreatmentPackages } = store;
        
        // Auto-load demo packages if empty or old structure
        const needsLoad = customerTreatmentPackages.length === 0 || 
          customerTreatmentPackages.some(pkg => !pkg.sessions || pkg.sessions.length === 0);

        if (needsLoad) {
          console.log('🔄 Auto-loading demo packages V2...');
          loadDemoPackagesV2();
          console.log('✅ Demo packages V2 loaded successfully');
        } else {
          console.log('✅ Packages already loaded:', customerTreatmentPackages.length, 'packages');
        }
      } catch (error) {
        console.error('❌ Error loading packages:', error);
      }
    };

    // Delay to ensure store is ready
    const timer = setTimeout(checkAndLoadPackages, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return null;
}