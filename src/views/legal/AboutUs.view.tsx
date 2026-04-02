import React from 'react';

const AboutUs: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
                    <h1 className="text-3xl font-bold text-eco-primary-900 mb-8 font-display">
                        Sobre Nosotros
                    </h1>

                    <div className="prose prose-eco max-w-none text-gray-600">
                        <p className="mb-6 text-lg leading-relaxed">
                            EcoAventura es una iniciativa nacida en Risaralda, Colombia, con el objetivo de promover el turismo ecológico y sostenible en nuestra región. Creemos en el poder de conectar a las personas con la naturaleza de una manera respetuosa y consciente.
                        </p>

                        <div className="grid md:grid-cols-2 gap-8 my-8">
                            <div className="bg-eco-primary-50 p-6 rounded-xl">
                                <h3 className="text-xl font-bold text-eco-primary-800 mb-3">Nuestra Misión</h3>
                                <p>
                                    Fomentar el descubrimiento de tesoros naturales ocultos, apoyando a las comunidades locales y promoviendo la conservación ambiental a través del turismo responsable.
                                </p>
                            </div>
                            <div className="bg-eco-primary-50 p-6 rounded-xl">
                                <h3 className="text-xl font-bold text-eco-primary-800 mb-3">Nuestra Visión</h3>
                                <p>
                                    Ser la plataforma líder en ecoturismo en Colombia, reconocida por la calidad de sus destinos y el compromiso de su comunidad con el medio ambiente.
                                </p>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 mt-8 mb-3">¿Por qué EcoAventura?</h3>
                        <p className="mb-4">
                            En un mundo cada vez más digital, buscamos ser el puente hacia experiencias reales. Facilitamos a los viajeros encontrar lugares seguros y hermosos, y a los propietarios locales dar a conocer sus proyectos de conservación y turismo.
                        </p>

                        <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3">Únete a la Comunidad</h3>
                        <p className="mb-4">
                            Ya sea que busques tu próxima aventura o quieras compartir un lugar especial, EcoAventura es tu espacio. ¡Explora, comparte y cuida!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
