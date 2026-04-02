import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const Privacy: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
                    <h1 className="text-4xl font-display font-bold text-eco-primary-900 mb-4">
                        {t('home.privacy.title')}
                    </h1>
                    <p className="text-gray-500 mb-8">
                        {t('home.privacy.lastUpdated')}: Febrero 2026
                    </p>

                    <div className="prose prose-lg max-w-none">
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('home.privacy.intro.title')}</h2>
                            <p className="text-gray-600 leading-relaxed">
                                {t('home.privacy.intro.content')}
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('home.privacy.dataCollection.title')}</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                {t('home.privacy.dataCollection.intro')}
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                <li>{t('home.privacy.dataCollection.items.name')}</li>
                                <li>{t('home.privacy.dataCollection.items.email')}</li>
                                <li>{t('home.privacy.dataCollection.items.profile')}</li>
                                <li>{t('home.privacy.dataCollection.items.reviews')}</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('home.privacy.dataUse.title')}</h2>
                            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                <li>{t('home.privacy.dataUse.items.service')}</li>
                                <li>{t('home.privacy.dataUse.items.communication')}</li>
                                <li>{t('home.privacy.dataUse.items.improvement')}</li>
                                <li>{t('home.privacy.dataUse.items.security')}</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('home.privacy.dataProtection.title')}</h2>
                            <p className="text-gray-600 leading-relaxed">
                                {t('home.privacy.dataProtection.content')}
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('home.privacy.userRights.title')}</h2>
                            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                <li>{t('home.privacy.userRights.items.access')}</li>
                                <li>{t('home.privacy.userRights.items.correction')}</li>
                                <li>{t('home.privacy.userRights.items.deletion')}</li>
                                <li>{t('home.privacy.userRights.items.portability')}</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('home.privacy.contact.title')}</h2>
                            <p className="text-gray-600 leading-relaxed">
                                {t('home.privacy.contact.content')}
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Privacy;
