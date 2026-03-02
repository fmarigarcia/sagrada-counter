import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const handleToggle = (): void => {
    void i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es');
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={t('language.switch')}
      className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700"
    >
      {i18n.language === 'es' ? t('language.en') : t('language.es')}
    </button>
  );
};

export default LanguageSwitcher;
