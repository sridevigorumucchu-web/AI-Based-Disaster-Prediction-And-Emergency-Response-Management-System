import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './i18n.ts';
import App from './App.tsx';
import { LocationProvider } from './context/LocationContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocationProvider>
      <App />
    </LocationProvider>
  </StrictMode>,
);
