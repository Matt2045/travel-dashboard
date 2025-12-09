import { ID, OAuthProvider, Query } from "appwrite";
import { account, database, appwriteConfig } from "~/appwrite/client";
import { redirect } from "react-router";


// auth.ts (Ergänzung)

/**
 * Meldet einen Benutzer anonym als "Gast" an.
 * Erstellt anschließend ein Benutzerdokument in der Datenbank.
 * 1. Erstellt eine anonyme Sitzung.
 * Abrufen des Benutzers
 * Abfrage, ob Gastbenutzer existiert
 * Datenbankeintrag für gast erstellen
 */
export const loginAsGuest = async () => {
    try {
        // 1. Anonyme Sitzung erstellen
        await account.createAnonymousSession();

        // 2. Benutzer abrufen
        const user = await account.get();
        if (!user) throw new Error("Could not create anonymous user");

        // 3. Prüfen, ob der Gastbenutzer bereits existiert (wichtig, falls die Session noch aktiv ist)
        const existingUser = await getExistingUser(user.$id);
        if (existingUser) return;

        // 4. Datenbank-Eintrag für den Gastbenutzer erstellen
        const createdGuestUser = await database.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                accountId: user.$id,
                name: "Guest User",
                email: `guest-${user.$id}@portfolio.com`, // Eindeutige Platzhalter-E-Mail
                status: "admin",
                imageUrl: null,
                joinedAt: new Date().toISOString(),
            }
        );
        if (!createdGuestUser.$id) redirect("/sign-in");
    } catch (error) {
        console.error("Error during anonymous login:", error);
    }
};


/**
 * Überprüft, ob ein Appwrite-Benutzerdatensatz für die gegebene Account-ID bereits in der Datenbank existiert.
 *
 * @param {string} id Die eindeutige Account-ID von Appwrite ($id).
 * @returns {Promise<any | null>} Das Benutzerdokument oder null, falls nicht gefunden oder ein Fehler auftritt.
 */
export const getExistingUser = async (id: string) => {
    try {
        const { documents, total } = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", id)]
        );
        return total > 0 ? documents[0] : null;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
};

/**
 * Speichert die Appwrite-Account-Daten und zusätzliche Informationen in der Appwrite-Datenbank
 * (in der 'userCollectionId'). Dies geschieht typischerweise nach einer erfolgreichen OAuth-Anmeldung.
 */
export const storeUserData = async () => {
    try {
        const user = await account.get();
        if (!user) throw new Error("User not found");

        const { providerAccessToken } = (await account.getSession("current")) || {};
        const profilePicture = providerAccessToken
            ? await getGooglePicture(providerAccessToken)
            : null;

        const createdUser = await database.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                accountId: user.$id,
                email: user.email,
                name: user.name,
                imageUrl: profilePicture,
                joinedAt: new Date().toISOString(),
            }
        );

        if (!createdUser.$id) redirect("/sign-in");
    } catch (error) {
        console.error("Error storing user data:", error);
    }
};


/**
 * Ruft das Profilbild des Google-Benutzers über die People API ab,
 * basierend auf dem erhaltenen OAuth-Access-Token.
 *
 * @param {string} accessToken Das OAuth2-Access Token.
 * @returns {Promise<string | null>} Die URL des Profilbilds oder null bei Fehler.
 */
const getGooglePicture = async (accessToken: string) => {
    try {
        const response = await fetch(
            "https://people.googleapis.com/v1/people/me?personFields=photos",
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!response.ok) throw new Error("Failed to fetch Google profile picture");

        const { photos } = await response.json();
        return photos?.[0]?.url || null;
    } catch (error) {
        console.error("Error fetching Google picture:", error);
        return null;
    }
};

/**
 * Startet den Google OAuth2 Anmeldeprozess.
 * Leitet den Benutzer zur Google-Anmeldeseite weiter.
 */
export const loginWithGoogle = async () => {
    try {
        account.createOAuth2Session(
            OAuthProvider.Google,
            `${window.location.origin}/`,
            `${window.location.origin}/404`
        );

    } catch (error) {
        console.error("Error during OAuth2 session creation:", error);
    }
};

/**
 * Meldet den aktuellen Benutzer ab, indem die aktive Sitzung gelöscht wird.
 */
export const logoutUser = async () => {
    try {
        await account.deleteSession("current");
    } catch (error) {
        console.error("Error during logout:", error);
    }
};

/**
 * Ruft die Benutzerdaten (Account + Datenbank-Dokument) ab.
 * Stellt sicher, dass der Benutzer in der Datenbank existiert und authentifiziert ist.
 *
 * @returns {Promise<any | Response>} Das Benutzerdokument oder eine Weiterleitung, falls nicht authentifiziert.
 */
export const getUser = async () => {
    try {
        const user = await account.get();
        if (!user) return redirect("/sign-in");

        const { documents } = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [
                Query.equal("accountId", user.$id),
                Query.select(["name", "email", "imageUrl", "joinedAt", "accountId"]),
            ]
        );

        return documents.length > 0 ? documents[0] : redirect("/sign-in");
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
};

/**
 * Ruft eine paginierte Liste aller Benutzerdokumente aus der Datenbank ab.
 *
 * @param {number} limit Die maximale Anzahl der zurückzugebenden Dokumente.
 * @param {number} offset Die Startposition der Abfrage.
 * @returns {Promise<{users: any[], total: number}>} Ein Objekt, das die Benutzer und die Gesamtzahl enthält.
 */
export const getAllUsers = async (limit: number, offset: number) => {
    try {
        const { documents: users, total } = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.limit(limit), Query.offset(offset)]
        )

        if(total === 0) return { users: [], total };

        return { users, total };
    } catch (e) {
        console.log('Error fetching users')
        return { users: [], total: 0 }
    }
}