import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero Section',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Title',
          type: 'localeString',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'description',
          title: 'Description',
          type: 'localeText',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'buttonTrial',
          title: 'Trial Button Text',
          type: 'localeString',
        },
        {
          name: 'buttonDemo',
          title: 'Demo Button Text',
          type: 'localeString',
        },
        {
          name: 'backgroundImage',
          title: 'Background Image',
          type: 'image',
          options: {
            hotspot: true,
          },
        },
        {
          name: 'backgroundVideo',
          title: 'Background Video (optional)',
          type: 'file',
          options: {
            accept: 'video/*',
          },
        },
      ],
    }),
    defineField({
      name: 'howItWorks',
      title: 'How It Works Section',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Section Title',
          type: 'localeString',
        },
        {
          name: 'description',
          title: 'Section Description',
          type: 'localeText',
        },
        {
          name: 'steps',
          title: 'Steps',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'title',
                  title: 'Step Title',
                  type: 'localeString',
                },
                {
                  name: 'description',
                  title: 'Step Description',
                  type: 'localeText',
                },
                {
                  name: 'icon',
                  title: 'Icon',
                  type: 'image',
                },
              ],
            },
          ],
          validation: (Rule) => Rule.max(3),
        },
      ],
    }),
    defineField({
      name: 'cta',
      title: 'Call to Action Section',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'CTA Title',
          type: 'localeString',
        },
        {
          name: 'description',
          title: 'CTA Description',
          type: 'localeText',
        },
        {
          name: 'button',
          title: 'Button Text',
          type: 'localeString',
        },
        {
          name: 'backgroundImage',
          title: 'Background Image',
          type: 'image',
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Homepage Content',
      }
    },
  },
})
