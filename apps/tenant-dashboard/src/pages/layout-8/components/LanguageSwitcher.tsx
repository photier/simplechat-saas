import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';

const languages = {
  tr: { flag: '🇹🇷', label: 'Türkçe' },
  en: { flag: '🇬🇧', label: 'English' },
};

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language as keyof typeof languages;

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 hover:text-primary hover:border-primary"
        >
          <span className="text-lg">{languages[currentLang]?.flag || '🇹🇷'}</span>
          <span className="hidden sm:inline">{languages[currentLang]?.label.toUpperCase() || 'TÜRKÇE'}</span>
          <Globe className="size-4!" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {Object.entries(languages).map(([code, { flag, label }]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code)}
            className={`gap-2 cursor-pointer ${
              currentLang === code ? 'bg-primary/10 text-primary font-semibold' : ''
            }`}
          >
            <span className="text-lg">{flag}</span>
            <span>{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
