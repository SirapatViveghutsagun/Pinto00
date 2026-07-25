import type { ThemeConfig } from './src/@core/types'

const themeConfig: ThemeConfig = {
  app: {
    title: 'Pinto00',
    appName: 'Pinto00 — ระบบบันทึกรายรับรายจ่าย',
    appNameTemplate: '%s — Pinto00',
    logo: 'logo.svg',
    logoHc: 'logo.svg',
    footerText: '© 2026 Pinto Valley. All rights reserved.',
    footerUrl: 'https://pinto-app.com',
  },
  skin: 'default',
  layout: 'vertical',
  direction: 'ltr',
  routerTransition: 'fade-transition',
  routeAnimate: {
    initial: 'slide-left',
    next: 'slide-left',
    prev: 'slide-right',
  },
}

export default themeConfig
