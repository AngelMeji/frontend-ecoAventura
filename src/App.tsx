import { BrowserRouter as Router } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HeroSection from './components/home/HeroSection';
import SearchBar from './components/home/SearchBar';
import CategoriesGrid from './components/home/CategoriesGrid';

function App() {
  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
  };

  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen bg-eco-light flex flex-col font-sans text-eco-dark selection:bg-eco-primary-100 selection:text-eco-primary-900">
          <Header />
          <main className="w-full flex-1 flex flex-col items-center pb-20 mt-2 md:mt-6">
            <HeroSection />
            <SearchBar onSearch={handleSearch} />
            <CategoriesGrid />
          </main>
          <Footer />
        </div>
      </Router>
    </LanguageProvider>
  )
}

export default App
