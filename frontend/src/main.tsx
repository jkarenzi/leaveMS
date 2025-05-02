//import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Provider } from 'react-redux';
import store from './redux/store.ts'
import NotificationProvider from './components/NotificationProvider.tsx';


createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <NotificationProvider>
      <App/>
    </NotificationProvider>
  </Provider>
)
