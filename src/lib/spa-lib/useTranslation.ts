import { useStore } from './store';
import { translations } from './i18n';

type TranslationDictionary = typeof translations.vi;
export type TranslationFunction = ((key: string) => string) & TranslationDictionary;

export function useTranslation() {
  const language = useStore((state) => state.language);
  const setLanguage = useStore((state) => state.setLanguage);

  const dictionary = translations[language] ?? translations.vi;
  const translate = (key: string): string => {
    const keys = key.split('.');
    let result: any = dictionary;

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key;
      }
    }

    return typeof result === 'string' ? result : key;
  };

  const t = Object.assign(translate, dictionary) as TranslationFunction;

  return { t, language, setLanguage };
}
