import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'siteUrl',
      title: 'Site URL',
      type: 'url',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
    }),
    defineField({
      name: 'navigation',
      title: 'Navigation Menu',
      type: 'object',
      fields: [
        {
          name: 'menuItems',
          title: 'Menu Items',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'label',
                  title: 'Label',
                  type: 'localeString',
                },
                {
                  name: 'url',
                  title: 'URL',
                  type: 'string',
                },
                {
                  name: 'hasChildren',
                  title: 'Has Dropdown',
                  type: 'boolean',
                },
                {
                  name: 'children',
                  title: 'Dropdown Items',
                  type: 'array',
                  of: [
                    {
                      type: 'object',
                      fields: [
                        {
                          name: 'label',
                          title: 'Label',
                          type: 'localeString',
                        },
                        {
                          name: 'url',
                          title: 'URL',
                          type: 'string',
                        },
                      ],
                    },
                  ],
                  hidden: ({parent}) => !parent?.hasChildren,
                },
              ],
            },
          ],
        },
        {
          name: 'ctaButton',
          title: 'CTA Button',
          type: 'object',
          fields: [
            {
              name: 'enable',
              title: 'Enable CTA Button',
              type: 'boolean',
            },
            {
              name: 'label',
              title: 'Button Label',
              type: 'localeString',
            },
            {
              name: 'link',
              title: 'Button Link',
              type: 'url',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'footer',
      title: 'Footer',
      type: 'object',
      fields: [
        {
          name: 'description',
          title: 'Footer Description',
          type: 'localeText',
        },
        {
          name: 'copyright',
          title: 'Copyright Text',
          type: 'localeString',
        },
      ],
    }),
    defineField({
      name: 'seo',
      title: 'Default SEO',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          title: 'Default Meta Title',
          type: 'localeString',
        },
        {
          name: 'metaDescription',
          title: 'Default Meta Description',
          type: 'localeText',
        },
        {
          name: 'ogImage',
          title: 'Default OG Image',
          type: 'image',
          description: 'Recommended: 1200x630px',
        },
        {
          name: 'twitterHandle',
          title: 'Twitter Handle',
          type: 'string',
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Settings',
      }
    },
  },
})
