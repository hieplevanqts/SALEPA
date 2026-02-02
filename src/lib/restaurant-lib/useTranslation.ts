import { useStore } from './store';
import { translations, type TranslationKey } from './i18n';

type TranslationDictionary = typeof translations.vi;
type TranslationFunction = ((
  key: TranslationKey,
) => TranslationDictionary[TranslationKey]) &
  TranslationDictionary;

export function useTranslation() {
  const language = useStore((state) => state.language);
  const setLanguage = useStore((state) => state.setLanguage);
  
  const dictionary = translations[language];
  const t = Object.assign(
    (key: TranslationKey) => dictionary[key],
    dictionary,
  ) as TranslationFunction;
  
  return { t, language, setLanguage };
}