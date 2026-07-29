// ========================================
// FILE: src/components/LanguageSwitcher.tsx
// ========================================
import { useTranslation } from 'react-i18next';
import ReactCountryFlag from 'react-country-flag';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import langs from '@/localization/langs';
import { setAppLanguage } from '@/helpers/language-helpers';

interface LanguageSwitcherProps {
  /** 'sm' para o modo connected, 'md' para standalone */
  size?: 'sm' | 'md';
}

export default function LanguageSwitcher({ size = 'md' }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const currentLang = langs.find(l => l.key === i18n.language) ?? langs[0];

  const btnClass = size === 'sm'
    ? 'w-7 h-7 flex items-center justify-center rounded-md transition-colors select-none bg-white/15 hover:bg-white/25'
    : 'h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted bg-muted/50 transition-colors select-none';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={btnClass}
          title={currentLang.nativeName}
          aria-label="Change language"
        >
          <ReactCountryFlag
            countryCode={currentLang.countryCode}
            svg
            style={{ width: '18px', height: '13px', borderRadius: '2px', display: 'block' }}
            aria-hidden
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[175px]">
        {langs.map(lang => (
          <DropdownMenuItem
            key={lang.key}
            onClick={() => setAppLanguage(lang.key, i18n)}
            className={`flex items-center gap-2.5 cursor-pointer ${i18n.language === lang.key ? 'font-semibold bg-muted/60' : ''}`}
          >
            <ReactCountryFlag
              countryCode={lang.countryCode}
              svg
              style={{ width: '18px', height: '13px', borderRadius: '2px', flexShrink: 0 }}
              aria-hidden
            />
            <span className="text-sm">{lang.nativeName}</span>
            {i18n.language === lang.key && (
              <span className="ml-auto text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
