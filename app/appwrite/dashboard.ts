import { parseTripData } from "~/lib/utils";
import { database, appwriteConfig } from "./client";

// Definition für ein generisches Appwrite-Dokument
interface Document {
    [key: string]: any;
}

// Typdefinition für die Hilfsfunktion, die Dokumente nach einem Datumsbereich filtert und die Anzahl zurückgibt
type FilterByDate = (
    items: Document[],
    key: string,
    start: string,
    end?: string
) => number;

/**
 * Ruft aggregierte Statistiken über Benutzer und Reisen für das Dashboard ab.
 * Berechnet Metriken für den aktuellen Monat und den Vormonat.
 *
 * @returns {Promise<DashboardStats>} Das aggregierte Statistik-Objekt.
 */
export const getUsersAndTripsStats = async (): Promise<DashboardStats> => {
    // 1. Datumsberechnungen für aktuelle und vorherige Monate
    const d = new Date();
    // Start des aktuellen Monats (z.B. 01.11.2025 00:00:00)
    const startCurrent = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
    // Start des Vormonats (z.B. 01.10.2025 00:00:00)
    const startPrev = new Date(d.getFullYear(), d.getMonth() -1, 1).toISOString();
    // Ende des Vormonats (Der letzte Tag des Vormonats, z.B. 31.10.2025 23:59:59)
    const endPrev = new Date(d.getFullYear(), d.getMonth(), 0).toISOString();

    // 2. Parallelabruf aller Benutzer- und Reisedokumente von Appwrite (ohne Paginierung/Filterung, da die Filterung lokal erfolgt)
    const [users, trips] = await Promise.all([
        database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId
        ),
        database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId
        ),
    ])

    // 3. Hilfsfunktion zur Filterung nach Datum
    const filterByDate: FilterByDate = (items, key, start, end) => items.filter((item) => (
        // Überprüft, ob das Item-Datum größer oder gleich dem Startdatum ist
        item[key] >= start && (!end || item[key] <= end)
        // Überprüft, ob das Item-Datum kleiner oder gleich dem Enddatum ist (falls Enddatum existiert)
    )).length;

    // 4. Hilfsfunktion zur Filterung von Benutzern nach ihrer Rolle (Status)
    const filterUsersByRole = (role: string) => {
        return users.documents.filter((u: Document) => u.status === role)
    }

    // 5. Rückgabe des DashboardStats-Objekts mit berechneten Werten
    return {
        totalUsers: users.total,
        usersJoined: {
            currentMonth: filterByDate(
                users.documents,
                'joinedAt',
                startCurrent,
                undefined
            ),
            lastMonth: filterByDate(
                users.documents,
                'joinedAt',
                startPrev,
                endPrev
            )
        },
        userRole: {
            total: filterUsersByRole('user').length,
            currentMonth: filterByDate(
                filterUsersByRole('user'),
                'joinedAt',
                startCurrent,
                undefined
            ),
            lastMonth: filterByDate(
                filterUsersByRole('user'),
                'joinedAt',
                startPrev,
                endPrev
            )
        },
        totalTrips: trips.total,
        tripsCreated: {
            currentMonth: filterByDate(
                trips.documents,
                'createdAt',
                startCurrent,
                undefined
            ),
            lastMonth: filterByDate(
                filterUsersByRole('user'),
                'joinedAt',
                startPrev,
                endPrev
            )
        },
    }
}

/**
 * Berechnet das Benutzerwachstum pro Tag basierend auf dem 'joinedAt'-Feld.
 * Aggregiert die Anzahl der Benutzer, die an einem bestimmten Tag beigetreten sind.
 *
 * @returns {Promise<Array<{count: number, day: string}>>} Eine sortierte Liste des täglichen Wachstums.
 */
export const getUserGrowthPerDay = async () => {
    const users = await database.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId
    );

    const userGrowth = users.documents.reduce(
        (acc: { [key: string]: number }, user: Document) => {
            const date = new Date(user.joinedAt);
            const day = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
            acc[day] = (acc[day] || 0) + 1;
            return acc;
        },
        {}
    );

    return Object.entries(userGrowth).map(([day, count]) => ({
        count: Number(count),
        day,
    }));
};

/**
 * Berechnet die Anzahl der täglich erstellten Reisen basierend auf dem 'createdAt'-Feld.
 *
 * @returns {Promise<Array<{count: number, day: string}>>} Eine sortierte Liste der täglichen Reiseerstellungen.
 */

export const getTripsCreatedPerDay = async () => {
    const trips = await database.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.tripCollectionId
    );

    const tripsGrowth = trips.documents.reduce(
        (acc: { [key: string]: number }, trip: Document) => {
            const date = new Date(trip.createdAt);
            const day = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
            acc[day] = (acc[day] || 0) + 1;
            return acc;
        },
        {}
    );

    return Object.entries(tripsGrowth).map(([day, count]) => ({
        count: Number(count),
        day,
    }));
};

/**
 * Berechnet die Häufigkeit der verschiedenen Reisestile, die in den erstellten Reisen verwendet werden.
 * Erfordert die Dekodierung des JSON-Strings in `tripDetail`.
 *
 * @returns {Promise<Array<{count: number, travelStyle: string}>>} Eine Liste der Reisestile mit ihrer Häufigkeit.
 */
export const getTripsByTravelStyle = async () => {
    const trips = await database.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.tripCollectionId
    );

    const travelStyleCounts = trips.documents.reduce(
        (acc: { [key: string]: number }, trip: Document) => {
            const tripDetail = parseTripData(trip.tripDetail);

            if (tripDetail && tripDetail.travelStyle) {
                const travelStyle = tripDetail.travelStyle;
                acc[travelStyle] = (acc[travelStyle] || 0) + 1;
            }
            return acc;
        },
        {}
    );

    return Object.entries(travelStyleCounts).map(([travelStyle, count]) => ({
        count: Number(count),
        travelStyle,
    }));
};