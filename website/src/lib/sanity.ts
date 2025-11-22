import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

export const sanityClient = createClient({
  projectId: '5d1lf95h',
  dataset: 'production',
  useCdn: true, // Use CDN for fast reads
  apiVersion: '2024-01-01',
})

// Image URL builder
const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

// Helper to get localized string
export function getLocalizedString(
  field: any,
  locale: string = 'en'
): string {
  if (!field) return ''
  return field[locale] || field.en || ''
}

// Helper to get localized text
export function getLocalizedText(
  field: any,
  locale: string = 'en'
): string {
  if (!field) return ''
  return field[locale] || field.en || ''
}
