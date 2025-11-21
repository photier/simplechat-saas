import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { LANGUAGES } from '@/i18n/constants';

const languages = {
  en: { flag: '🇬🇧', label: 'English', nativeName: 'English' },
  tr: { flag: '🇹🇷', label: 'Turkish', nativeName: 'Türkçe' },
  de: { flag: '🇩🇪', label: 'German', nativeName: 'Deutsch' },
  fr: { flag: '🇫🇷', label: 'French', nativeName: 'Français' },
  es: { flag: '🇪🇸', label: 'Spanish', nativeName: 'Español' },
  ar: { flag: '🇸🇦', label: 'Arabic', nativeName: 'العربية' },
  ru: { flag: '🇷🇺', label: 'Russian', nativeName: 'Русский' },
};

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common');
  const { user, setUser } = useAuth();
  const currentLang = i18n.language as keyof typeof languages;

  const handleLanguageChange = async (lang: string) => {
    try {
      // Change language immediately (optimistic update)
      i18n.changeLanguage(lang);

      // Save to backend (production-grade)
      if (user) {
        await authService.updatePreferences({ language: lang });

        // Update user context
        const updatedUser = await authService.getMe();
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Failed to save language preference:', error);
      toast.error(t('errors.languageSaveFailed'));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 hover:text-primary hover:border-primary"
        >
          <span className="text-lg">{languages[currentLang]?.flag || '🇬🇧'}</span>
          <span className="hidden sm:inline">{languages[currentLang]?.nativeName || 'English'}</span>
          <Globe className="size-4!" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Select Language
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(languages).map(([code, { flag, label, nativeName }]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code)}
            className={`gap-3 cursor-pointer py-2.5 ${
              currentLang === code ? 'bg-primary/10 text-primary font-semibold' : ''
            }`}
          >
            <span className="text-xl">{flag}</span>
            <div className="flex flex-col">
              <span className="font-medium">{nativeName}</span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            {currentLang === code && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
