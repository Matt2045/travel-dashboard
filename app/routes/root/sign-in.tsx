import React from 'react'
import {Link, redirect, useNavigate} from "react-router";
import {ButtonComponent} from "@syncfusion/ej2-react-buttons";
import {loginAsGuest, loginWithGoogle} from "~/appwrite/auth";
import {account} from "~/appwrite/client";

/**
 * Loader-Funktion zum Überprüfen des aktuellen Authentifizierungsstatus.
 * Leitet den Benutzer zum Hauptbereich weiter, wenn bereits eine Sitzung existiert.
 */
export async function clientLoader() {
    try {
        // Versucht, die aktuelle Sitzung abzurufen.
        const session = await account.getSession({
            sessionId: "current"
        });
        if (!session) {
            console.log("No session found");
            return;
        }

        // Ruft Benutzerdetails ab und leitet bei erfolgreicher Anmeldung um.
        const user = await account.get();

        if(user.$id) return redirect("/");

    } catch (e) {
        console.log("Error in clientLoader sign-in", e)
    }
}

/**
 * Anmelde-Komponente (Sign-In).
 * Ermöglicht die Anmeldung über Google oder als Gast für Testzwecke..
 */
const SignIn = () => {
    const navigate = useNavigate();

    const handleGuestLogin = async () => {
        try {
            await loginAsGuest();

            // Bei erfolgreicher Anmeldung leitet der Benutzer zum Dashboard um.
            navigate("/dashboard");

        } catch (error) {
            console.error("Failed to log in as guest:", error);
        }
    };

    return (
        <main className="auth">
            <section className="size-full glassmorphism flex-center px-6">
                <div className="sign-in-card">
                    <header className="header">
                        <Link to="/">
                            <img
                                src="/assets/icons/logo.svg"
                                alt="logo"
                                className="size-[30px] "
                            />
                        </Link>
                        <h1 className="p-28-bold text-dark-100">
                            Tourvisto
                        </h1>
                    </header>

                    <article>
                        <h2 className="p-28-semibold text-dark-100 text-center">
                            Start your travel journey
                            <p className="p-18-regular mt-5 text-center text-gray-100 !leading-7">
                                Sign in with Google to manage destinations, itineraries, and user activity with ease.
                            </p>
                        </h2>
                    </article>

                    {/* Button für Google Login */}
                    <ButtonComponent
                            type="button"
                            iconCss="e-search-icon"
                            className="button-class !h-11 !w-full"
                            onClick={loginWithGoogle}
                    >
                        <img
                            src="/assets/icons/google.svg"
                            alt="logo"
                            className="size-5"
                        />

                        <span className="p-18-semibold text-white">Sign in with Google</span>
                    </ButtonComponent>

                    {/* Button für Gast-Login */}
                    <ButtonComponent
                        type="button"
                        className="button-class !h-11 !w-full mt-2.5"
                        iconCss="e-search-icon e-primary e-outline"
                        onClick={handleGuestLogin}
                    >
                        <img
                            src="/assets/icons/user.svg"
                            alt="logo"
                            className="size-5"
                        />
                        <span className="p-18-semibold">Continue as Guest</span>
                    </ButtonComponent>
                </div>
            </section>
        </main>
    )
}
export default SignIn
