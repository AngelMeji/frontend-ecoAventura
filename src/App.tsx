import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import { appRoutes } from './routes/app.routes';
import { LanguageProvider } from './context/LanguageContext';
import BackToTop from './components/common/BackToTop';

import ScrollToTop from './components/common/ScrollToTop';

const AppRoutes = () => {
  const element = useRoutes(appRoutes);
  return element;
};

function App() {
  return (
    <LanguageProvider>
      <Router>
        <ScrollToTop />
        <AppRoutes />
        <BackToTop />
      </Router>
    </LanguageProvider>
  );
}

export default App;
