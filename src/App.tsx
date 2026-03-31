import HeroSection from './components/home/HeroSection';
import SearchBar from './components/home/SearchBar';

function App() {
  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
  };

  return (
    <div className="min-h-screen bg-eco-bg flex flex-col items-center pb-20">
      <main className="w-full max-w-[1400px] flex flex-col items-center">
        <HeroSection />
        <SearchBar onSearch={handleSearch} />
      </main>
    </div>
  )
}

export default App
