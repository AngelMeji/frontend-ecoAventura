import React from 'react';

const Terms: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8 md:p-12">
                    <h1 className="text-3xl font-extrabold text-eco-primary-900 mb-8 border-b border-gray-100 pb-6">
                        Términos y Condiciones
                    </h1>
                    <div className="prose prose-eco max-w-none space-y-12">
                        <section>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-eco-primary-100 text-eco-primary-700 flex items-center justify-center text-sm font-black">1</span>
                                Introducción
                            </h2>
                            <p className="text-gray-600 leading-relaxed pl-10">
                                Bienvenido a EcoAventura. Al acceder y utilizar nuestro sitio web, usted acepta cumplir con los siguientes términos y condiciones. Si no está de acuerdo con alguna parte de estos términos, le rogamos que no utilice nuestra plataforma.
                            </p>
                        </section>
                        <section>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-eco-primary-100 text-eco-primary-700 flex items-center justify-center text-sm font-black">2</span>
                                Uso del Sitio
                            </h2>
                            <p className="text-gray-600 leading-relaxed pl-10">
                                EcoAventura es una plataforma diseñada para la promoción del turismo sostenible. Usted se compromete a utilizar el sitio únicamente para fines legales y de una manera que no infrinja los derechos de terceros ni restrinja o inhiba su uso y disfrute del sitio.
                            </p>
                        </section>
                        <section>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-eco-primary-100 text-eco-primary-700 flex items-center justify-center text-sm font-black">3</span>
                                Contenido y Propiedad Intelectual
                            </h2>
                            <p className="text-gray-600 leading-relaxed pl-10">
                                Todo el contenido presente en este sitio, incluyendo textos, gráficos, logotipos, imágenes e iconos, es propiedad exclusiva de EcoAventura o de sus proveedores de contenido y está protegido por las leyes de propiedad intelectual internacionales y de Colombia.
                            </p>
                        </section>
                        <section>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-eco-primary-100 text-eco-primary-700 flex items-center justify-center text-sm font-black">4</span>
                                Limitación de Responsabilidad
                            </h2>
                            <p className="text-gray-600 leading-relaxed pl-10">
                                EcoAventura no se hace responsable de daños directos, indirectos o consecuentes derivados del uso de nuestra plataforma o de la información contenida en ella. No garantizamos que el sitio esté libre de errores o virus.
                            </p>
                        </section>
                        <section className="bg-gray-50 rounded-2xl p-6 border-l-4 border-eco-primary-500">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Actualizaciones</h2>
                            <p className="text-sm text-gray-500">
                                Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio web. Última actualización: 02 de abril de 2026.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Terms;
