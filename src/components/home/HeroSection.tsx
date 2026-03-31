import React from 'react';

const HeroSection: React.FC = () => {
    return (
        <section className="relative w-full h-[400px] md:h-[500px] rounded-[2rem] overflow-hidden shadow-2xl mt-4 max-w-screen-xl mx-auto">
            {/* Background Image with Overlay */}
            <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542384701-c0e46e0eda04?q=80&w=2065&auto=format&fit=crop")' }}
            >
                <div className="absolute inset-0 bg-[#035a39]/70 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#035a39]/90 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col justify-center px-8 md:px-16 max-w-4xl">
                <p className="text-[#fbb440] font-bold text-sm tracking-widest uppercase mb-4">
                    Descubre Risaralda
                </p>
                
                <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
                    Explora Paraísos <br className="hidden md:block"/>
                    <span style={{ color: '#fbb440' }}>E</span>
                    <span style={{ color: '#ec4899' }}>c</span>
                    <span style={{ color: '#a855f7' }}>o</span>
                    <span style={{ color: '#3b82f6' }}>t</span>
                    <span style={{ color: '#10b981' }}>u</span>
                    <span style={{ color: '#fbb440' }}>r</span>
                    <span style={{ color: '#ec4899' }}>í</span>
                    <span style={{ color: '#a855f7' }}>s</span>
                    <span style={{ color: '#3b82f6' }}>t</span>
                    <span style={{ color: '#10b981' }}>i</span>
                    <span style={{ color: '#fbb440' }}>c</span>
                    <span style={{ color: '#ec4899' }}>o</span>
                    <span style={{ color: '#a855f7' }}>s</span>
                </h1>
                
                <p className="text-gray-100/90 text-lg md:text-xl max-w-2xl mb-8 leading-relaxed font-medium">
                    Sumérgete en la magia de la biodiversidad. Encuentra los destinos más hermosos y sostenibles para tu próxima aventura en la naturaleza.
                </p>

                <div>
                    <button className="bg-[#fbb440] hover:bg-[#fca51f] text-[#422006] font-semibold py-3 px-8 rounded-full inline-flex items-center gap-2 transition-all hover:scale-105 shadow-xl shadow-black/20">
                        Comenzar Aventura
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
