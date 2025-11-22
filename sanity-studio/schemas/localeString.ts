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
  name: 'localeString',
  title: 'Localized String',
  type: 'object',
  fields: supportedLanguages.map((lang) => ({
    name: lang.id,
    type: 'string',
    title: lang.title,
  })),
})
