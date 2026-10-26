import { Template } from '../types';

export const INITIAL_TEMPLATES: Template[] = [
  // 1. Employee ID Badges
  {
    id: 'vm-id-exec-navy',
    titleEn: 'Executive & Physician Smart ID Badge',
    titleAr: 'بطاقة الهوية الذكية للأطباء والتنفيذيين',
    category: 'id-cards',
    width: 850,
    height: 540,
    descriptionEn: 'High-security horizontal employee badge with RFID chip motif, QR code, and bilingual Vision Medical identity.',
    descriptionAr: 'بطاقة هوية أفقية ذكية مع شريحة إلكترونية ورمز استجابة سريعة وهوية معتمدة.',
    theme: 'dark',
    defaultNameX: 52,
    defaultNameY: 42,
    defaultRoleX: 52,
    defaultRoleY: 53,
    defaultFontSize: 34,
    defaultRoleFontSize: 20,
    defaultColor: '#FFFFFF',
    defaultRoleColor: '#38BDF8',
    defaultAlignment: 'left',
    safeZone: { minXPercent: 32, maxXPercent: 88, minYPercent: 25, maxYPercent: 80 },
    tags: ['ID', 'Physician', 'Executive', 'Smart Badge', 'Horizontal'],
    isActive: true,
    isPopular: true,
    svgBackground: `
      <svg width="850" height="540" viewBox="0 0 850 540" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGrad1" x1="0" y1="0" x2="850" y2="540" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#0B2545"/>
            <stop offset="50%" stop-color="#091E38"/>
            <stop offset="100%" stop-color="#051329"/>
          </linearGradient>
          <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#00A3E0"/>
            <stop offset="100%" stop-color="#F58220"/>
          </linearGradient>
        </defs>
        <!-- Background base -->
        <rect width="850" height="540" rx="24" fill="url(#bgGrad1)"/>
        
        <!-- Header Navy Accent Bar -->
        <rect x="0" y="0" width="850" height="12" fill="url(#accentGrad)"/>
        
        <!-- Subtle security grid pattern -->
        <path d="M0 60 H850 M0 120 H850 M0 180 H850 M0 240 H850 M0 300 H850 M0 360 H850 M0 420 H850 M0 480 H850" stroke="#00A3E0" stroke-opacity="0.04" stroke-width="1"/>
        <path d="M100 0 V540 M200 0 V540 M300 0 V540 M400 0 V540 M500 0 V540 M600 0 V540 M700 0 V540 M800 0 V540" stroke="#00A3E0" stroke-opacity="0.04" stroke-width="1"/>
        
        <!-- Glowing dynamic arcs -->
        <circle cx="850" cy="0" r="320" stroke="#00A3E0" stroke-opacity="0.12" stroke-width="2"/>
        <circle cx="850" cy="0" r="260" stroke="#F58220" stroke-opacity="0.08" stroke-width="1.5"/>
        <circle cx="0" cy="540" r="240" stroke="#00A3E0" stroke-opacity="0.1" stroke-width="1.5"/>

        <!-- Photo Avatar Frame Placeholder -->
        <rect x="50" y="160" width="180" height="220" rx="16" fill="#0E2D52" stroke="#00A3E0" stroke-width="2.5"/>
        <circle cx="140" cy="245" r="45" fill="#153B68"/>
        <path d="M75 350 C75 305 105 295 140 295 C175 295 205 305 205 350 Z" fill="#153B68"/>
        <text x="140" y="372" text-anchor="middle" fill="#38BDF8" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="600" letter-spacing="1">PHOTO HOLDER</text>

        <!-- Smart Card Gold Chip Motif -->
        <rect x="52" y="398" width="60" height="46" rx="6" fill="#C59B27" stroke="#E5C158" stroke-width="1.5"/>
        <path d="M52 421 H112 M82 398 V444 M70 410 H94 M70 432 H94" stroke="#997316" stroke-width="1"/>

        <!-- Top Header Lockup: Vision Medical -->
        <circle cx="80" cy="72" r="24" fill="#0E2D52" stroke="#00A3E0" stroke-width="1.5"/>
        <!-- Dot constellation logo replica -->
        <circle cx="72" cy="65" r="3" fill="#00A3E0"/>
        <circle cx="78" cy="60" r="3.5" fill="#00A3E0"/>
        <circle cx="86" cy="62" r="4" fill="#38BDF8"/>
        <circle cx="91" cy="70" r="4" fill="#F58220"/>
        <circle cx="88" cy="78" r="3.5" fill="#F58220"/>
        <circle cx="80" cy="82" r="3" fill="#00A3E0"/>
        <circle cx="72" cy="78" r="2.5" fill="#00A3E0"/>

        <text x="116" y="68" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="18" font-weight="700" letter-spacing="1.5">VISION MEDICAL</text>
        <text x="116" y="86" fill="#38BDF8" font-family="Cairo, sans-serif" font-size="16" font-weight="700">رؤية الطبية</text>

        <!-- Right Side Hospital Badge -->
        <rect x="670" y="52" width="130" height="32" rx="16" fill="#0E2D52" stroke="#00A3E0" stroke-opacity="0.4"/>
        <text x="735" y="72" text-anchor="middle" fill="#E0F2FE" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="600" letter-spacing="0.5">ACCREDITED</text>

        <!-- Bottom ID footer info -->
        <line x1="270" y1="440" x2="800" y2="440" stroke="#0E2D52" stroke-width="1.5"/>
        <text x="270" y="470" fill="#64748B" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="600">EMPLOYEE ID: VM-884920</text>
        <text x="510" y="470" fill="#64748B" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="600">ISSUE: 2026</text>
        <text x="640" y="470" fill="#00A3E0" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="700">EMERGENCY: 937</text>
        <text x="270" y="495" fill="#94A3B8" font-family="Cairo, sans-serif" font-size="12">مستشفى ومراكز رؤية الطبية التخصصية · الرياض، المملكة العربية السعودية</text>
      </svg>
    `,
  },
  {
    id: 'vm-id-clinical-white',
    titleEn: 'Clinical Staff Pure White Badge',
    titleAr: 'بطاقة الكادر الطبي السريري (الأبيض النقي)',
    category: 'id-cards',
    width: 850,
    height: 540,
    descriptionEn: 'Crisp, clinical grade white badge with royal navy ribbons and medical cross motifs.',
    descriptionAr: 'تصميم أبيض ناصع ذو طابع سريري مع شرائط كحلية وأيقونات طبية متقنة.',
    theme: 'light',
    defaultNameX: 52,
    defaultNameY: 42,
    defaultRoleX: 52,
    defaultRoleY: 53,
    defaultFontSize: 34,
    defaultRoleFontSize: 20,
    defaultColor: '#0B2545',
    defaultRoleColor: '#005A9C',
    defaultAlignment: 'left',
    safeZone: { minXPercent: 32, maxXPercent: 88, minYPercent: 25, maxYPercent: 80 },
    tags: ['ID', 'Clinical', 'Nurse', 'Pharmacist', 'Technologist'],
    isActive: true,
    svgBackground: `
      <svg width="850" height="540" viewBox="0 0 850 540" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="850" height="540" rx="24" fill="#FFFFFF"/>
        <!-- Left vertical brand stripe -->
        <rect x="0" y="0" width="18" height="540" fill="#0B2545"/>
        <rect x="18" y="0" width="6" height="540" fill="#00A3E0"/>

        <!-- Header curve -->
        <path d="M0 0 H850 V100 C680 110 500 80 0 100 Z" fill="#F8FAFC"/>
        <line x1="24" y1="105" x2="826" y2="105" stroke="#E2E8F0" stroke-width="1.5"/>

        <!-- Vision Medical Lockup -->
        <text x="60" y="62" fill="#0B2545" font-family="Plus Jakarta Sans, sans-serif" font-size="20" font-weight="800" letter-spacing="1">VISION MEDICAL</text>
        <text x="250" y="62" fill="#00A3E0" font-family="Cairo, sans-serif" font-size="19" font-weight="700">رؤية الطبية</text>

        <!-- Right Side Hospital Center -->
        <text x="800" y="60" text-anchor="end" fill="#64748B" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="600">STAFF CREDENTIAL</text>

        <!-- Photo frame -->
        <rect x="60" y="150" width="170" height="210" rx="14" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="2"/>
        <circle cx="145" cy="235" r="42" fill="#E2E8F0"/>
        <path d="M85 340 C85 298 112 288 145 288 C178 288 205 298 205 340 Z" fill="#E2E8F0"/>
        <text x="145" y="352" text-anchor="middle" fill="#64748B" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="600">STAFF PHOTO</text>

        <!-- Subtle Medical Cross pattern -->
        <g opacity="0.05" fill="#00A3E0">
          <rect x="700" y="160" width="12" height="40" rx="3"/>
          <rect x="686" y="174" width="40" height="12" rx="3"/>
          <rect x="620" y="320" width="16" height="52" rx="4"/>
          <rect x="602" y="338" width="52" height="16" rx="4"/>
        </g>

        <!-- Barcode bottom left -->
        <g transform="translate(60, 420)">
          <rect x="0" y="0" width="170" height="50" fill="#FFFFFF" stroke="#E2E8F0" rx="6"/>
          <path d="M15 10 V40 M20 10 V40 M24 10 V40 M30 10 V40 M36 10 V40 M40 10 V40 M46 10 V40 M54 10 V40 M60 10 V40 M68 10 V40 M74 10 V40 M82 10 V40 M90 10 V40 M96 10 V40 M104 10 V40 M110 10 V40 M120 10 V40 M130 10 V40 M140 10 V40 M150 10 V40" stroke="#0B2545" stroke-width="2"/>
        </g>

        <!-- Bottom right footer -->
        <text x="790" y="450" text-anchor="end" fill="#64748B" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="600">VALID THROUGH: DEC 2028</text>
        <text x="790" y="474" text-anchor="end" fill="#0B2545" font-family="Cairo, sans-serif" font-size="12" font-weight="600">رعاية صحية بمعايير عالمية</text>
      </svg>
    `,
  },

  // 2. Email Signatures
  {
    id: 'vm-sig-executive-dark',
    titleEn: 'Executive Navy Email Signature Banner',
    titleAr: 'لافتة توقيع بريد إلكتروني كحلي تنفيذي',
    category: 'email-signatures',
    width: 800,
    height: 240,
    descriptionEn: 'Sleek dark signature footer banner with company crest, accreditation icons, and clean contact zones.',
    descriptionAr: 'شريط توقيع كحلي فخم يتضمن شعار رؤية الطبية وأيقونات الاعتماد ومساحة بيانات التواصل.',
    theme: 'dark',
    defaultNameX: 38,
    defaultNameY: 34,
    defaultRoleX: 38,
    defaultRoleY: 54,
    defaultFontSize: 24,
    defaultRoleFontSize: 15,
    defaultColor: '#FFFFFF',
    defaultRoleColor: '#00A3E0',
    defaultAlignment: 'left',
    safeZone: { minXPercent: 28, maxXPercent: 92, minYPercent: 15, maxYPercent: 88 },
    tags: ['Email Signature', 'Banner', 'Executive', 'Corporate'],
    isActive: true,
    isPopular: true,
    svgBackground: `
      <svg width="800" height="240" viewBox="0 0 800 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="240" rx="12" fill="#0B2545"/>
        <rect x="0" y="0" width="800" height="4" fill="#00A3E0"/>
        
        <!-- Left Brand Column -->
        <rect x="0" y="0" width="190" height="240" fill="#081C35"/>
        <line x1="190" y1="0" x2="190" y2="240" stroke="#13365F" stroke-width="1.5"/>

        <!-- Mini constellation logo in signature -->
        <circle cx="95" cy="80" r="30" fill="#0B2545" stroke="#00A3E0" stroke-width="1.5"/>
        <circle cx="86" cy="72" r="3.5" fill="#00A3E0"/>
        <circle cx="95" cy="66" r="4" fill="#38BDF8"/>
        <circle cx="104" cy="72" r="4.5" fill="#F58220"/>
        <circle cx="106" cy="82" r="4.5" fill="#F58220"/>
        <circle cx="100" cy="91" r="3.5" fill="#00A3E0"/>
        <circle cx="89" cy="89" r="3" fill="#00A3E0"/>

        <text x="95" y="132" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" letter-spacing="1">VISION MEDICAL</text>
        <text x="95" y="152" text-anchor="middle" fill="#38BDF8" font-family="Cairo, sans-serif" font-size="14" font-weight="700">رؤية الطبية</text>

        <!-- Right Side Contact Icons and Details -->
        <g transform="translate(220, 160)">
          <text x="0" y="16" fill="#94A3B8" font-family="Plus Jakarta Sans, sans-serif" font-size="11">🌐 www.visionmedical.sa</text>
          <text x="180" y="16" fill="#94A3B8" font-family="Plus Jakarta Sans, sans-serif" font-size="11">✉️ info@visionmedical.sa</text>
          <text x="360" y="16" fill="#94A3B8" font-family="Plus Jakarta Sans, sans-serif" font-size="11">📍 Riyadh, KSA</text>
        </g>
        <line x1="220" y1="145" x2="760" y2="145" stroke="#153B68" stroke-width="1"/>
        <text x="760" y="210" text-anchor="end" fill="#64748B" font-family="Cairo, sans-serif" font-size="11">رعاية متميزة، رؤية متجددة</text>
      </svg>
    `,
  },
  {
    id: 'vm-sig-minimal-light',
    titleEn: 'Modern Light Clean Signature',
    titleAr: 'توقيع بريد إلكتروني عصري وفاتح',
    category: 'email-signatures',
    width: 800,
    height: 240,
    descriptionEn: 'Light grey card with crisp blue highlights, perfect for standard Outlook and Gmail footers.',
    descriptionAr: 'قالب بريد إلكتروني فاتح وأنيق متوافق تماماً مع أوتلوك وجيميل والمنصات المكتبية.',
    theme: 'light',
    defaultNameX: 38,
    defaultNameY: 34,
    defaultRoleX: 38,
    defaultRoleY: 54,
    defaultFontSize: 24,
    defaultRoleFontSize: 15,
    defaultColor: '#0B2545',
    defaultRoleColor: '#005A9C',
    defaultAlignment: 'left',
    safeZone: { minXPercent: 28, maxXPercent: 92, minYPercent: 15, maxYPercent: 88 },
    tags: ['Email Signature', 'Light', 'Minimal', 'Modern'],
    isActive: true,
    svgBackground: `
      <svg width="800" height="240" viewBox="0 0 800 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="240" rx="12" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5"/>
        <rect x="0" y="0" width="8" height="240" fill="#00A3E0"/>

        <!-- Left Brand Zone -->
        <rect x="25" y="45" width="150" height="150" rx="10" fill="#FFFFFF" stroke="#E2E8F0"/>
        <circle cx="100" cy="100" r="28" fill="#F0F9FF" stroke="#BAE6FD" stroke-width="1.5"/>
        <circle cx="92" cy="94" r="3" fill="#00A3E0"/>
        <circle cx="100" cy="88" r="3.5" fill="#0284C7"/>
        <circle cx="108" cy="94" r="4" fill="#F58220"/>
        <circle cx="110" cy="104" r="4" fill="#F58220"/>
        <circle cx="104" cy="111" r="3.5" fill="#00A3E0"/>
        <circle cx="94" cy="109" r="3" fill="#00A3E0"/>

        <text x="100" y="145" text-anchor="middle" fill="#0B2545" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800">VISION MEDICAL</text>
        <text x="100" y="165" text-anchor="middle" fill="#00A3E0" font-family="Cairo, sans-serif" font-size="12" font-weight="700">رؤية الطبية</text>

        <!-- Divider -->
        <line x1="200" y1="35" x2="200" y2="205" stroke="#E2E8F0" stroke-width="1.5"/>

        <!-- Contact icons -->
        <g transform="translate(225, 160)">
          <text x="0" y="16" fill="#475569" font-family="Plus Jakarta Sans, sans-serif" font-size="11">📞 +966 11 000 0000</text>
          <text x="180" y="16" fill="#475569" font-family="Plus Jakarta Sans, sans-serif" font-size="11">🌐 www.visionmedical.sa</text>
          <text x="360" y="16" fill="#00A3E0" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="600">Healthcare Network KSA</text>
        </g>
        <line x1="225" y1="145" x2="760" y2="145" stroke="#CBD5E1" stroke-width="1"/>
      </svg>
    `,
  },

  // 3. LinkedIn Cover Banners
  {
    id: 'vm-linkedin-hero-navy',
    titleEn: 'LinkedIn Executive Wave Cover',
    titleAr: 'غلاف لينكد إن التنفيذي بأمواج الهوية',
    category: 'linkedin-banners',
    width: 1584,
    height: 396,
    descriptionEn: 'Standard LinkedIn header banner (1584x396) with dynamic medical gradient curves and bilingual motto.',
    descriptionAr: 'غلاف متوافق مع مقاس لينكد إن المعتمد بأمواج طبية متدرجة وشعار الشركة باللغتين.',
    theme: 'gradient',
    defaultNameX: 62,
    defaultNameY: 42,
    defaultRoleX: 62,
    defaultRoleY: 62,
    defaultFontSize: 42,
    defaultRoleFontSize: 24,
    defaultColor: '#FFFFFF',
    defaultRoleColor: '#38BDF8',
    defaultAlignment: 'left',
    safeZone: { minXPercent: 24, maxXPercent: 94, minYPercent: 15, maxYPercent: 85 },
    tags: ['LinkedIn', 'Banner', 'Social Header', 'Cover'],
    isActive: true,
    isPopular: true,
    svgBackground: `
      <svg width="1584" height="396" viewBox="0 0 1584 396" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="linkedInBg" x1="0" y1="0" x2="1584" y2="396" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#07192F"/>
            <stop offset="45%" stop-color="#0B2545"/>
            <stop offset="100%" stop-color="#003B6D"/>
          </linearGradient>
          <linearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#00A3E0" stop-opacity="0.25"/>
            <stop offset="50%" stop-color="#00A3E0" stop-opacity="0.05"/>
            <stop offset="100%" stop-color="#F58220" stop-opacity="0.2"/>
          </linearGradient>
        </defs>
        <rect width="1584" height="396" fill="url(#linkedInBg)"/>
        
        <!-- Left Profile Picture Avatar Safe Indicator (Avoid putting text here) -->
        <circle cx="180" cy="300" r="100" stroke="#00A3E0" stroke-opacity="0.15" stroke-dasharray="6 6" stroke-width="2"/>
        <text x="180" y="304" text-anchor="middle" fill="#00A3E0" fill-opacity="0.3" font-family="Plus Jakarta Sans, sans-serif" font-size="12">AVATAR SAFE ZONE</text>

        <!-- Futuristic Waveforms -->
        <path d="M0 240 Q400 120 800 250 T1584 180 V396 H0 Z" fill="url(#waveGrad)"/>
        <path d="M0 290 Q500 200 1000 320 T1584 260" stroke="#00A3E0" stroke-opacity="0.4" stroke-width="2"/>
        <path d="M0 320 Q600 220 1100 340 T1584 300" stroke="#F58220" stroke-opacity="0.3" stroke-width="1.5"/>

        <!-- Top Right Brand Stamp -->
        <g transform="translate(1320, 40)">
          <circle cx="36" cy="36" r="32" fill="#0B2545" stroke="#00A3E0" stroke-width="1.5"/>
          <circle cx="28" cy="28" r="4" fill="#00A3E0"/>
          <circle cx="36" cy="22" r="4.5" fill="#38BDF8"/>
          <circle cx="45" cy="28" r="5" fill="#F58220"/>
          <circle cx="48" cy="39" r="5" fill="#F58220"/>
          <circle cx="41" cy="49" r="4" fill="#00A3E0"/>
          <circle cx="30" cy="46" r="3.5" fill="#00A3E0"/>
          
          <text x="80" y="32" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="16" font-weight="800" letter-spacing="1">VISION MEDICAL</text>
          <text x="80" y="52" fill="#38BDF8" font-family="Cairo, sans-serif" font-size="16" font-weight="700">رؤية الطبية</text>
        </g>

        <!-- Brand Slogan Tag -->
        <text x="400" y="350" fill="#94A3B8" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600" letter-spacing="1">EXCELLENCE IN HEALTHCARE · التميز في الرعاية الصحية</text>
      </svg>
    `,
  },
  {
    id: 'vm-linkedin-vision2030',
    titleEn: 'LinkedIn Vision 2030 Healthcare Transformation',
    titleAr: 'غلاف لينكد إن تحول القطاع الصحي ٢٠٣٠',
    category: 'linkedin-banners',
    width: 1584,
    height: 396,
    descriptionEn: 'Inspiring LinkedIn banner highlighting Vision Medical alignment with Saudi healthcare sector transformation.',
    descriptionAr: 'غلاف ملهم يبرز مواءمة رؤية الطبية مع أهداف برنامج تحول القطاع الصحي ورؤية المملكة ٢٠٣٠.',
    theme: 'dark',
    defaultNameX: 58,
    defaultNameY: 42,
    defaultRoleX: 58,
    defaultRoleY: 62,
    defaultFontSize: 42,
    defaultRoleFontSize: 24,
    defaultColor: '#FFFFFF',
    defaultRoleColor: '#F58220',
    defaultAlignment: 'left',
    safeZone: { minXPercent: 24, maxXPercent: 94, minYPercent: 15, maxYPercent: 85 },
    tags: ['LinkedIn', 'Vision 2030', 'Transformation', 'Healthcare'],
    isActive: true,
    svgBackground: `
      <svg width="1584" height="396" viewBox="0 0 1584 396" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="1584" height="396" fill="#0B2545"/>
        <path d="M1100 0 L1584 0 L1584 396 L950 396 Z" fill="#005A9C" opacity="0.35"/>
        <line x1="950" y1="396" x2="1100" y2="0" stroke="#00A3E0" stroke-width="2"/>

        <!-- Constellation lines -->
        <path d="M1200 80 L1260 140 L1340 100 L1420 180 L1500 130" stroke="#00A3E0" stroke-opacity="0.3" stroke-width="1.5" stroke-dasharray="4 4"/>
        <circle cx="1200" cy="80" r="4" fill="#00A3E0"/>
        <circle cx="1260" cy="140" r="5" fill="#F58220"/>
        <circle cx="1340" cy="100" r="4" fill="#38BDF8"/>
        <circle cx="1420" cy="180" r="6" fill="#F58220"/>
        <circle cx="1500" cy="130" r="4" fill="#00A3E0"/>

        <!-- Brand Text Left -->
        <text x="350" y="90" fill="#38BDF8" font-family="Cairo, sans-serif" font-size="22" font-weight="700">رؤية الطبية · Vision Medical</text>
        <text x="350" y="340" fill="#64748B" font-family="Cairo, sans-serif" font-size="14">نحو مستقبل صحي واعد يرتقي بجودة الحياة</text>
      </svg>
    `,
  },

  // 4. Social Media Posts
  {
    id: 'vm-social-spotlight-gold',
    titleEn: 'Employee Spotlight & Congratulations Post',
    titleAr: 'منشور تكريم وتهنئة موظف (مربع)',
    category: 'social-media',
    width: 1080,
    height: 1080,
    descriptionEn: 'Square Instagram / LinkedIn post (1080x1080) for honoring medical staff achievements and milestones.',
    descriptionAr: 'منشور مربع للشبكات الاجتماعية مخصص لتكريم الإنجازات والترقيات والتميز المهني.',
    theme: 'dark',
    defaultNameX: 50,
    defaultNameY: 54,
    defaultRoleX: 50,
    defaultRoleY: 63,
    defaultFontSize: 44,
    defaultRoleFontSize: 26,
    defaultColor: '#FFFFFF',
    defaultRoleColor: '#F58220',
    defaultAlignment: 'center',
    safeZone: { minXPercent: 12, maxXPercent: 88, minYPercent: 10, maxYPercent: 88 },
    tags: ['Social Media', 'Instagram', 'Achievement', 'Spotlight', 'Square'],
    isActive: true,
    isPopular: true,
    svgBackground: `
      <svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="spotlightGlow" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stop-color="#153E70"/>
            <stop offset="70%" stop-color="#0B2545"/>
            <stop offset="100%" stop-color="#051325"/>
          </radialGradient>
        </defs>
        <rect width="1080" height="1080" fill="url(#spotlightGlow)"/>

        <!-- Border frame -->
        <rect x="40" y="40" width="1000" height="1000" rx="20" stroke="#00A3E0" stroke-opacity="0.3" stroke-width="2"/>
        <rect x="52" y="52" width="976" height="976" rx="14" stroke="#F58220" stroke-opacity="0.15" stroke-width="1"/>

        <!-- Top Header Lockup -->
        <circle cx="540" cy="140" r="44" fill="#0B2545" stroke="#00A3E0" stroke-width="2"/>
        <circle cx="530" cy="130" r="5" fill="#00A3E0"/>
        <circle cx="540" cy="122" r="6" fill="#38BDF8"/>
        <circle cx="552" cy="130" r="7" fill="#F58220"/>
        <circle cx="556" cy="144" r="7" fill="#F58220"/>
        <circle cx="546" cy="156" r="5" fill="#00A3E0"/>
        <circle cx="532" cy="152" r="4.5" fill="#00A3E0"/>

        <text x="540" y="215" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="20" font-weight="800" letter-spacing="2">VISION MEDICAL</text>
        <text x="540" y="244" text-anchor="middle" fill="#38BDF8" font-family="Cairo, sans-serif" font-size="20" font-weight="700">رؤية الطبية</text>

        <!-- Kicker Badge -->
        <rect x="410" y="280" width="260" height="40" rx="20" fill="#0E2D52" stroke="#F58220" stroke-width="1.5"/>
        <text x="540" y="306" text-anchor="middle" fill="#F58220" font-family="Cairo, sans-serif" font-size="16" font-weight="700">تـمـيـز وإنجــاز طبي</text>

        <!-- Decorative Star/Achievement Ribbon -->
        <circle cx="540" cy="410" r="60" fill="#0B2545" stroke="#F58220" stroke-width="3"/>
        <text x="540" y="420" text-anchor="middle" fill="#F58220" font-size="34">★</text>

        <!-- Bottom Signature Slogan -->
        <line x1="240" y1="920" x2="840" y2="920" stroke="#153E70" stroke-width="1.5"/>
        <text x="540" y="960" text-anchor="middle" fill="#94A3B8" font-family="Cairo, sans-serif" font-size="16">فخورون بكوادرنا الوطنية والطبية المتميزة</text>
        <text x="540" y="990" text-anchor="middle" fill="#64748B" font-family="Plus Jakarta Sans, sans-serif" font-size="13">#VisionMedical #HealthcareExcellence</text>
      </svg>
    `,
  },
  {
    id: 'vm-social-awareness-blue',
    titleEn: 'Medical Awareness & Health Campaign',
    titleAr: 'منشور التوعية الصحية والطبية',
    category: 'social-media',
    width: 1080,
    height: 1080,
    descriptionEn: 'Clean healthcare square post for medical tips, doctor insights, and clinical awareness.',
    descriptionAr: 'قالب مربع لنشر النصائح الطبية والتوعية الصحية مع اسم الطبيب أو الأخصائي.',
    theme: 'light',
    defaultNameX: 50,
    defaultNameY: 65,
    defaultRoleX: 50,
    defaultRoleY: 74,
    defaultFontSize: 42,
    defaultRoleFontSize: 24,
    defaultColor: '#0B2545',
    defaultRoleColor: '#005A9C',
    defaultAlignment: 'center',
    safeZone: { minXPercent: 12, maxXPercent: 88, minYPercent: 12, maxYPercent: 88 },
    tags: ['Social Media', 'Health Awareness', 'Medical Tip', 'Clinical'],
    isActive: true,
    svgBackground: `
      <svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="1080" height="1080" fill="#F8FAFC"/>
        <circle cx="540" cy="180" r="320" fill="#E0F2FE" opacity="0.6"/>
        <circle cx="980" cy="980" r="240" fill="#F0F9FF"/>

        <!-- Header -->
        <text x="540" y="90" text-anchor="middle" fill="#0B2545" font-family="Plus Jakarta Sans, sans-serif" font-size="22" font-weight="800" letter-spacing="1.5">VISION MEDICAL · رؤية الطبية</text>
        <line x1="380" y1="110" x2="700" y2="110" stroke="#00A3E0" stroke-width="2"/>

        <!-- Stethoscope & Heartwave Motif -->
        <path d="M300 380 Q450 320 540 420 T780 360" stroke="#00A3E0" stroke-width="4" stroke-linecap="round"/>
        <rect x="220" y="240" width="640" height="240" rx="16" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
        <text x="540" y="330" text-anchor="middle" fill="#005A9C" font-family="Cairo, sans-serif" font-size="28" font-weight="700">نصيحة طبية من خبير</text>
        <text x="540" y="380" text-anchor="middle" fill="#64748B" font-family="Cairo, sans-serif" font-size="18">صحتكم أمانة وغايتنا تقديم أعلى معايير العناية</text>

        <!-- Footer -->
        <rect x="0" y="960" width="1080" height="120" fill="#0B2545"/>
        <text x="540" y="1030" text-anchor="middle" fill="#FFFFFF" font-family="Cairo, sans-serif" font-size="18">مستشفى ومراكز رؤية الطبية · صحتك رؤيتنا</text>
      </svg>
    `,
  },

  // 5. Internal Announcements
  {
    id: 'vm-internal-memo-royal',
    titleEn: 'Official Internal Memo & Promotion Announcement',
    titleAr: 'إعلان إداري رسمي وترقية داخلية',
    category: 'internal-announcements',
    width: 1200,
    height: 800,
    descriptionEn: 'Formal landscape memo template (1200x800) for internal appointments, departmental recognitions, and notices.',
    descriptionAr: 'قالب إعلانات وتعاميم رسمية للترقيات وتكريم الإنجازات داخل مستشفيات ومراكز رؤية الطبية.',
    theme: 'dark',
    defaultNameX: 50,
    defaultNameY: 48,
    defaultRoleX: 50,
    defaultRoleY: 59,
    defaultFontSize: 46,
    defaultRoleFontSize: 26,
    defaultColor: '#FFFFFF',
    defaultRoleColor: '#F58220',
    defaultAlignment: 'center',
    safeZone: { minXPercent: 15, maxXPercent: 85, minYPercent: 15, maxYPercent: 85 },
    tags: ['Internal', 'Memo', 'Promotion', 'Announcement', 'Landscape'],
    isActive: true,
    isPopular: true,
    svgBackground: `
      <svg width="1200" height="800" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="800" fill="#0B2545"/>
        <rect x="0" y="0" width="1200" height="8" fill="#F58220"/>
        
        <!-- Subtle geometry -->
        <path d="M0 0 L300 0 L150 400 L0 250 Z" fill="#081D37" opacity="0.6"/>
        <path d="M1200 800 L900 800 L1050 400 L1200 550 Z" fill="#005A9C" opacity="0.3"/>

        <!-- Header -->
        <text x="600" y="110" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="24" font-weight="800" letter-spacing="2">VISION MEDICAL</text>
        <text x="600" y="146" text-anchor="middle" fill="#38BDF8" font-family="Cairo, sans-serif" font-size="22" font-weight="700">الإدارة العامة للموارد البشرية والتواصل المؤسسي</text>
        <line x1="400" y1="170" x2="800" y2="170" stroke="#00A3E0" stroke-width="2"/>

        <!-- Title Banner -->
        <text x="600" y="240" text-anchor="middle" fill="#F58220" font-family="Cairo, sans-serif" font-size="32" font-weight="800">تهنئة بالتعيين والترقية</text>
        <text x="600" y="280" text-anchor="middle" fill="#E2E8F0" font-family="Cairo, sans-serif" font-size="18">يسر شركة رؤية الطبية الإعلان عن تولي الزميل / الزميلة</text>

        <!-- Footer -->
        <line x1="200" y1="680" x2="1000" y2="680" stroke="#173B68" stroke-width="1.5"/>
        <text x="600" y="730" text-anchor="middle" fill="#94A3B8" font-family="Cairo, sans-serif" font-size="15">متمنين له دوام التوفيق والنجاح في مسيرته المهنية مع رؤية الطبية</text>
      </svg>
    `,
  },

  // 6. Event Graphics
  {
    id: 'vm-event-summit-speaker',
    titleEn: 'Annual Healthcare Summit 2026 Keynote Speaker',
    titleAr: 'بطاقة متحدث رئيسي - مؤتمر رؤية الطبي السنوي',
    category: 'event-graphics',
    width: 1200,
    height: 675,
    descriptionEn: 'High-impact 16:9 widescreen speaker graphic for conferences, clinical workshops, and medical symposiums.',
    descriptionAr: 'تصميم عريض للمؤتمرات والندوات الطبية وساعات التعليم الطبي المستمر المعتمدة.',
    theme: 'gradient',
    defaultNameX: 60,
    defaultNameY: 42,
    defaultRoleX: 60,
    defaultRoleY: 55,
    defaultFontSize: 44,
    defaultRoleFontSize: 24,
    defaultColor: '#FFFFFF',
    defaultRoleColor: '#00A3E0',
    defaultAlignment: 'left',
    safeZone: { minXPercent: 25, maxXPercent: 92, minYPercent: 15, maxYPercent: 85 },
    tags: ['Event', 'Conference', 'Speaker', 'Summit', '16:9'],
    isActive: true,
    isPopular: true,
    svgBackground: `
      <svg width="1200" height="675" viewBox="0 0 1200 675" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="675" fill="#07192F"/>
        <!-- Background diagonal mesh -->
        <path d="M0 0 L600 0 L400 675 L0 675 Z" fill="#0B2545"/>
        <line x1="600" y1="0" x2="400" y2="675" stroke="#00A3E0" stroke-width="3"/>

        <!-- Speaker photo circle placeholder -->
        <circle cx="230" cy="340" r="140" fill="#0E2D52" stroke="#00A3E0" stroke-width="4"/>
        <circle cx="230" cy="300" r="50" fill="#153E70"/>
        <path d="M130 440 C130 380 170 360 230 360 C290 360 330 380 330 440 Z" fill="#153E70"/>
        <text x="230" y="465" text-anchor="middle" fill="#38BDF8" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700">SPEAKER PORTRAIT</text>

        <!-- Conference Badge Top -->
        <g transform="translate(560, 60)">
          <rect x="0" y="0" width="220" height="34" rx="17" fill="#0E2D52" stroke="#F58220" stroke-width="1.5"/>
          <text x="110" y="22" text-anchor="middle" fill="#F58220" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700">KEYNOTE SPEAKER</text>
          <text x="250" y="24" fill="#38BDF8" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="700">CME ACCREDITED · 8 HOURS</text>
        </g>

        <!-- Summit Brand -->
        <text x="560" y="160" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="28" font-weight="800">VISION MEDICAL ANNUAL SUMMIT 2026</text>
        <text x="560" y="195" fill="#94A3B8" font-family="Cairo, sans-serif" font-size="20" font-weight="700">المؤتمر السنوي للابتكار والرعاية الصحية المتقدمة</text>

        <!-- Event Date and Location -->
        <g transform="translate(560, 560)">
          <text x="0" y="20" fill="#E2E8F0" font-family="Plus Jakarta Sans, sans-serif" font-size="13">📅 November 14-16, 2026</text>
          <text x="230" y="20" fill="#E2E8F0" font-family="Plus Jakarta Sans, sans-serif" font-size="13">📍 Riyadh International Convention Center</text>
          <text x="530" y="20" fill="#00A3E0" font-family="Cairo, sans-serif" font-size="13" font-weight="600">رؤية الطبية</text>
        </g>
      </svg>
    `,
  },

  // 7. Celebrations & Holidays
  {
    id: 'vm-celeb-saudi-national-day',
    titleEn: 'Saudi National Day Greetings & Pride Card',
    titleAr: 'بطاقة تهنئة اليوم الوطني السعودي (نحلم ونحقق)',
    category: 'celebrations',
    width: 1080,
    height: 1080,
    descriptionEn: 'Prestigious Saudi National Day greeting template combining official green identity with Vision Medical branding.',
    descriptionAr: 'قالب تهنئة باليوم الوطني السعودي يجمع بين الهوية الوطنية وهوية رؤية الطبية مع اسم الموظف المهنئ.',
    theme: 'dark',
    defaultNameX: 50,
    defaultNameY: 62,
    defaultRoleX: 50,
    defaultRoleY: 71,
    defaultFontSize: 44,
    defaultRoleFontSize: 24,
    defaultColor: '#FFFFFF',
    defaultRoleColor: '#86EFAC',
    defaultAlignment: 'center',
    safeZone: { minXPercent: 12, maxXPercent: 88, minYPercent: 12, maxYPercent: 88 },
    tags: ['Celebration', 'Saudi National Day', 'Holiday', 'Greeting', 'Square'],
    isActive: true,
    isPopular: true,
    svgBackground: `
      <svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="saudiGreen" x1="0" y1="0" x2="1080" y2="1080" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#043820"/>
            <stop offset="50%" stop-color="#064E2B"/>
            <stop offset="100%" stop-color="#022414"/>
          </linearGradient>
        </defs>
        <rect width="1080" height="1080" fill="url(#saudiGreen)"/>
        
        <!-- Gold national ornament borders -->
        <rect x="40" y="40" width="1000" height="1000" rx="20" stroke="#D97706" stroke-opacity="0.4" stroke-width="2"/>
        <rect x="52" y="52" width="976" height="976" rx="14" stroke="#86EFAC" stroke-opacity="0.2" stroke-width="1"/>

        <!-- Top Vision Medical & National Badge -->
        <circle cx="540" cy="150" r="50" fill="#043820" stroke="#D97706" stroke-width="2"/>
        <!-- Palm and swords stylized motif -->
        <path d="M540 120 V175 M525 155 Q540 145 555 155 M520 165 Q540 152 560 165" stroke="#FDE047" stroke-width="2.5" stroke-linecap="round"/>

        <text x="540" y="240" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="18" font-weight="800" letter-spacing="2">VISION MEDICAL</text>
        <text x="540" y="270" text-anchor="middle" fill="#86EFAC" font-family="Cairo, sans-serif" font-size="20" font-weight="700">رؤية الطبية</text>

        <!-- National Day Headline -->
        <text x="540" y="380" text-anchor="middle" fill="#FDE047" font-family="Amiri, serif" font-size="52" font-weight="700">دمت عزيزاً يا وطن</text>
        <text x="540" y="440" text-anchor="middle" fill="#E2E8F0" font-family="Cairo, sans-serif" font-size="24" font-weight="600">نعتز برؤيتنا ونسهم في بناء مجتمع صحي مزدهر</text>

        <!-- Slogan Ribbon -->
        <text x="540" y="520" text-anchor="middle" fill="#86EFAC" font-family="Cairo, sans-serif" font-size="20">أصدق التهاني والتبريكات بمناسبة اليوم الوطني السعودي</text>

        <!-- Footer -->
        <line x1="250" y1="920" x2="830" y2="920" stroke="#0D5F35" stroke-width="1.5"/>
        <text x="540" y="960" text-anchor="middle" fill="#FDE047" font-family="Cairo, sans-serif" font-size="16">المملكة العربية السعودية · نحو مستقبل مشرق</text>
      </svg>
    `,
  },
  {
    id: 'vm-celeb-eid-ramadan',
    titleEn: 'Eid Mubarak & Ramadan Kareem Greeting',
    titleAr: 'تهنئة عيد الفطر وعيد الأضحى المبارك',
    category: 'celebrations',
    width: 1080,
    height: 1080,
    descriptionEn: 'Celebratory holiday design featuring Islamic geometric crescent, gold accents, and personalized employee signature.',
    descriptionAr: 'قالب تهنئة إسلامي راقٍ للأعياد والمناسبات المباركة يحمل اسم المسمى الوظيفي للموظف.',
    theme: 'dark',
    defaultNameX: 50,
    defaultNameY: 62,
    defaultRoleX: 50,
    defaultRoleY: 71,
    defaultFontSize: 44,
    defaultRoleFontSize: 24,
    defaultColor: '#FFFFFF',
    defaultRoleColor: '#F59E0B',
    defaultAlignment: 'center',
    safeZone: { minXPercent: 12, maxXPercent: 88, minYPercent: 12, maxYPercent: 88 },
    tags: ['Celebration', 'Eid Mubarak', 'Ramadan', 'Greeting', 'Holiday'],
    isActive: true,
    svgBackground: `
      <svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="eidNavy" x1="0" y1="0" x2="1080" y2="1080" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#081A33"/>
            <stop offset="60%" stop-color="#0D274D"/>
            <stop offset="100%" stop-color="#051224"/>
          </linearGradient>
        </defs>
        <rect width="1080" height="1080" fill="url(#eidNavy)"/>

        <!-- Golden Islamic Crescent -->
        <path d="M570 200 C500 200 450 260 450 330 C450 420 530 480 620 480 C560 460 520 410 520 340 C520 280 550 230 570 200 Z" fill="#F59E0B" opacity="0.9"/>
        <circle cx="630" cy="270" r="14" fill="#FDE68A"/>

        <!-- Top Brand Lockup -->
        <text x="540" y="100" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="18" font-weight="800" letter-spacing="2">VISION MEDICAL · رؤية الطبية</text>

        <!-- Main Calligraphy Headline -->
        <text x="540" y="440" text-anchor="middle" fill="#FDE68A" font-family="Amiri, serif" font-size="64" font-weight="700">عـيـدكـم مـبـارك</text>
        <text x="540" y="500" text-anchor="middle" fill="#E2E8F0" font-family="Cairo, sans-serif" font-size="22" font-weight="600">كل عام وأنتم بخير وصحة وسلامة</text>
        <text x="540" y="540" text-anchor="middle" fill="#94A3B8" font-family="Cairo, sans-serif" font-size="16">تقبل الله منا ومنكم صالح الأعمال</text>

        <!-- Footer -->
        <line x1="250" y1="920" x2="830" y2="920" stroke="#163968" stroke-width="1.5"/>
        <text x="540" y="960" text-anchor="middle" fill="#38BDF8" font-family="Cairo, sans-serif" font-size="16">عائلة رؤية الطبية تتمنى لكم عيداً سعيداً</text>
      </svg>
    `,
  },
];
