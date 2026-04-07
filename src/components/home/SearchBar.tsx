import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
    onSearch?: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        if (onSearch) {
            onSearch(e.target.value);
        }
    };

    return (
        <div className="w-full max-w-screen-xl mx-auto mt-8 mb-12 px-4 md:px-0" role="search">
            <label htmlFor="destination-search" className="sr-only">Buscar destinos</label>
            <div className="relative flex items-center bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 px-4 py-4 md:py-5 focus-within:ring-2 focus-within:ring-eco-primary-500 focus-within:border-eco-primary-500 transition-all">
                <Search className="text-gray-400 w-5 h-5 ml-2" aria-hidden="true" />
                <input
                    id="destination-search"
                    type="search"
                    value={query}
                    onChange={handleChange}
                    placeholder="Buscar destinos..."
                    aria-label="Buscar destinos ecoturísticos"
                    className="w-full pl-4 pr-4 bg-transparent outline-none text-gray-700 placeholder:text-gray-400 font-medium text-lg"
                />
            </div>
        </div>
    );
};

export default SearchBar;
