import { useStore } from './store';
import { translations, type TranslationKey } from './i18n';

export function useTranslation() {
  const language = useStore((state) => state.language);
  
  // Return translation object directly for object access (t.dashboard)
  const t = translations[language];
  
  return { t, language };
}