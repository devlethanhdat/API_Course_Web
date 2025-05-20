import React from 'react'
import './sass/main.scss'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App'
import { StoreProvider } from './context/StoreContext'
import { Provider } from 'react-redux'
import { store } from './redux/store/configureStore'
import axios from 'axios'

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('Token in interceptor:', token);
  if (token) config.headers!.Authorization = `Bearer ${token}`;
  return config;
});

const root = createRoot(document.getElementById('root')!)
root.render(
  <Router>
    <StoreProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </StoreProvider>
  </Router>
)