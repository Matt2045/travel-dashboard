import React from 'react'
import {Outlet, redirect, useNavigate} from "react-router";
import {getExistingUser, logoutUser, storeUserData} from "~/appwrite/auth";
import {account} from "~/appwrite/client";


/**
 * clientLoader-Funktion: Überprüft die Authentifizierung und die Benutzerrolle (Autorisierung).
 *
 * Logik:
 * 1. Ist der Benutzer in Appwrite angemeldet? (account.get())
 * 2. Wenn nicht angemeldet, leite zu /sign-in weiter.
 * 3. Ist der angemeldete Benutzer bereits in der Datenbank gespeichert? (getExistingUser)
 * 4. Wenn der Benutzer existiert, aber nur die Rolle 'user' (kein Admin) hat, leite zu / weiter.
 * 5. Wenn der Benutzer Admin ist, gib die Benutzerdaten zurück, um den Zugriff zu gewähren.
 * 6. Wenn der Benutzer angemeldet, aber noch nicht in der DB gespeichert ist (z.B. nach der ersten Google-Anmeldung), speichere ihn.
 */
export async function clientLoader() {
    try {
        // 1. Ruft die aktuellen Appwrite-Kontoinformationen ab.
        const user = await account.get();

        // 2. Wenn keine Benutzer-ID vorhanden ist, ist der Benutzer nicht angemeldet.
        if(!user.$id) return redirect('/sign-in');

        // 3. Versucht, den Benutzer aus der internen Datenbank abzurufen, um dessen Status zu prüfen.
        const existingUser = await getExistingUser(user.$id);

        // 4. Wenn der Benutzer existiert und den Status 'user' hat (kein Admin), wird er zur Homepage umgeleitet.
        if(existingUser?.status === 'user') {
            return redirect('/');
        }
        if(existingUser?.status === 'admin') {
            return redirect('/dashboard');
        }
    } catch (e) {
        console.log('Error in clientLoader', e)
        return redirect('/sign-in')
    }
}


/**
 * PageLayout-Komponente.
 * Bietet die primäre Struktur der Anwendung, inklusive Side Navigation und Logout-Funktionalität.
 * Rendert den Inhalt der jeweiligen Route über <Outlet />.
 */
const PageLayout = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logoutUser();
        navigate("/sign-in");

    }
    return (
        <div>
            <button
                onClick={handleLogout}
                className="cursor-pointer"
            >
                <img src="/assets/icons/logout.svg"
                     alt="Logout"
                     className="size-6" />
            </button>

            <button onClick={() => navigate("/dashboard")}>
                Dashboard

            </button>
        </div>
    )
}
export default PageLayout
