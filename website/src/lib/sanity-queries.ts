import { sanityClient } from './sanity'

export async function getHomepage() {
  const query = `*[_type == "homepage"][0] {
    _id,
    hero {
      title,
      description,
      buttonTrial,
      buttonDemo,
      backgroundImage {
        asset-> {
          _id,
          url
        }
      },
      backgroundVideo {
        asset-> {
          _id,
          url
        }
      }
    },
    howItWorks {
      title,
      description,
      steps[] {
        title,
        description,
        icon {
          asset-> {
            _id,
            url
          }
        }
      }
    },
    cta {
      title,
      description,
      button,
      backgroundImage {
        asset-> {
          _id,
          url
        }
      }
    }
  }`

  try {
    const data = await sanityClient.fetch(query)
    return data
  } catch (error) {
    console.error('Error fetching homepage data:', error)
    return null
  }
}

export async function getSiteSettings() {
  const query = `*[_type == "siteSettings"][0] {
    _id,
    siteName,
    siteUrl,
    logo {
      asset-> {
        _id,
        url
      }
    },
    favicon {
      asset-> {
        _id,
        url
      }
    },
    navigation,
    footer,
    seo
  }`

  try {
    const data = await sanityClient.fetch(query)
    return data
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return null
  }
}
