import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { ConfigProvider, App as AntApp } from 'antd'
import { store } from '@/api/store'
import { antdTheme } from '@/theme/antdTheme'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ConfigProvider theme={antdTheme}>
        <AntApp>
          <App />
        </AntApp>
      </ConfigProvider>
    </Provider>
  </StrictMode>,
)
