import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const Cookies: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
                    <h1 className="text-4xl font-display font-bold text-eco-primary-900 mb-4">
                        {t('home.cookies.title')}
                    </h1>
                    <p className="text-gray-500 mb-8">
                        {t('home.cookies.lastUpdated')}: Febrero 2026
                    </p>

                    <div className="prose prose-lg max-w-none">
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('home.cookies.intro.title')}</h2>
                            <p className="text-gray-600 leading-relaxed">
                                {t('home.cookies.intro.content')}
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('home.cookies.whatAre.title')}</h2>
                            <p className="text-gray-600 leading-relaxed">
                                {t('home.cookies.whatAre.content')}
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('home.cookies.types.title')}</h2>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('home.cookies.types.essential.title')}</h3>
                                    <p className="text-gray-600">{t('home.cookies.types.essential.content')}</p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('home.cookies.types.functional.title')}</h3>
                                    <p className="text-gray-600">{t('home.cookies.types.functional.content')}</p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('home.cookies.types.analytics.title')}</h3>
                                    <p className="text-gray-600">{t('home.cookies.types.analytics.content')}</p>
                                </div>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('home.cookies.management.title')}</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                {t('home.cookies.management.content')}
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                <li>{t('home.cookies.management.items.browser')}</li>
                                <li>{t('home.cookies.management.items.preferences')}</li>
                                <li>{t('home.cookies.management.items.thirdParty')}</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('home.cookies.contact.title')}</h2>
                            <p className="text-gray-600 leading-relaxed">
                                {t('home.cookies.contact.content')}
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Cookies;
