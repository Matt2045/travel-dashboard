// NotFound.tsx (Ihre 404-Seite)

import React from 'react';
import { useNavigate } from 'react-router'; // Abhängig von Ihrem Router




/**
 * 404 Fehlerseite (NotFound)
 * Zeigt eine Meldung an, wenn eine Route nicht gefunden wurde, und bietet Navigationsoptionen.
 */
const NotFoundPath = () => {
    // Hook von React Router zur programmatischen Navigation.
    const navigate = useNavigate();

    // Funktion für den "Zurück"-Button
    const goBack = () => {
        // Versucht, zur vorherigen Seite im Browser-Verlauf zu gehen
        navigate(-1);
    };

    // Navigiert zur Startseite oder zur Hauptansicht.
    const goToHome = () => {
        navigate('/dashboard');
    };

    return (
        <main className="auth">
            <section className="size-full flex-center px-6 text-center">
                <div className="p-10 bg-white rounded-lg shadow-xl">
                    <h1 className="p-36-bold text-dark-300">404</h1>
                    <h2 className="p-28-semibold text-dark-100 mt-4">
                        Page not found
                    </h2>
                    <p className="p-18-regular text-gray-100 max-w-md mx-auto mt-5">
                        Sorry, but the page you are looking for no longer exists or the URL is incorrect.
                    </p>

                    <div className="mt-8 flex justify-center gap-4">
                        {/* 1. Hauptaktion: Zur Startseite */}
                        <button
                            className="bg-blue-600 text-white p-18-semibold py-2 px-4 rounded-lg hover:bg-blue-700"
                            onClick={goToHome}
                        >
                            Back to home page
                        </button>

                        {/* 2. Sekundäre Aktion: Einen Schritt zurück */}
                        <button
                            className="text-dark-100 border border-gray-300 p-18-semibold py-2 px-4 rounded-lg hover:bg-gray-50"
                            onClick={goBack}
                        >
                            Back
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default NotFoundPath;