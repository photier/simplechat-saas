import {defineType} from 'sanity'

const supportedLanguages = [
  {id: 'en', title: 'English', isDefault: true},
  {id: 'tr', title: 'Türkçe'},
  {id: 'de', title: 'Deutsch'},
  {id: 'fr', title: 'Français'},
  {id: 'es', title: 'Español'},
  {id: 'ar', title: 'العربية'},
  {id: 'ru', title: 'Русский'},
]

export default defineType({
  name: 'localeText',
  title: 'Localized Text',
  type: 'object',
  fields: supportedLanguages.map((lang) => ({
    name: lang.id,
    type: 'text',
    title: lang.title,
    rows: 3,
  })),
})
