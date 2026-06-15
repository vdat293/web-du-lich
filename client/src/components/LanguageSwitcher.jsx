import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

export default function LanguageSwitcher({ compact = false }) {
  const { t } = useTranslation();
  const language = i18n.language === 'en' ? 'en' : 'vi';

  const toggleLanguage = () => {
    void i18n.changeLanguage(language === 'vi' ? 'en' : 'vi');
    localStorage.setItem('aoklevart_language', language === 'vi' ? 'en' : 'vi');
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white/80 backdrop-blur px-3 py-1.5 text-[11px] font-semibold tracking-[0.18em] text-charcoal transition-colors hover:bg-neutral-50 ${compact ? 'min-w-[56px]' : 'min-w-[74px]'}`}
      aria-label={language === 'vi' ? t('header.languageSwitch') : t('header.languageSwitchVi')}
      title={language === 'vi' ? t('header.languageSwitch') : t('header.languageSwitchVi')}
    >
      <span className={language === 'vi' ? 'text-primary' : 'text-neutral-400'}>VI</span>
      <span className="mx-1 text-neutral-300">/</span>
      <span className={language === 'en' ? 'text-primary' : 'text-neutral-400'}>EN</span>
    </button>
  );
}
