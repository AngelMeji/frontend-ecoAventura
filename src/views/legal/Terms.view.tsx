import React from 'react';

const Terms: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
                    <h1 className="text-3xl font-bold text-eco-primary-900 mb-8 font-display">
                        Términos y Condiciones
                    </h1>

                    <div className="prose prose-eco max-w-none text-gray-600">
                        <p className="mb-4">
                            Bienvenido a EcoAventura. Al utilizar nuestro sitio web y servicios, aceptas cumplir con los siguientes términos y condiciones.
                        </p>

                        <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3">1. Uso del Servicio</h3>
                        <p className="mb-4">
                            EcoAventura es una plataforma para descubrir y compartir destinos de ecoturismo. Los usuarios deben utilizar la plataforma de manera responsable y respetar a la comunidad y al medio ambiente.
                        </p>

                        <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3">2. Contenido del Usuario</h3>
                        <p className="mb-4">
                            Al subir contenido (fotos, reseñas, información de lugares), garantizas que tienes el derecho de hacerlo y otorgas a EcoAventura una licencia para mostrar dicho contenido. Nos reservamos el derecho de eliminar contenido inapropiado.
                        </p>

                        <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3">3. Responsabilidad</h3>
                        <p className="mb-4">
                            EcoAventura no se hace responsable de la exactitud de la información proporcionada por los usuarios ni de los incidentes que puedan ocurrir durante las visitas a los lugares listados. Recomendamos siempre verificar las condiciones locales.
                        </p>

                        <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3">4. Cookies y Privacidad</h3>
                        <p className="mb-4">
                            Utilizamos cookies para mejorar tu experiencia. Al usar nuestro sitio, aceptas nuestra política de privacidad y uso de cookies.
                        </p>

                        <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3">5. Modificaciones</h3>
                        <p className="mb-4">
                            Nos reservamos el derecho de modificar estos términos en cualquier momento. El uso continuado del sitio implica la aceptación de los nuevos términos.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Terms;
