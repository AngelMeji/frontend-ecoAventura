import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';
import { authService } from '../../services/authService';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const user = authService.getCurrentUser();
    const showPartnerButton = !user || (user.role !== 'admin' && user.role !== 'partner');

    const sections = [
        {
            title: 'Explorar',
            links: [
                { name: 'Destinos', path: '/home' },
                { name: 'Categorías', path: '/home#categories' },
                { name: 'Mapa', path: '/home#map' }
            ]
        },
        {
            title: 'Soporte',
            links: [
                { name: 'Ayuda', path: '#' },
                { name: 'Contacto', path: '#' },
                ...(showPartnerButton ? [{ name: 'Ser Socio', path: '/partner-request' }] : [])
            ]
        },
        {
            title: 'Legal',
            links: [
                { name: 'Sobre Nosotros', path: '/about-us' },
                { name: 'Términos y Condiciones', path: '/terms' },
                { name: 'Política de Privacidad', path: '/privacy' }
            ]
        }
    ];

    const socialLinks = [
        { name: 'Facebook', icon: 'fb', path: '#' },
        { name: 'Instagram', icon: 'ig', path: '#' },
        { name: 'Twitter', icon: 'tw', path: '#' }
    ];

    return (
        <footer className="bg-white pt-24 pb-12 border-t border-gray-100 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-eco-primary-50 rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-eco-secondary-50 rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>

            <div className="container mx-auto px-6 relative">
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <Logo />
                        <p className="text-gray-500 max-w-sm leading-relaxed">
                            Descubre la belleza oculta de Risaralda. Conectamos a los viajeros con la naturaleza de forma responsable y sostenible para preservar nuestro paraíso.
                        </p>
                        <div className="flex items-center gap-4">
                            {socialLinks.map((social) => (
                                <a 
                                    key={social.name} 
                                    href={social.path}
                                    className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-eco-primary-600 hover:text-white transition-all duration-300 transform hover:-translate-y-1 shadow-sm"
                                    aria-label={social.name}
                                >
                                    <span className="sr-only">{social.name}</span>
                                    <span className="text-[10px] font-black tracking-tighter">{social.name.substring(0, 2).toUpperCase()}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Links */}
                    {sections.map((section) => (
                        <div key={section.title} className="space-y-6">
                            <h4 className="text-gray-900 font-extrabold uppercase tracking-widest text-[10px]">
                                {section.title}
                            </h4>
                            <ul className="space-y-4">
                                {section.links.map((link) => (
                                    <li key={link.name}>
                                        <Link 
                                            to={link.path} 
                                            className="text-gray-500 hover:text-eco-primary-600 transition-all duration-200 text-sm font-medium flex items-center gap-2 group"
                                        >
                                            <span className="w-1 h-1 rounded-full bg-eco-primary-400 scale-0 group-hover:scale-100 transition-transform"></span>
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Section */}
                <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-400 font-medium">
                    <p>© {currentYear} EcoAventura. Todos los derechos reservados.</p>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            Hecho con <span className="text-red-500 animate-pulse">❤️</span> en Risaralda
                        </span>
                        <span className="text-gray-200">|</span>
                        <Link to="/privacy" className="hover:text-eco-primary-600 transition-colors">Habeas Data</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
