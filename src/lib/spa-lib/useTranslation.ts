import { useStore } from './store';
import { translations, type TranslationKey } from './i18n';

export function useTranslation() {
  const language = useStore((state) => state.language);
  const t = (key: TranslationKey) => translations[language][key];
  
  return { t, language };
}
