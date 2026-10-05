import { createRoot } from 'react-dom/client';
import './styles.css';
import './animations.css';
import './party.css';
import './screens';          // registers migrated screens
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
