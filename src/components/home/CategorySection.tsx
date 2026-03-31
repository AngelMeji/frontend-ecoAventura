import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface CategoryStat {
    name: string;
    slug: string; // Added slug
    count: number;
    avgRating: number;
    icon: string;
}

interface CategorySectionProps {
    categories: CategoryStat[];
    activeCategory: string; // This will now be slug
    onCategoryChange: (categorySlug: string) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
    categories,
    activeCategory,
    onCategoryChange
}) => {
    const { t } = useLanguage();

    return (
        <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {t('home.categories.title')}
            </h2>
            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                    {t('home.categories.subtitle')}
                </p>
                {activeCategory !== 'Todos' && (
                    <button
                        onClick={() => onCategoryChange('Todos')}
                        className="px-4 py-2 bg-eco-accent text-eco-primary-900 rounded-full text-sm font-bold shadow-sm hover:shadow-md hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        {t('home.categories.reset') || 'Ver todos'}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {categories.map((category) => (
                    <button
                        key={category.slug}
                        onClick={() => onCategoryChange(category.slug)}
                        className={`
                            relative p-4 rounded-xl border-2 transition-all duration-300 text-left group
                            ${activeCategory === category.slug
                                ? 'border-eco-primary-500 bg-eco-primary-50'
                                : 'border-gray-100 bg-white hover:border-eco-primary-500 hover:bg-eco-primary-50 hover:shadow-lg'
                            }
                        `}
                    >
                        <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-3
                            ${activeCategory === category.slug
                                ? 'bg-eco-primary-500 text-white'
                                : 'bg-eco-primary-100 text-eco-primary-600 group-hover:bg-eco-primary-200 group-hover:text-eco-primary-700 transition-colors'
                            }
                        `} dangerouslySetInnerHTML={{ __html: category.icon }} />

                        <h3 className="font-bold text-gray-800 mb-1 group-hover:text-eco-primary-700">
                            {t(`home.categories.names.${category.slug}`) !== `home.categories.names.${category.slug}`
                                ? t(`home.categories.names.${category.slug}`)
                                : category.name}
                        </h3>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{category.count} {category.count === 1 ? t('home.categories.place_one') : t('home.categories.place_other')}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategorySection;
