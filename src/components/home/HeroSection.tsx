import React from 'react';

const HeroSection: React.FC = () => {
    return (
        <section 
            className="relative w-full h-[320px] sm:h-[400px] md:h-[500px] rounded-[1.5rem] overflow-hidden mt-4 max-w-[1300px] mx-auto border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.05)]"
            aria-label="Sección principal de bienvenida"
        >
            {/* Background Image */}
            <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url("/assets/risaralda_hero.png")' }}
                role="img"
                aria-label="Paisaje representativo de Risaralda"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-[#064e3b]/90 via-[#064e3b]/40 to-transparent" aria-hidden="true"></div>
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col justify-center px-6 sm:px-10 md:px-20 max-w-3xl">
                <p className="text-[#E9C46A] font-bold text-[11px] sm:text-[13px] tracking-[0.15em] uppercase mb-3 sm:mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                    DESCUBRE RISARALDA
                </p>
                
                <h1 className="text-3xl sm:text-5xl md:text-[4.5rem] font-bold text-white leading-[1.05] tracking-tight mb-4 sm:mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Explora Paraísos <br className="hidden sm:block"/>
                    <span style={{ color: '#E9C46A' }} aria-hidden="true">E</span>
                    <span style={{ color: '#D4A373' }} aria-hidden="true">c</span>
                    <span style={{ color: '#86efac' }} aria-hidden="true">o</span>
                    <span style={{ color: '#38bdf8' }} aria-hidden="true">t</span>
                    <span style={{ color: '#818cf8' }} aria-hidden="true">u</span>
                    <span style={{ color: '#c084fc' }} aria-hidden="true">r</span>
                    <span style={{ color: '#e879f9' }} aria-hidden="true">í</span>
                    <span style={{ color: '#f472b6' }} aria-hidden="true">s</span>
                    <span style={{ color: '#fb7185' }} aria-hidden="true">t</span>
                    <span style={{ color: '#f87171' }} aria-hidden="true">i</span>
                    <span style={{ color: '#fca5a5' }} aria-hidden="true">c</span>
                    <span style={{ color: '#fdba74' }} aria-hidden="true">o</span>
                    <span style={{ color: '#fcd34d' }} aria-hidden="true">s</span>
                    <span className="sr-only">Ecoturísticos</span>
                </h1>
                
                <p className="text-white/95 text-sm sm:text-base md:text-[18px] max-w-2xl mb-6 sm:mb-10 leading-[1.6] font-medium hidden sm:block" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Sumérgete en la magia de la biodiversidad. Encuentra los destinos más hermosos y sostenibles para tu próxima aventura en la naturaleza.
                </p>

                <div>
                    <button 
                        className="bg-[#E9C46A] hover:bg-[#d4b05b] text-[#1f2937] font-bold py-3 px-6 sm:py-3.5 sm:px-8 rounded-full inline-flex items-center gap-2 transition-all hover:-translate-y-1 shadow-lg shadow-black/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#E9C46A] focus-visible:ring-opacity-50 min-h-[48px]" 
                        style={{ fontFamily: 'Inter, sans-serif' }}
                        aria-label="Comenzar Aventura en explorar destinos"
                        role="button"
                    >
                        Comenzar Aventura
                        <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;

