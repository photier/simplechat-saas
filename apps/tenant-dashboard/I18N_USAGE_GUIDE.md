# i18n Usage Guide - Tenant Dashboard

## Overview

Complete production-grade i18n setup with React 19, i18next, and TypeScript.

## File Structure

```
apps/tenant-dashboard/
├── src/
│   ├── locales/
│   │   ├── en/
│   │   │   ├── dashboard.json  # Dashboard-specific translations
│   │   │   └── common.json     # Common translations (buttons, status, etc)
│   │   └── tr/
│   │       ├── dashboard.json  # Turkish dashboard translations
│   │       └── common.json     # Turkish common translations
│   ├── hooks/
│   │   └── useTranslation.ts   # Custom typed hook
│   ├── i18n.ts                 # i18n configuration
│   ├── i18n.d.ts               # TypeScript type definitions
│   └── main.tsx                # Initialized with Suspense
```

## Installation Complete

All dependencies installed:
- react-i18next: ^16.2.3
- i18next: ^25.6.0
- i18next-browser-languagedetector: ^8.2.0
- socket.io-client: ^4.8.1
- class-variance-authority: ^0.7.1
- framer-motion: ^12.23.24
- date-fns: ^4.1.0
- @radix-ui/react-dialog: ^1.1.2
- @radix-ui/react-dropdown-menu: ^2.1.2
- @radix-ui/react-slot: ^1.1.1
- clsx: ^2.1.1
- tailwind-merge: ^2.7.0

## Usage Examples

### 1. Basic Component Usage

```tsx
import { useTranslation } from '@/hooks/useTranslation';

export function HeroStatsCard() {
  const { t } = useTranslation('dashboard');

  return (
    <div className="card">
      <h3>{t('hero.onlineNow')}</h3>
      <p>{t('hero.users')}</p>
    </div>
  );
}
```

### 2. Multiple Namespaces

```tsx
import { useTranslation } from '@/hooks/useTranslation';

export function UserTable() {
  const { t } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');

  return (
    <div>
      <h2>{t('table.userId')}</h2>
      <button>{tCommon('actions.save')}</button>
      <p>{tCommon('status.loading')}</p>
    </div>
  );
}
```

### 3. Interpolation

```tsx
const { t } = useTranslation('common');

// With variables
const message = t('validation.minLength', { min: 5 });
// Output: "Minimum length is 5 characters"
```

### 4. Language Switching

```tsx
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: 'en' | 'tr') => {
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('tr')}>Türkçe</button>
    </div>
  );
}
```

## Translation Keys

### Dashboard Namespace

**Hero Stats:**
- `hero.onlineNow` - "Online Now" / "Çevrimiçi"
- `hero.totalImpressions` - "Total Impressions" / "Toplam Tıklama"
- `hero.conversionRate` - "Conversion Rate" / "Konversiyon Oranı"

**Charts:**
- `charts.dailyUserCount` - "Daily User Count"
- `charts.aiVsHumanSupport` - "AI vs Human Support"
- `charts.messageDistribution` - "Message Distribution"
- `charts.countryDistribution` - "Country Distribution"
- `charts.activityHeatmap` - "Activity Heatmap"
- `charts.channelDistribution` - "Channel Distribution"

**Table:**
- `table.userId` - "User ID"
- `table.lastMessage` - "Last Message"
- `table.location` - "Location"
- `table.messageCount` - "Message Count"
- `table.lastActivity` - "Last Activity"
- `table.viewConversation` - "View Conversation"

**Conversation Modal:**
- `conversation.title` - "Conversation"
- `conversation.close` - "Close"
- `conversation.noMessages` - "No messages found"
- `conversation.loading` - "Loading messages..."

### Common Namespace

**Actions:**
- `actions.save`, `actions.cancel`, `actions.delete`, `actions.edit`
- `actions.create`, `actions.update`, `actions.search`, `actions.filter`
- `actions.export`, `actions.import`, `actions.refresh`

**Status:**
- `status.loading`, `status.success`, `status.error`, `status.warning`
- `status.online`, `status.offline`, `status.active`, `status.inactive`

**Time:**
- `time.today`, `time.yesterday`, `time.thisWeek`, `time.lastWeek`
- `time.minute`, `time.minutes`, `time.hour`, `time.hours`
- `time.day`, `time.days`, `time.ago`, `time.justNow`

**Validation:**
- `validation.required`, `validation.email`
- `validation.minLength`, `validation.maxLength`
- `validation.min`, `validation.max`

## Language Detection

The system automatically detects language in this order:
1. **localStorage** (`i18nextLng` key)
2. **Browser language** (navigator.language)
3. **HTML tag** (lang attribute)
4. **Fallback** (English - 'en')

## Adding New Translations

### 1. Add to JSON files

**apps/tenant-dashboard/src/locales/en/dashboard.json:**
```json
{
  "newSection": {
    "title": "New Title",
    "description": "New Description"
  }
}
```

**apps/tenant-dashboard/src/locales/tr/dashboard.json:**
```json
{
  "newSection": {
    "title": "Yeni Başlık",
    "description": "Yeni Açıklama"
  }
}
```

### 2. Use in Components

```tsx
const { t } = useTranslation('dashboard');
<h1>{t('newSection.title')}</h1>
<p>{t('newSection.description')}</p>
```

## TypeScript Support

Full type safety enabled:
- Autocomplete for translation keys
- Compile-time errors for missing keys
- Namespace validation

```tsx
// ✅ TypeScript will autocomplete these
t('hero.onlineNow')
t('table.userId')

// ❌ TypeScript will error on invalid keys
t('hero.invalidKey') // Error: Property 'invalidKey' does not exist
```

## Best Practices

1. **Use Namespaces**: Keep translations organized
   - `dashboard` - Dashboard-specific UI
   - `common` - Reusable translations

2. **Consistent Keys**: Use dot notation
   - `section.subsection.key`
   - Example: `hero.onlineNow`, `table.userId`

3. **Avoid Hardcoded Text**: Always use translations
   ```tsx
   // ❌ Bad
   <button>Save</button>

   // ✅ Good
   <button>{t('actions.save')}</button>
   ```

4. **Interpolation**: Use for dynamic content
   ```tsx
   // ❌ Bad
   `Showing ${count} users`

   // ✅ Good
   t('pagination.showing') + ' ' + count + ' ' + t('hero.users')
   ```

5. **Fallback Values**: Always provide English first
   - English is the fallback language
   - Ensure all keys exist in `en` folder

## Testing

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Test language switching in browser
# Open browser console and run:
i18n.changeLanguage('tr')
i18n.changeLanguage('en')
```

## Configuration

**Language Detection Order:**
1. localStorage (`i18nextLng`)
2. Browser navigator language
3. HTML lang attribute

**Fallback Language:** English (en)

**Default Namespace:** dashboard

**Debug Mode:** Enabled in development (import.meta.env.DEV)

## Production Considerations

- All translations loaded synchronously (no lazy loading)
- Language detection cached in localStorage
- Suspense enabled for loading states
- Debug mode disabled in production
- Type-safe translation keys

## Next Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Update components to use translations:**
   - Import `useTranslation` hook
   - Replace hardcoded strings with `t()` calls

3. **Test language switching:**
   - Add LanguageSwitcher component to header
   - Test all translations in both languages

4. **Add more translations as needed:**
   - Create new sections in JSON files
   - Update both English and Turkish versions

---

**Status:** ✅ Setup Complete
**Languages:** English (en), Turkish (tr)
**Namespaces:** dashboard, common
**Type Safety:** Full TypeScript support
**Auto-Detection:** localStorage + Browser + HTML lang
