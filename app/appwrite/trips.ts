import {appwriteConfig, database} from "~/appwrite/client";
import {Query} from "appwrite";

/**
 * Retry-Funktion: Versucht eine Operation mehrmals bei Fehlern
 */
async function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error');
            console.warn(`Attempt ${attempt}/${maxRetries} failed:`, lastError.message);

            // Warte vor dem nächsten Versuch (exponential backoff)
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
            }
        }
    }

    throw lastError;
}

/**
 * Ruft eine paginierte Liste aller in Appwrite gespeicherten Reisen ab.
 * Die Ergebnisse werden standardmäßig nach dem Erstellungsdatum (neueste zuerst) sortiert.
 *
 * @param {number} limit Die maximale Anzahl der zurückzugebenden Dokumente (Paginierung).
 * @param {number} offset Die Startposition der Abfrage.
 * @returns {Promise<{allTrips: any[], total: number}>} Ein Objekt mit der Liste der Reisen und der Gesamtzahl.
 */
export const getAllTrips = async (limit: number, offset: number) => {
    try {
        const allTrips = await retryOperation(
            () => database.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.tripCollectionId,
                [Query.limit(limit), Query.offset(offset), Query.orderDesc('createdAt')]
            ),
            3, // 3 Versuche
            1000 // 1 Sekunde Delay
        );

        if(allTrips.total === 0) {
            console.log('No trips found (empty database)');
            return { allTrips: [], total: 0 };
        }

        return {
            allTrips: allTrips.documents,
            total: allTrips.total,
        };

    } catch (error) {
        console.error('Failed to fetch trips after retries:', error);
        // Return leere Daten statt Error zu werfen
        return { allTrips: [], total: 0 };
    }
};

/**
 * Ruft eine einzelne Reise anhand ihrer eindeutigen Appwrite-Dokumenten-ID ab.
 *
 * @param {string} tripId Die ID des gesuchten Reise-Dokuments.
 * @returns {Promise<any | null>} Das Reise-Dokument oder null, wenn es nicht gefunden wird.
 */
export const getTripById = async (tripId: string) => {
    try {
        const trip = await retryOperation(
            () => database.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.tripCollectionId,
                tripId
            ),
            3,
            1000
        );

        if(!trip.$id) {
            console.log('Trip not found (no $id)');
            return null;
        }

        return trip;

    } catch (error) {
        console.error(`Failed to fetch trip ${tripId}:`, error);
        return null;
    }
};