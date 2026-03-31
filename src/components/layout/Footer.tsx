import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { authService } from '../../services/authService';

const Footer: React.FC = () => {
    const { t } = useLanguage();
    const currentYear = new Date().getFullYear();
    const user = authService.getCurrentUser();
    const showPartnerButton = !user || (user.role !== 'admin' && user.role !== 'partner');

    return (
        <footer className="bg-eco-primary-900 text-white pt-16 pb-8 mt-auto">
            <div className="container mx-auto px-4">
                <div className={`grid grid-cols-1 ${showPartnerButton ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-12 mb-12`}>
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            {/* Logo Icon */}
                            <div className="bg-white/10 p-2 rounded-lg">
                                <svg className="w-6 h-6 text-eco-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="text-2xl font-display font-bold text-eco-accent tracking-tight">EcoAventura</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Conectando viajeros conscientes con la exuberante naturaleza de Risaralda. Turismo que protege y preserva.
                        </p>
                        
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 text-eco-accent">Explorar</h4>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li><a href="/home" className="hover:text-white transition-colors flex items-center gap-2">Destinos</a></li>
                            <li><a href="/about" className="hover:text-white transition-colors flex items-center gap-2">Sobre Nosotros</a></li>
                            <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2">Blog (Pronto)</a></li>
                        </ul>
                    </div>

                    {/* Legal & Help */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 text-eco-accent">Soporte</h4>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li><a href="/terms" className="hover:text-white transition-colors">Términos y Condiciones</a></li>
                            <li><Link to="/privacy" className="hover:text-white transition-colors">{t('home.footer.privacy')}</Link></li>
                            <li><Link to="/cookies" className="hover:text-white transition-colors">{t('home.footer.cookies')}</Link></li>
                            {showPartnerButton && <li><a href="/partner-request" className="hover:text-white transition-colors">Ser Socio</a></li>}
                        </ul>
                    </div>

                    {/* Call to Action */}
                    {showPartnerButton && (
                        <div>
                            <h4 className="text-lg font-bold mb-6 text-eco-accent">Únete a nosotros</h4>
                            <p className="text-gray-400 text-sm mb-4">
                                ¿Tienes un destino ecoturístico? Únete a nuestra red de socios.
                            </p>
                            <a
                                href="/partner-request"
                                className="inline-block w-full text-center bg-eco-accent hover:bg-yellow-400 text-eco-primary-900 font-bold py-3 px-6 rounded-xl transition-all transform hover:-translate-y-1 shadow-lg shadow-eco-accent/20"
                            >
                                Solicitar ser Socio
                            </a>
                        </div>
                    )}
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm text-center md:text-left">
                        © {currentYear} EcoAventura. {t('home.footer.rights')}
                    </p>
                    <div className="flex gap-6 text-sm text-gray-500">
                        <Link to="/privacy" className="hover:text-white transition-colors">{t('home.footer.privacy')}</Link>
                        <Link to="/cookies" className="hover:text-white transition-colors">{t('home.footer.cookies')}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
