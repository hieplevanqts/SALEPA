import { useStore } from './store';
import { translations } from './i18n';

export type TranslationFunction = (key: string) => string;

export function useTranslation() {
  const language = useStore((state) => state.language);
  const setLanguage = useStore((state) => state.setLanguage);

  const t: TranslationFunction = (key) => {
    const keys = key.split('.');
    let result: any = translations[language];

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key;
      }
    }

    return typeof result === 'string' ? result : key;
  };

  return { t, language, setLanguage };
}
