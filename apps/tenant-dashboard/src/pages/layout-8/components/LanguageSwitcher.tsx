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

      // Save to backend ONLY if user is authenticated
      if (user) {
        try {
          await authService.updatePreferences({ language: lang });

          // Update user context
          const updatedUser = await authService.getMe();
          setUser(updatedUser);
        } catch (error) {
          // Silently fail if not authenticated - language is already saved in localStorage by i18n
          console.warn('Could not save language to backend (user may not be authenticated):', error);
        }
      }
      // If no user, language is still saved in localStorage by i18next automatically
    } catch (error) {
      console.error('Failed to change language:', error);
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
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs text-muted-foreground py-1.5">
          Select Language
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(languages).map(([code, { flag, label, nativeName }]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code)}
            className={`gap-2 cursor-pointer py-1.5 ${
              currentLang === code ? 'bg-primary/10 text-primary font-semibold' : ''
            }`}
          >
            <span className="text-lg">{flag}</span>
            <div className="flex flex-col leading-tight">
              <span className="font-medium text-sm">{nativeName}</span>
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
            {currentLang === code && (
              <span className="ml-auto text-primary text-sm">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
