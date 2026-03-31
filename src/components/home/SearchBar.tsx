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
        <div className="w-full max-w-screen-xl mx-auto mt-8 mb-12 px-4 md:px-0">
            <div className="relative flex items-center bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 px-4 py-4 md:py-5">
                <Search className="text-gray-400 w-5 h-5 ml-2" />
                <input
                    type="text"
                    value={query}
                    onChange={handleChange}
                    placeholder="Buscar destinos..."
                    className="w-full pl-4 pr-4 bg-transparent outline-none text-gray-700 placeholder:text-gray-400 font-medium text-lg"
                />
            </div>
        </div>
    );
};

export default SearchBar;
