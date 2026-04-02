import React from 'react';

const AboutUs: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            <div className="container mx-auto px-6">
                {/* Hero Section */}
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-eco-primary-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-eco-primary-700 to-eco-secondary-600">
                        Nuestra Misión Verde
                    </h1>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        Conectando a las personas con la naturaleza de Risaralda a través de experiencias ecoturísticas auténticas y sostenibles.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
                    <div className="rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                        <img 
                            src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                            alt="Nature of Risaralda" 
                            className="w-full h-[400px] object-cover"
                        />
                    </div>
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-eco-primary-800 mb-4 flex items-center gap-3">
                                <span className="p-2 bg-eco-primary-100 rounded-lg text-eco-primary-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </span>
                                Misión
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                Ser la plataforma líder en la promoción del ecoturismo en el departamento de Risaralda, facilitando a los viajeros el descubrimiento de destinos únicos mientras promovemos el respeto por el medio ambiente y el desarrollo de las comunidades locales.
                            </p>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-eco-primary-800 mb-4 flex items-center gap-3">
                                <span className="p-2 bg-eco-secondary-100 rounded-lg text-eco-secondary-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                </span>
                                Visión
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                Para el año 2030, EcoAventura será reconocida internacionalmente como el portal de referencia para el turismo sostenible en Colombia, integrando tecnología de vanguardia y una red sólida de socios comprometidos con la conservación de nuestra biodiversidad.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Goals */}
                <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-gray-100">
                    <h2 className="text-3xl font-bold text-center text-eco-primary-900 mb-12">Nuestros Objetivos</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { title: 'Conservación', desc: 'Proteger los ecosistemas locales a través de un turismo responsable.', icon: '🌿' },
                            { title: 'Comunidad', desc: 'Empoderar a los emprendedores locales del sector turístico.', icon: '🤝' },
                            { title: 'Educación', desc: 'Sensibilizar a los visitantes sobre la importancia de la biodiversidad.', icon: '📚' },
                            { title: 'Innovación', desc: 'Usar la tecnología para conectar a las personas con la naturaleza.', icon: '⚡' }
                        ].map((obj, i) => (
                            <div key={i} className="text-center p-6 rounded-2xl hover:bg-eco-primary-50 transition-colors group">
                                <span className="text-4xl mb-4 block group-hover:scale-125 transition-transform">{obj.icon}</span>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{obj.title}</h3>
                                <p className="text-sm text-gray-500">{obj.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
