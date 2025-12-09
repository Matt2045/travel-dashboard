import {Header, TripCard} from "../../../components";
import {type LoaderFunctionArgs, useSearchParams} from "react-router";
import {getAllTrips, getTripById} from "~/appwrite/trips";
import {parseTripData} from "~/lib/utils";
import type {Route} from './+types/trips'
import {useState} from "react";
import {PagerComponent} from "@syncfusion/ej2-react-grids";


/**
 * Loader-Funktion: Ruft eine paginierte Liste von Reisen ab.
 * Die Seite wird über den URL-Suchparameter 'page' bestimmt.
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
    try {
        const limit = 8;
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || "1", 10);
        const offset = (page - 1) * limit;


        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout after 50s')), 50000)
        );

        const dataPromise = getAllTrips(limit, offset);

        const { allTrips, total } = await Promise.race([
            dataPromise,
            timeoutPromise
        ]) as { allTrips: any[], total: number };

        return {
            trips: allTrips.map(({ $id, tripDetail, imageUrls }) => ({
                id: $id,
                ...parseTripData(tripDetail),
                imageUrls: imageUrls ?? []
            })),
            total,
            error: null
        };

    } catch (error) {
        console.error('Loader failed:', error);

        return {
            trips: [],
            total: 0,
            error: error instanceof Error ? error.message : 'Failed to load trips'
        };
    }
};

/**
 * Trips-Komponente: Zeigt eine paginierte Übersicht aller erstellten KI-Reisen.
 */
const Trips = ({ loaderData }: Route.ComponentProps) => {
    const trips = loaderData.trips as Trip[] | [];

    // Lese den aktuellen Seitenparameter aus der URL, um den Anfangszustand zu setzen
    const [searchParams] = useSearchParams();
    const initialPage = Number(searchParams.get('page') || '1')

    // Lokaler State für die aktuell ausgewählte Seite (synchronisiert mit der URL)
    const [currentPage, setCurrentPage] = useState(initialPage);

    /**
     * Behandelt den Klick auf einen Paginierungs-Button.
     * Aktualisiert den State und setzt den 'page'-Suchparameter in der URL,
     * was den Loader erneut ausführt und neue Daten lädt (Serverseitige Paginierung).
     */
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.location.search = `?page=${page}`
    }

    return (
        <main className="all-users wrapper">
            {/* Kopfzeile mit CTA zum Erstellen einer neuen Reise */}
            <Header
                title="Trips"
                description="View and edit AI-generated travel plans"
                ctaText="Create a trip"
                ctaUrl="/create-trip"
            />

            <section>
                <h1 className="p-24-semibold text-dark-100 mb-4">
                    Manage Created Trips
                </h1>
                {/* --- Grid-Ansicht der Reisen --- */}
                <div className="trip-grid mb-4">
                    {trips.map((trip) => (
                        <TripCard
                            key={trip.id}
                            id={trip.id}
                            name={trip.name}
                            imageUrl={trip.imageUrls[0]}
                            location={trip.itinerary?.[0]?.location ?? ""}
                            tags={[trip.interests, trip.travelStyle]}
                            price={trip.estimatedPrice}
                        />
                    ))}
                </div>
                {/* --- Paginierungskomponente --- */}
                <PagerComponent
                    totalRecordsCount={loaderData.total}
                    pageSize={8}
                    currentPage={currentPage}
                    click={(args) => handlePageChange(args.currentPage)}
                    cssClass="!mb-4"
                />
            </section>
        </main>
    )
}
export default Trips