import React from 'react';

const Privacy: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8 md:p-12">
                    <h1 className="text-3xl font-extrabold text-eco-primary-900 mb-8 border-b border-gray-100 pb-6">
                        Política de Privacidad y Habeas Data
                    </h1>
                    <div className="prose prose-eco max-w-none space-y-12">
                        <section>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </span>
                                Compromiso de Privacidad
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                En EcoAventura, valoramos profundamente su privacidad. Esta política detalla cómo recopilamos, utilizamos, almacenamos y protegemos su información personal, cumpliendo con la Ley 1581 de 2012 y demás normas sobre protección de datos en Colombia (Habeas Data).
                            </p>
                        </section>
                        <section className="bg-eco-primary-50 p-8 rounded-[2rem] border border-eco-primary-100">
                            <h2 className="text-xl font-bold text-eco-primary-800 mb-4">Información que Recopilamos</h2>
                            <ul className="grid sm:grid-cols-2 gap-4 list-none p-0">
                                <li className="flex items-center gap-2 text-sm text-gray-700 bg-white p-3 rounded-xl border border-eco-primary-100">
                                    <span className="w-2 h-2 rounded-full bg-eco-primary-500"></span>
                                    Nombres y Apellidos
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-700 bg-white p-3 rounded-xl border border-eco-primary-100">
                                    <span className="w-2 h-2 rounded-full bg-eco-primary-500"></span>
                                    Correo Electrónico
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-700 bg-white p-3 rounded-xl border border-eco-primary-100">
                                    <span className="w-2 h-2 rounded-full bg-eco-primary-500"></span>
                                    Información de Perfil
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-700 bg-white p-3 rounded-xl border border-eco-primary-100">
                                    <span className="w-2 h-2 rounded-full bg-eco-primary-500"></span>
                                    Datos de Navegación (Cookies)
                                </li>
                            </ul>
                        </section>
                        <section>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </span>
                                Derechos del Titular (Habeas Data)
                                
                            </h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Como titular de los datos personales, usted tiene derecho a conocer, actualizar y rectificar su información en cualquier momento. Usted puede:
                            </p>
                            <div className="space-y-3">
                                <div className="p-4 bg-gray-50 rounded-2xl border-l-4 border-eco-primary-400">
                                    <p className="font-bold text-gray-800 text-sm">Consultar su información</p>
                                    <p className="text-xs text-gray-500">Solicitar copia de los datos personales almacenados en nuestros servidores.</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border-l-4 border-eco-primary-400">
                                    <p className="font-bold text-gray-800 text-sm">Actualizar o Rectificar</p>
                                    <p className="text-xs text-gray-500">Modificar información inexacta o incompleta.</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border-l-4 border-eco-primary-400">
                                    <p className="font-bold text-gray-800 text-sm">Suprimir y Revocar</p>
                                    <p className="text-xs text-gray-500">Solicitar la eliminación de sus datos cuando sea posible legalmente.</p>
                                </div>
                            </div>
                        </section>
                        <section className="bg-gray-900 rounded-[2rem] p-10 text-white shadow-2xl">
                            <h2 className="text-xl font-bold mb-4">Contacto de Privacidad</h2>
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                Si tiene dudas sobre el tratamiento de sus datos o desea ejercer sus derechos de Habeas Data, puede contactarnos a:
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="flex items-center gap-3 bg-white bg-opacity-5 p-4 rounded-2xl">
                                    <span className="w-10 h-10 bg-white bg-opacity-10 rounded-full flex items-center justify-center text-eco-primary-300">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </span>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Email</p>
                                        <p className="text-sm font-medium">privacidad@ecoaventura.com</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white bg-opacity-5 p-4 rounded-2xl">
                                    <span className="w-10 h-10 bg-white bg-opacity-10 rounded-full flex items-center justify-center text-eco-secondary-300">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </span>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Oficina</p>
                                        <p className="text-sm font-medium">Pereira, Risaralda, Colombia</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
