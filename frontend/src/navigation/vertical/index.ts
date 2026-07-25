import type { Component } from 'vue'

export interface VerticalNavItems {
  heading: string
  children?: VerticalNavItems[]
  icon?: string
  title: string
  to?: string
  component?: Component
}

const verticalNavItems = (): VerticalNavItems[] => {
  return [
    {
      heading: 'Pinto00',
      children: [
        {
          title: 'Dashboard',
          icon: 'ri-home-line',
          to: '/',
        },
        {
          title: 'รายรับรายจ่าย',
          icon: 'ri-money-dollar-circle-line',
          to: '/transaction-page',
        },
        {
          title: 'Users',
          icon: 'ri-group-line',
          to: '/user-page',
        },
      ],
    },
    {
      heading: 'ระบบ',
      children: [
        {
          title: 'ตั้งค่า',
          icon: 'ri-settings-line',
          to: '/settings',
        },
      ],
    },
  ]
}

export default verticalNavItems
