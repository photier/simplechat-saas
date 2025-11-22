import {createClient} from '@sanity/client'

const client = createClient({
  projectId: '5d1lf95h',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_STUDIO_API_TOKEN,
  apiVersion: '2024-01-01',
})

// Homepage content from website/public/locales/*/home.json
const homepageContent = {
  _type: 'homepage',
  _id: 'drafts.homepage',  // Use drafts prefix for Contributor token
  hero: {
    title: {
      en: 'Turn website visitors into Telegram conversations in seconds',
      tr: 'Web sitesi ziyaretçilerini saniyeler içinde Telegram konuşmalarına dönüştürün',
      de: 'Verwandeln Sie Website-Besucher in Sekunden in Telegram-Gespräche',
      fr: 'Transformez les visiteurs du site Web en conversations Telegram en quelques secondes',
      es: 'Convierte visitantes del sitio web en conversaciones de Telegram en segundos',
      ar: 'حوّل زوار الموقع إلى محادثات تيليجرام في ثوانٍ',
      ru: 'Превратите посетителей сайта в разговоры в Telegram за считанные секунды',
    },
    description: {
      en: 'Connect your website widget to a Telegram group and handle every support chat where your team already lives. No dashboards, no seat limits, no learning curve. Just instant, organized conversations.',
      tr: 'Web sitesi widget\'ınızı bir Telegram grubuna bağlayın ve ekibinizin zaten bulunduğu yerde her destek sohbetini yönetin. Gösterge panoları yok, koltuk limitleri yok, öğrenme eğrisi yok. Sadece anında, düzenli konuşmalar.',
      de: 'Verbinden Sie Ihr Website-Widget mit einer Telegram-Gruppe und bearbeiten Sie jeden Support-Chat dort, wo Ihr Team bereits ist. Keine Dashboards, keine Platzbeschränkungen, keine Lernkurve. Nur sofortige, organisierte Gespräche.',
      fr: 'Connectez votre widget de site Web à un groupe Telegram et gérez chaque chat d\'assistance là où votre équipe se trouve déjà. Pas de tableaux de bord, pas de limites de sièges, pas de courbe d\'apprentissage. Juste des conversations instantanées et organisées.',
      es: 'Conecta tu widget de sitio web a un grupo de Telegram y maneja cada chat de soporte donde tu equipo ya está. Sin paneles, sin límites de asientos, sin curva de aprendizaje. Solo conversaciones instantáneas y organizadas.',
      ar: 'اربط أداة موقعك بمجموعة تيليجرام وتعامل مع كل محادثة دعم حيث يتواجد فريقك بالفعل. لا لوحات معلومات، لا حدود للمقاعد، لا منحنى تعلم. فقط محادثات فورية ومنظمة.',
      ru: 'Подключите виджет вашего сайта к группе Telegram и обрабатывайте каждый чат поддержки там, где уже находится ваша команда. Никаких панелей, никаких ограничений по местам, никакой кривой обучения. Только мгновенные, организованные разговоры.',
    },
    buttonTrial: {
      en: 'Start free trial (no credit card)',
      tr: 'Ücretsiz denemeyi başlat (kredi kartı yok)',
      de: 'Kostenlose Testversion starten (keine Kreditkarte)',
      fr: 'Commencer l\'essai gratuit (pas de carte de crédit)',
      es: 'Iniciar prueba gratuita (sin tarjeta de crédito)',
      ar: 'ابدأ التجربة المجانية (بدون بطاقة ائتمان)',
      ru: 'Начать бесплатную пробную версию (без кредитной карты)',
    },
    buttonDemo: {
      en: 'See 60-second setup',
      tr: '60 saniyelik kurulumu gör',
      de: '60-Sekunden-Setup ansehen',
      fr: 'Voir la configuration de 60 secondes',
      es: 'Ver configuración de 60 segundos',
      ar: 'شاهد الإعداد في 60 ثانية',
      ru: 'Посмотреть 60-секундную настройку',
    },
  },
  howItWorks: {
    title: {
      en: 'From website click to Telegram chat in under a minute',
      tr: 'Web sitesi tıklamasından Telegram sohbetine bir dakikadan kısa sürede',
      de: 'Vom Website-Klick zum Telegram-Chat in unter einer Minute',
      fr: 'Du clic sur le site Web au chat Telegram en moins d\'une minute',
      es: 'Del clic en el sitio web al chat de Telegram en menos de un minuto',
      ar: 'من نقرة الموقع إلى محادثة تيليجرام في أقل من دقيقة',
      ru: 'От клика на сайте до чата в Telegram менее чем за минуту',
    },
    description: {
      en: 'The simplest setup in the industry. No complexity, no training manuals, no confusion. Just three effortless steps.',
      tr: 'Sektördeki en basit kurulum. Karmaşıklık yok, eğitim kılavuzları yok, kafa karışıklığı yok. Sadece üç zahmetsiz adım.',
      de: 'Die einfachste Einrichtung der Branche. Keine Komplexität, keine Trainingshandbücher, keine Verwirrung. Nur drei mühelose Schritte.',
      fr: 'La configuration la plus simple de l\'industrie. Pas de complexité, pas de manuels de formation, pas de confusion. Juste trois étapes sans effort.',
      es: 'La configuración más simple de la industria. Sin complejidad, sin manuales de capacitación, sin confusión. Solo tres pasos sin esfuerzo.',
      ar: 'أبسط إعداد في الصناعة. لا تعقيد، لا أدلة تدريب، لا ارتباك. فقط ثلاث خطوات سهلة.',
      ru: 'Самая простая настройка в отрасли. Никакой сложности, никаких руководств по обучению, никакой путаницы. Всего три простых шага.',
    },
    steps: [
      {
        title: {
          en: 'Add the widget to your site',
          tr: 'Widget\'ı sitenize ekleyin',
          de: 'Fügen Sie das Widget zu Ihrer Website hinzu',
          fr: 'Ajoutez le widget à votre site',
          es: 'Agrega el widget a tu sitio',
          ar: 'أضف الأداة إلى موقعك',
          ru: 'Добавьте виджет на свой сайт',
        },
        description: {
          en: 'Paste one line of code into your website or tag manager. Your chat widget goes live instantly and matches your brand in seconds.',
          tr: 'Web sitenize veya etiket yöneticinize bir satır kod yapıştırın. Sohbet widget\'ınız anında yayına girer ve saniyeler içinde markanıza uyum sağlar.',
          de: 'Fügen Sie eine Zeile Code in Ihre Website oder Ihren Tag-Manager ein. Ihr Chat-Widget wird sofort live und passt sich in Sekunden Ihrer Marke an.',
          fr: 'Collez une ligne de code dans votre site Web ou gestionnaire de balises. Votre widget de chat est mis en ligne instantanément et correspond à votre marque en quelques secondes.',
          es: 'Pega una línea de código en tu sitio web o administrador de etiquetas. Tu widget de chat se activa instantáneamente y coincide con tu marca en segundos.',
          ar: 'الصق سطرًا واحدًا من التعليمات البرمجية في موقعك أو مدير العلامات. تصبح أداة الدردشة الخاصة بك مباشرة على الفور وتتطابق مع علامتك التجارية في ثوانٍ.',
          ru: 'Вставьте одну строку кода на ваш сайт или в менеджер тегов. Ваш виджет чата мгновенно станет активным и адаптируется под ваш бренд за считанные секунды.',
        },
      },
      {
        title: {
          en: 'Connect Telegram group',
          tr: 'Telegram grubunu bağlayın',
          de: 'Telegram-Gruppe verbinden',
          fr: 'Connecter le groupe Telegram',
          es: 'Conectar grupo de Telegram',
          ar: 'اربط مجموعة تيليجرام',
          ru: 'Подключите группу Telegram',
        },
        description: {
          en: 'Create or pick a Telegram group, add the SimpleChat bot, and you\'re done. Every new website conversation becomes its own topic, automatically organized for your team.',
          tr: 'Bir Telegram grubu oluşturun veya seçin, SimpleChat botunu ekleyin ve işiniz bitti. Her yeni web sitesi konuşması kendi konusu haline gelir, ekibiniz için otomatik olarak düzenlenir.',
          de: 'Erstellen oder wählen Sie eine Telegram-Gruppe, fügen Sie den SimpleChat-Bot hinzu und fertig. Jedes neue Website-Gespräch wird zu seinem eigenen Thema, das automatisch für Ihr Team organisiert wird.',
          fr: 'Créez ou choisissez un groupe Telegram, ajoutez le bot SimpleChat et c\'est terminé. Chaque nouvelle conversation sur le site Web devient son propre sujet, automatiquement organisé pour votre équipe.',
          es: 'Crea o elige un grupo de Telegram, agrega el bot SimpleChat y listo. Cada nueva conversación del sitio web se convierte en su propio tema, organizado automáticamente para tu equipo.',
          ar: 'أنشئ أو اختر مجموعة تيليجرام، أضف بوت SimpleChat، وانتهى الأمر. تصبح كل محادثة جديدة على الموقع موضوعها الخاص، منظمة تلقائيًا لفريقك.',
          ru: 'Создайте или выберите группу Telegram, добавьте бота SimpleChat, и все готово. Каждый новый разговор на сайте становится отдельной темой, автоматически организованной для вашей команды.',
        },
      },
      {
        title: {
          en: 'Invite your whole team',
          tr: 'Tüm ekibinizi davet edin',
          de: 'Laden Sie Ihr ganzes Team ein',
          fr: 'Invitez toute votre équipe',
          es: 'Invita a todo tu equipo',
          ar: 'ادعُ فريقك بالكامل',
          ru: 'Пригласите всю свою команду',
        },
        description: {
          en: 'Add as many teammates as you like to the group. There are no seat licenses. If they\'re in the group, they can see, reply, and help customers right away.',
          tr: 'Gruba istediğiniz kadar ekip arkadaşı ekleyin. Koltuk lisansı yok. Grupta iseler, hemen görebilir, yanıtlayabilir ve müşterilere yardımcı olabilirler.',
          de: 'Fügen Sie so viele Teammitglieder hinzu, wie Sie möchten. Es gibt keine Sitzlizenzen. Wenn sie in der Gruppe sind, können sie sofort sehen, antworten und Kunden helfen.',
          fr: 'Ajoutez autant de coéquipiers que vous le souhaitez au groupe. Il n\'y a pas de licences de siège. S\'ils sont dans le groupe, ils peuvent voir, répondre et aider les clients immédiatement.',
          es: 'Agrega tantos compañeros de equipo como quieras al grupo. No hay licencias de asiento. Si están en el grupo, pueden ver, responder y ayudar a los clientes de inmediato.',
          ar: 'أضف أكبر عدد تريده من أعضاء الفريق إلى المجموعة. لا توجد تراخيص مقاعد. إذا كانوا في المجموعة، يمكنهم الرؤية والرد ومساعدة العملاء على الفور.',
          ru: 'Добавьте в группу столько участников команды, сколько захотите. Нет лицензий на места. Если они в группе, они могут сразу видеть, отвечать и помогать клиентам.',
        },
      },
    ],
  },
  cta: {
    title: {
      en: 'Stop paying per seat. Start supporting from Telegram.',
      tr: 'Koltuk başına ödeme yapmayı bırakın. Telegram\'dan destek vermeye başlayın.',
      de: 'Hören Sie auf, pro Sitzplatz zu zahlen. Beginnen Sie mit der Unterstützung über Telegram.',
      fr: 'Arrêtez de payer par siège. Commencez à supporter depuis Telegram.',
      es: 'Deja de pagar por asiento. Comienza a dar soporte desde Telegram.',
      ar: 'توقف عن الدفع لكل مقعد. ابدأ الدعم من تيليجرام.',
      ru: 'Перестаньте платить за каждое место. Начните поддержку через Telegram.',
    },
    description: {
      en: 'Join 500+ teams that left bloated support panels behind. Start your 7-day free trial today. No credit card, unlimited teammates from day one.',
      tr: 'Şişirilmiş destek panellerini geride bırakan 500+ ekibe katılın. 7 günlük ücretsiz denemenizi bugün başlatın. Kredi kartı yok, ilk günden sınırsız ekip arkadaşı.',
      de: 'Schließen Sie sich 500+ Teams an, die aufgeblähte Support-Panels hinter sich gelassen haben. Starten Sie noch heute Ihre 7-tägige kostenlose Testversion. Keine Kreditkarte, unbegrenzte Teammitglieder vom ersten Tag an.',
      fr: 'Rejoignez 500+ équipes qui ont laissé derrière elles des panneaux de support gonflés. Commencez votre essai gratuit de 7 jours aujourd\'hui. Pas de carte de crédit, coéquipiers illimités dès le premier jour.',
      es: 'Únete a 500+ equipos que dejaron atrás paneles de soporte inflados. Comienza tu prueba gratuita de 7 días hoy. Sin tarjeta de crédito, compañeros de equipo ilimitados desde el primer día.',
      ar: 'انضم إلى 500+ فريق تركوا لوحات الدعم المتضخمة وراءهم. ابدأ تجربتك المجانية لمدة 7 أيام اليوم. بدون بطاقة ائتمان، زملاء فريق غير محدودين من اليوم الأول.',
      ru: 'Присоединяйтесь к 500+ командам, которые оставили раздутые панели поддержки позади. Начните свою 7-дневную бесплатную пробную версию сегодня. Без кредитной карты, неограниченное количество участников команды с первого дня.',
    },
    button: {
      en: 'Start free trial (no credit card)',
      tr: 'Ücretsiz denemeyi başlat (kredi kartı yok)',
      de: 'Kostenlose Testversion starten (keine Kreditkarte)',
      fr: 'Commencer l\'essai gratuit (pas de carte de crédit)',
      es: 'Iniciar prueba gratuita (sin tarjeta de crédito)',
      ar: 'ابدأ التجربة المجانية (بدون بطاقة ائتمان)',
      ru: 'Начать бесплатную пробную версию (без кредитной карты)',
    },
  },
}

async function migrateContent() {
  try {
    console.log('🚀 Migrating homepage content to Sanity...')

    const result = await client.createOrReplace(homepageContent)

    console.log('✅ Homepage content migrated successfully!')
    console.log('📄 Document ID:', result._id)
    console.log('✨ You can now edit this content at http://localhost:3333')
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

migrateContent()
