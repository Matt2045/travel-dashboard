import React from 'react'
import {Outlet, redirect} from "react-router";
import {SidebarComponent} from "@syncfusion/ej2-react-navigations";
import {MobileSidebar, NavItems} from "../../../components";
import {account} from "~/appwrite/client";
import {getExistingUser, storeUserData} from "~/appwrite/auth";


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

        // 5. Wenn der Benutzer existiert gib die Daten zurück. Andernfalls speichere die Benutzerdaten, falls sie neu sind.
        return existingUser?.$id ? existingUser : await storeUserData();
    } catch (e) {
        console.log('Error in clientLoader', e)
        return redirect('/sign-in')
    }
}



/**
 * AdminLayout-Komponente: Definiert die Struktur für den Admin-Bereich.
 * Enthält die Sidebar und den Bereich für die gerenderten Kind-Routen (Outlet).
 */
export default function AdminLayout() {
    // Ruft die aktuellen Benutzerinformationen ab
    const user = account.get();

    return (
        <div className="admin-layout">

            <MobileSidebar />
            <aside className="w-full max-w-[270px] hidden lg:block">Sidebar</aside>
                <SidebarComponent width={270} enableGestures={false} >
                    <NavItems />
                </SidebarComponent>
            <aside className="children">
                <Outlet />
            </aside>

        </div>
    )
}
