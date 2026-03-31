import React from 'react';

const HeroSection: React.FC = () => {
    return (
        <section className="relative w-full h-[400px] md:h-[500px] rounded-[1.5rem] overflow-hidden mt-4 max-w-[1300px] mx-auto border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.05)]">
            {/* Background Image */}
            <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url("/assets/risaralda_hero.png")' }}
            >
                {/* Image 2 seems to have a gentle dark overlay on the left for text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#064e3b]/90 via-[#064e3b]/50 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col justify-center px-8 md:px-16 max-w-3xl">
                <p className="text-[#facc15] font-bold text-xs tracking-widest uppercase mb-3">
                    DESCUBRE RISARALDA
                </p>
                
                <h1 className="text-4xl md:text-[3.5rem] font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
                    Explora Paraísos <br className="hidden md:block"/>
                    <span style={{ color: '#facc15' }}>E</span>
                    <span style={{ color: '#a3e635' }}>c</span>
                    <span style={{ color: '#38bdf8' }}>o</span>
                    <span style={{ color: '#60a5fa' }}>t</span>
                    <span style={{ color: '#818cf8' }}>u</span>
                    <span style={{ color: '#a78bfa' }}>r</span>
                    <span style={{ color: '#c084fc' }}>í</span>
                    <span style={{ color: '#e879f9' }}>s</span>
                    <span style={{ color: '#f472b6' }}>t</span>
                    <span style={{ color: '#fb7185' }}>i</span>
                    <span style={{ color: '#f87171' }}>c</span>
                    <span style={{ color: '#fca5a5' }}>o</span>
                    <span style={{ color: '#fdba74' }}>s</span>
                </h1>
                
                <p className="text-gray-200 text-base md:text-lg max-w-xl mb-8 leading-snug font-medium">
                    Sumérgete en la magia de la biodiversidad. Encuentra los destinos más hermosos y sostenibles para tu próxima aventura en la naturaleza.
                </p>

                <div>
                    <button className="bg-[#facc15] hover:bg-[#eab308] text-[#422006] font-bold py-3 px-6 rounded-full inline-flex items-center gap-2 transition-all hover:scale-105 shadow-xl shadow-black/10">
                        Comenzar Aventura
                        <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
