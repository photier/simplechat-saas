/** @type {import('astro-i18next').AstroI18nextConfig} */
export default {
  defaultLocale: "en",
  locales: ["en", "tr", "de", "fr", "es", "ar", "ru"],
  namespaces: ["common", "home", "features", "pricing", "contact", "about"],
  defaultNamespace: "common",

  routes: {
    tr: {
      "features": "ozellikler",
      "pricing": "fiyatlandirma",
      "contact": "iletisim",
      "about": "hakkimizda",
    },
    de: {
      "features": "funktionen",
      "pricing": "preise",
      "contact": "kontakt",
      "about": "uber-uns",
    },
    fr: {
      "features": "fonctionnalites",
      "pricing": "tarifs",
      "contact": "contact",
      "about": "a-propos",
    },
    es: {
      "features": "caracteristicas",
      "pricing": "precios",
      "contact": "contacto",
      "about": "acerca-de",
    },
    ar: {
      "features": "الميزات",
      "pricing": "الأسعار",
      "contact": "اتصل-بنا",
      "about": "من-نحن",
    },
    ru: {
      "features": "функции",
      "pricing": "цены",
      "contact": "контакты",
      "about": "о-нас",
    },
  },
};
