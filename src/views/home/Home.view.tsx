import React from 'react';
import HeroSection from '../../components/home/HeroSection';
import SearchBar from '../../components/home/SearchBar';
import CategoriesGrid from '../../components/home/CategoriesGrid';

const Home: React.FC = () => {
    const handleSearch = (query: string) => {
        console.log("Searching for:", query);
    };

    return (
        <div className="w-full flex-1 flex flex-col items-center pb-20 mt-2 md:mt-6">
            <HeroSection />
            <SearchBar onSearch={handleSearch} />
            <CategoriesGrid />
        </div>
    );
};

export default Home;
