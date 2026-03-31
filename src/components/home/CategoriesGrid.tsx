import React from 'react';
import { Bird, TrendingUp, Coffee, Waves, MapPin, Droplets, Tent, Ticket, Eye } from 'lucide-react';

const categories = [
    { id: 1, title: 'Avistamiento de aves', spots: 2, icon: <Bird className="w-5 h-5 text-eco-primary-800" /> },
    { id: 2, title: 'Senderismo', spots: 4, icon: <TrendingUp className="w-5 h-5 text-eco-primary-800" /> },
    { id: 3, title: 'Paisaje cultural cafetero', spots: 2, icon: <Coffee className="w-5 h-5 text-eco-primary-800" /> },
    { id: 4, title: 'Termales', spots: 1, icon: <Waves className="w-5 h-5 text-eco-primary-800" /> },
    { id: 5, title: 'Nevados y montañas', spots: 3, icon: <MapPin className="w-5 h-5 text-eco-primary-800" /> },
    { id: 6, title: 'Cascadas', spots: 1, icon: <Droplets className="w-5 h-5 text-eco-primary-800" /> },
    { id: 7, title: 'Glamping', spots: 7, icon: <Tent className="w-5 h-5 text-eco-primary-800" /> },
    { id: 8, title: 'Parques temáticos', spots: 4, icon: <Ticket className="w-5 h-5 text-eco-primary-800" /> },
    { id: 9, title: 'Ríos y lagos', spots: 2, icon: <Waves className="w-5 h-5 text-eco-primary-800" /> },
    { id: 10, title: 'Miradores', spots: 1, icon: <Eye className="w-5 h-5 text-eco-primary-800" /> },
];

const CategoriesGrid: React.FC = () => {
    return (
        <section className="w-full max-w-screen-xl mx-auto px-4 md:px-0 mb-16">
            <h2 className="text-[22px] font-bold text-[#1e293b] mb-1 font-display">Explorar por Categorías</h2>
            <p className="text-[#64748b] mb-8 font-medium text-[15px]">Descubre destinos organizados por tipo de experiencia.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {categories.map((cat) => (
                    <div 
                        key={cat.id} 
                        className="bg-white rounded-[1rem] p-5 border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:border-gray-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all cursor-pointer flex flex-col justify-between items-start h-[130px]"
                    >
                        <div className="bg-[#dcfce7] p-2.5 rounded-full mb-2">
                            {cat.icon}
                        </div>
                        <div>
                            <h3 className="text-[14px] font-bold text-[#1e293b] leading-tight mb-1 font-display">{cat.title}</h3>
                            <p className="text-[12px] text-[#94a3b8] font-medium">{cat.spots} {cat.spots === 1 ? 'lugar' : 'lugares'}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CategoriesGrid;
