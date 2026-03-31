import HeroSection from './components/home/HeroSection';
import SearchBar from './components/home/SearchBar';
import CategoriesGrid from './components/home/CategoriesGrid';

function App() {
  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
  };

  return (
    <div className="min-h-screen bg-eco-bg flex flex-col items-center pb-20">
      <main className="w-full justify-center flex flex-col items-center">
        <HeroSection />
        <SearchBar onSearch={handleSearch} />
        <CategoriesGrid />
      </main>
    </div>
  )
}

export default App
