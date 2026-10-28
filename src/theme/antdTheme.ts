import type { ThemeConfig } from 'antd'

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#0f766e',
    colorInfo: '#0f766e',
    colorSuccess: '#0f766e',
    colorWarning: '#d97706',
    colorError: '#e11d48',
    borderRadius: 10,
    fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif",
    controlHeightLG: 44,
  },
  components: {
    Card: {
      paddingLG: 20,
    },
    Button: {
      controlHeight: 40,
      paddingInline: 16,
    },
  },
}
