# 🌐 SimpleChat.bot - Marketing Website

**Last Updated:** 17 November 2025
**Status:** Planning Phase
**Tech Stack:** Astro + Sanity CMS + Tailwind CSS + Vercel
**Live URL:** https://simplechat.bot (to be deployed)

---

## 🎯 Project Overview

Modern, high-performance marketing website for SimpleChat SaaS platform.

**Goals:**
- ✅ Ultra-fast loading (< 1 second)
- ✅ Pixel-perfect design (modern, clean, professional)
- ✅ Easy content management (non-technical team can edit)
- ✅ SEO optimized (rank on Google)
- ✅ Mobile-first responsive
- ✅ Smooth animations and micro-interactions

**Target Audience:**
- Small/medium businesses
- E-commerce stores
- SaaS companies
- Marketing agencies
- Customer support teams

---

## 🏗️ Tech Stack

### **Frontend: Astro 4.x**
- **Why:** Ultra-fast static site generation, React component support
- **Features:** Zero JS by default, partial hydration, TypeScript
- **Performance:** 100/100 Lighthouse score
- **Build Time:** < 30 seconds

### **CMS: Sanity Studio**
- **Why:** Modern headless CMS, visual editor, real-time updates
- **Admin URL:** https://simplechat.sanity.studio
- **Features:**
  - Visual content editor
  - Image optimization
  - Version history
  - User roles (admin, editor)
  - Real-time preview
- **Pricing:** Free tier (100K requests/month)

### **Styling: Tailwind CSS 3.x**
- **Why:** Consistent with dashboard, utility-first, responsive
- **Custom Config:** Matches SimpleChat brand colors
- **Plugins:** Forms, Typography, Aspect Ratio

### **Animations: Framer Motion**
- **Why:** Smooth, performant animations
- **Use Cases:** Hero section, feature reveals, scroll animations

### **Deployment: Vercel**
- **Why:** Zero-config, automatic deploys, edge network
- **Features:**
  - Git push → auto deploy (30 seconds)
  - Preview deployments
  - Analytics
  - Image optimization
- **Pricing:** Free tier (hobby)

---

## 📐 Site Structure

### **Pages:**

```
simplechat.bot/
├── / (Homepage)
│   ├── Hero
│   ├── Features (6 key features)
│   ├── How It Works (3 steps)
│   ├── Pricing (3 plans)
│   ├── Testimonials
│   ├── FAQ
│   └── CTA
│
├── /features
│   ├── AI-Powered Chat
│   ├── Live Support (Premium)
│   ├── Analytics Dashboard
│   ├── Multi-Language
│   ├── Telegram Integration
│   └── Custom Branding
│
├── /pricing
│   ├── Plan Comparison Table
│   ├── FAQ
│   └── Free Trial CTA
│
├── /blog
│   ├── Blog List (pagination)
│   └── Blog Post (dynamic)
│
├── /docs
│   ├── Getting Started
│   ├── Installation Guide
│   ├── API Reference
│   └── Troubleshooting
│
├── /about
│   ├── Our Story
│   ├── Team
│   └── Contact
│
└── /legal
    ├── Privacy Policy
    ├── Terms of Service
    └── Cookie Policy
```

---

## 🎨 Design System

### **Brand Colors:**
```css
--primary: #4c86f0;      /* Blue (BASIC plan) */
--premium: #9F7AEA;      /* Purple (PREMIUM plan) */
--success: #10B981;      /* Green (success states) */
--warning: #F59E0B;      /* Orange (warnings) */
--error: #EF4444;        /* Red (errors) */
--gray-50: #F9FAFB;      /* Backgrounds */
--gray-900: #111827;     /* Text */
```

### **Typography:**
```css
--font-heading: 'Inter', sans-serif;   /* Bold, modern */
--font-body: 'Inter', sans-serif;      /* Clean, readable */

/* Sizes */
--text-hero: 4rem (64px);
--text-h1: 3rem (48px);
--text-h2: 2.25rem (36px);
--text-h3: 1.875rem (30px);
--text-body: 1rem (16px);
--text-small: 0.875rem (14px);
```

### **Spacing:**
```css
--space-xs: 0.5rem (8px);
--space-sm: 1rem (16px);
--space-md: 1.5rem (24px);
--space-lg: 2rem (32px);
--space-xl: 4rem (64px);
--space-2xl: 6rem (96px);
```

### **Border Radius:**
```css
--radius-sm: 0.375rem (6px);   /* Buttons, inputs */
--radius-md: 0.5rem (8px);     /* Cards */
--radius-lg: 0.75rem (12px);   /* Modals */
--radius-xl: 1rem (16px);      /* Hero sections */
```

---

## 🎯 Template Selection

### **Chosen Template: AstroWind**

**Repository:** https://github.com/onwidget/astrowind
**Demo:** https://astrowind.vercel.app

**Why AstroWind?**
- ✅ SaaS-focused (pricing, features, testimonials built-in)
- ✅ Tailwind CSS (matches our stack)
- ✅ SEO optimized
- ✅ Blog + Docs support
- ✅ Responsive
- ✅ Well-documented
- ✅ Active maintenance
- ✅ **Free & Open Source**

**Alternative Considered:**
- ScrewFast (https://screwfast.uk) - More modern but newer, less documentation

---

## 📝 Sanity CMS Schema

### **Content Types:**

#### **1. Homepage Settings**
```typescript
{
  _type: 'homepage',
  hero: {
    title: string,
    subtitle: string,
    ctaText: string,
    ctaUrl: string,
    backgroundImage: image,
    videoUrl?: string, // Optional demo video
  },
  features: array<{
    icon: string,
    title: string,
    description: string,
  }>,
  howItWorks: array<{
    step: number,
    title: string,
    description: string,
    image: image,
  }>,
  testimonials: array<{
    name: string,
    role: string,
    company: string,
    avatar: image,
    quote: string,
    rating: number,
  }>,
  faq: array<{
    question: string,
    answer: text,
  }>,
}
```

#### **2. Pricing Plans**
```typescript
{
  _type: 'pricingPlan',
  name: string,           // "Free Trial", "BASIC", "PREMIUM"
  price: number,          // 0, 9.99, 19.99
  currency: string,       // "USD"
  interval: string,       // "month", "year"
  popular: boolean,       // Highlight as popular
  features: array<{
    text: string,
    included: boolean,
  }>,
  ctaText: string,
  ctaUrl: string,
}
```

#### **3. Blog Posts**
```typescript
{
  _type: 'post',
  title: string,
  slug: string,
  author: reference,
  publishedAt: date,
  excerpt: text,
  coverImage: image,
  body: blockContent,      // Rich text editor
  categories: array<reference>,
  tags: array<string>,
  seo: {
    metaTitle: string,
    metaDescription: string,
    ogImage: image,
  },
}
```

#### **4. Feature Pages**
```typescript
{
  _type: 'feature',
  title: string,
  slug: string,
  icon: string,
  heroImage: image,
  description: text,
  benefits: array<{
    title: string,
    description: string,
    icon: string,
  }>,
  screenshots: array<image>,
  cta: {
    text: string,
    url: string,
  },
}
```

#### **5. Documentation**
```typescript
{
  _type: 'doc',
  title: string,
  slug: string,
  category: string,       // "Getting Started", "API", etc.
  order: number,          // Sort order in sidebar
  body: blockContent,
  relatedDocs: array<reference>,
}
```

---

## 🚀 Implementation Phases

### **Phase 1: Setup & Foundation (Day 1)**

**Tasks:**
- [ ] Clone AstroWind template
- [ ] Setup Git repository (photier/simplechat-website)
- [ ] Configure Tailwind (brand colors)
- [ ] Setup Sanity project
- [ ] Connect Astro ↔ Sanity
- [ ] Deploy to Vercel (staging)

**Deliverable:** Basic site structure deployed

---

### **Phase 2: Homepage (Day 2-3)**

**Sections to Build:**

1. **Hero Section**
   - [ ] Headline + subheadline
   - [ ] CTA button (Start Free Trial)
   - [ ] Animated widget preview (embedded demo)
   - [ ] Gradient background
   - [ ] Scroll indicator

2. **Features Section**
   - [ ] 6 key features (icons + text)
   - [ ] Hover animations
   - [ ] Responsive grid (3 cols desktop, 1 col mobile)

3. **How It Works**
   - [ ] 3-step process
   - [ ] Screenshots for each step
   - [ ] Number badges (1, 2, 3)

4. **Pricing Section**
   - [ ] 3 plan cards (Free Trial, BASIC, PREMIUM)
   - [ ] Toggle: Monthly/Yearly
   - [ ] Popular badge
   - [ ] Feature comparison

5. **Testimonials**
   - [ ] Carousel (3 testimonials)
   - [ ] Star ratings
   - [ ] Customer logos

6. **FAQ**
   - [ ] Accordion (8-10 questions)
   - [ ] Search functionality

7. **Final CTA**
   - [ ] Banner with gradient
   - [ ] "Start Your Free Trial Today"

**Deliverable:** Complete homepage with Sanity CMS integration

---

### **Phase 3: Feature Pages (Day 4)**

**Pages:**
- [ ] /features/ai-powered-chat
- [ ] /features/live-support
- [ ] /features/analytics
- [ ] /features/telegram-integration
- [ ] /features/custom-branding
- [ ] /features/multi-language

**Template Structure:**
```
Hero Image
↓
Benefits (3-4 key points)
↓
Screenshots/Demo
↓
Use Cases
↓
CTA
```

**Deliverable:** 6 feature pages

---

### **Phase 4: Pricing Page (Day 5)**

**Sections:**
- [ ] Plan comparison table (detailed features)
- [ ] Calculator (estimate cost based on usage)
- [ ] FAQ specific to pricing
- [ ] Money-back guarantee badge
- [ ] Trust indicators (SSL, secure payment, etc.)

**Deliverable:** Comprehensive pricing page

---

### **Phase 5: Blog System (Day 6)**

**Setup:**
- [ ] Blog list page (grid layout)
- [ ] Blog post template
- [ ] Categories (Product Updates, Tutorials, Case Studies)
- [ ] Tags system
- [ ] Author profiles
- [ ] Related posts
- [ ] Social share buttons
- [ ] Newsletter signup (Brevo integration)

**Initial Content:**
- [ ] 3 blog posts (pre-written)
  - "How to Install SimpleChat on Your Website"
  - "5 Ways AI Chat Improves Customer Support"
  - "SimpleChat vs Competitors: A Comparison"

**Deliverable:** Fully functional blog

---

### **Phase 6: Documentation (Day 7)**

**Sections:**
- [ ] Getting Started
  - Installation
  - Configuration
  - First conversation
- [ ] Guides
  - Widget customization
  - Telegram setup
  - Analytics overview
- [ ] API Reference (if applicable)
- [ ] Troubleshooting
- [ ] Video tutorials (embed YouTube)

**Deliverable:** Comprehensive documentation site

---

### **Phase 7: Legal Pages (Day 8)**

**Pages:**
- [ ] Privacy Policy (GDPR compliant)
- [ ] Terms of Service
- [ ] Cookie Policy
- [ ] Refund Policy

**Tools:**
- Use Termly.io or TermsFeed.com for templates
- Customize for SimpleChat

**Deliverable:** Legal compliance

---

### **Phase 8: Optimizations (Day 9)**

**Performance:**
- [ ] Image optimization (WebP, lazy loading)
- [ ] Font optimization (preload critical fonts)
- [ ] Code splitting
- [ ] Minification
- [ ] CDN caching headers

**SEO:**
- [ ] Meta tags (all pages)
- [ ] OpenGraph images
- [ ] Sitemap.xml
- [ ] Robots.txt
- [ ] Schema.org markup (organization, product, FAQ)
- [ ] Google Analytics
- [ ] Google Search Console

**Accessibility:**
- [ ] ARIA labels
- [ ] Keyboard navigation
- [ ] Color contrast check
- [ ] Screen reader testing

**Deliverable:** 100/100 Lighthouse score

---

### **Phase 9: Sanity Studio Customization (Day 10)**

**Admin Panel Enhancements:**
- [ ] Custom dashboard (welcome screen)
- [ ] Preview URLs (see changes before publish)
- [ ] Media library organization
- [ ] Content validation rules
- [ ] Editor roles (admin, marketing, writer)
- [ ] Workflow: Draft → Review → Publish

**Training:**
- [ ] Admin panel walkthrough (video tutorial)
- [ ] Content editing guide (PDF)

**Deliverable:** Production-ready CMS

---

### **Phase 10: Launch Preparation (Day 11-12)**

**Pre-Launch Checklist:**
- [ ] Domain setup (simplechat.bot → Vercel)
- [ ] SSL certificate (auto via Vercel)
- [ ] Email setup (contact@simplechat.bot)
- [ ] Contact form (Formspree or similar)
- [ ] Live chat widget (SimpleChat dogfooding!)
- [ ] Analytics tracking
- [ ] Error monitoring (Sentry)
- [ ] Backup strategy (Git + Sanity export)
- [ ] Performance testing (GTmetrix, WebPageTest)
- [ ] Cross-browser testing (Chrome, Safari, Firefox, Edge)
- [ ] Mobile testing (iOS, Android)

**Launch Announcement:**
- [ ] Blog post: "Introducing SimpleChat"
- [ ] Social media posts (Twitter, LinkedIn)
- [ ] Email to beta users
- [ ] Product Hunt launch (optional)

**Deliverable:** Live production website

---

## 🎨 Design Reference

### **Homepage Hero Inspirations:**
- **Linear.app** - Minimalist, animated grid background
- **Vercel.com** - Gradient effects, clean typography
- **Cal.com** - Colorful, modern, friendly
- **Stripe.com** - Professional, elegant, trustworthy

### **Features Section:**
- **Notion.so** - Icon-based feature grid
- **Slack.com** - Screenshot-heavy, visual
- **Intercom.com** - Benefit-focused copy

### **Pricing Page:**
- **GitHub.com/pricing** - Clear comparison table
- **Figma.com/pricing** - Toggle monthly/yearly
- **Basecamp.com** - Simple, transparent

---

## 📊 Content Strategy

### **Tone of Voice:**
- **Friendly** but **professional**
- **Clear** and **concise**
- **Benefit-focused** (not feature-focused)
- **Conversational** (you/your, not we/our)

### **Key Messaging:**
- **Problem:** Customer support is slow, expensive, and frustrating
- **Solution:** SimpleChat - AI-powered chat that's fast, affordable, and delightful
- **Benefit:** Close more deals, reduce support costs, delight customers

### **Call-to-Action Hierarchy:**
1. **Primary:** "Start Free Trial" (7-day trial, no credit card)
2. **Secondary:** "See Demo" (video/live demo)
3. **Tertiary:** "View Pricing" (learn more)

---

## 🔧 Development Setup

### **Local Development:**

```bash
# 1. Clone repository
git clone https://github.com/photier/simplechat-website.git
cd simplechat-website

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# Add Sanity credentials:
# SANITY_PROJECT_ID=your_project_id
# SANITY_DATASET=production
# SANITY_API_TOKEN=your_token

# 4. Start dev server
npm run dev
# → http://localhost:4321

# 5. Start Sanity Studio
npm run sanity
# → http://localhost:3333
```

### **Environment Variables:**

```bash
# .env.local
SANITY_PROJECT_ID=abc123xyz
SANITY_DATASET=production
SANITY_API_TOKEN=skxxx...  # Read token
PUBLIC_SITE_URL=https://simplechat.bot
PUBLIC_GA_ID=G-XXXXXXXXXX  # Google Analytics
```

---

## 🚀 Deployment

### **Vercel Setup:**

1. **Connect Git Repository:**
   - Vercel Dashboard → New Project
   - Import `photier/simplechat-website`
   - Framework Preset: **Astro**
   - Root Directory: **/** (leave empty)

2. **Configure Environment Variables:**
   - Add all variables from `.env.local`
   - Mark sensitive vars as "Secret"

3. **Custom Domain:**
   - Add domain: `simplechat.bot`
   - DNS: Point A record to Vercel IP
   - SSL: Auto-provisioned by Vercel

4. **Build Settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### **Deployment Workflow:**

```bash
# Development
git checkout -b feature/new-homepage
# Make changes
git add .
git commit -m "feat: Update homepage hero"
git push origin feature/new-homepage
# → Vercel creates preview URL: https://simplechat-abc123.vercel.app

# Production
git checkout main
git merge feature/new-homepage
git push origin main
# → Auto-deploy to https://simplechat.bot (30 seconds)
```

---

## 📈 Analytics & Monitoring

### **Tools:**

1. **Google Analytics 4**
   - Page views
   - User behavior
   - Conversion tracking (sign-ups)

2. **Vercel Analytics**
   - Core Web Vitals
   - Real-time visitors
   - Geographical data

3. **Sanity Insights**
   - Content usage
   - Popular pages
   - Editor activity

4. **Hotjar (Optional)**
   - Heatmaps
   - Session recordings
   - User feedback

---

## 🐛 Troubleshooting

### **Common Issues:**

**1. Sanity Content Not Updating**
```bash
# Solution: Clear cache and rebuild
npm run build
# Or check Sanity API token permissions
```

**2. Images Not Loading**
```bash
# Solution: Verify Sanity image URLs
# Check CORS settings in Sanity dashboard
```

**3. Build Fails on Vercel**
```bash
# Solution: Check build logs
# Common: Missing environment variables
# Verify .env.local matches Vercel settings
```

---

## 📝 Content Management Guide

### **Editing Homepage Hero (Sanity Studio):**

1. Login: https://simplechat.sanity.studio
2. Navigate: "Homepage" → "Hero Section"
3. Edit fields:
   - Title
   - Subtitle
   - CTA Button Text
   - Background Image (upload)
4. Preview changes (right panel)
5. Click "Publish"
6. Wait 30 seconds → Live on https://simplechat.bot

### **Adding Blog Post:**

1. Sanity Studio → "Blog" → "Create New Post"
2. Fill fields:
   - Title
   - Slug (auto-generated)
   - Cover Image
   - Excerpt
   - Body (rich text editor)
   - Categories
   - SEO Meta
3. Save as Draft
4. Preview: https://simplechat.bot/blog/[slug]?preview=true
5. Publish when ready
6. Auto-deploy (30 seconds)

---

## 🎯 Success Metrics

### **Launch Goals (First 30 Days):**

- [ ] **Traffic:** 10,000 unique visitors
- [ ] **Conversions:** 500 free trial sign-ups
- [ ] **SEO:** Rank top 10 for "AI chat widget"
- [ ] **Performance:** 95+ Lighthouse score
- [ ] **Engagement:** 3 min avg session duration
- [ ] **Bounce Rate:** < 50%

### **Ongoing Metrics:**

- **Weekly blog posts:** 1-2 posts
- **Monthly feature pages:** 1 new feature
- **Content updates:** 2-3 homepage tweaks/month
- **A/B tests:** 1 test/month (hero, CTA, pricing)

---

## 📚 Resources

### **Documentation:**
- Astro: https://docs.astro.build
- Sanity: https://www.sanity.io/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Framer Motion: https://www.framer.com/motion

### **Design Tools:**
- Figma: https://figma.com (wireframes, mockups)
- Unsplash: https://unsplash.com (stock photos)
- Heroicons: https://heroicons.com (icons)
- Coolors: https://coolors.co (color palettes)

### **SEO Tools:**
- Google Search Console
- Ahrefs (keyword research)
- Screaming Frog (technical SEO)

---

## 🔐 Security & Compliance

### **GDPR Compliance:**
- [ ] Cookie consent banner
- [ ] Privacy policy (clear data usage)
- [ ] Data deletion request form
- [ ] EU server option (Sanity)

### **Security Headers:**
```
Content-Security-Policy
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

**Vercel config:** Add to `vercel.json`

---

## 🎉 Launch Checklist

**Pre-Launch:**
- [ ] All pages complete and reviewed
- [ ] Cross-browser testing passed
- [ ] Mobile responsive verified
- [ ] SEO meta tags configured
- [ ] Analytics installed
- [ ] Contact form tested
- [ ] Legal pages published
- [ ] Domain DNS configured
- [ ] SSL certificate active
- [ ] Performance optimized (95+ Lighthouse)

**Launch Day:**
- [ ] Final content review
- [ ] Smoke test (all links work)
- [ ] Monitor analytics
- [ ] Social media announcement
- [ ] Email announcement
- [ ] Monitor errors (Sentry)

**Post-Launch:**
- [ ] Submit sitemap to Google
- [ ] Monitor search rankings
- [ ] Collect user feedback
- [ ] A/B test homepage hero
- [ ] Plan content calendar

---

## 📞 Support & Maintenance

### **Monthly Tasks:**
- [ ] Update dependencies (`npm update`)
- [ ] Review analytics
- [ ] Check broken links
- [ ] Update blog content
- [ ] Backup Sanity data
- [ ] Security audit

### **Quarterly Tasks:**
- [ ] Design refresh (small tweaks)
- [ ] Content audit (remove outdated)
- [ ] SEO audit
- [ ] Performance optimization
- [ ] User survey (feedback)

---

**End of Document**
