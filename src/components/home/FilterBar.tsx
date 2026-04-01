import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface FilterBarProps {
    onSearchChange: (query: string) => void;
    onCategoryChange?: (category: string) => void; // Optional now or removed, keeping for compatibility if needed but better remove
    activeCategory: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
    onSearchChange,
    activeCategory: _activeCategory
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { t } = useLanguage();

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        onSearchChange(value);
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            {/* Search Input */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder={t('home.filterBar.placeholder')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-teal-500 focus:border-transparent transition-all"
                />
            </div>
        </div>
    );
};

export default FilterBar;
