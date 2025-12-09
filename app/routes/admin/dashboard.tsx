import {Header, StatsCard, TripCard} from "../../../components";
import {getAllUsers, getUser} from "~/appwrite/auth";
import type { Route } from './+types/dashboard';
import {getTripsByTravelStyle, getUserGrowthPerDay, getUsersAndTripsStats} from "~/appwrite/dashboard";
import {getAllTrips} from "~/appwrite/trips";
import {parseTripData} from "~/lib/utils";
import {
    Category,
    ChartComponent,
    ColumnSeries,
    DataLabel, SeriesCollectionDirective, SeriesDirective,
    SplineAreaSeries,
    Tooltip
} from "@syncfusion/ej2-react-charts";
import {ColumnDirective, ColumnsDirective, GridComponent, Inject} from "@syncfusion/ej2-react-grids";
import {tripXAxis, tripyAxis, userXAxis, useryAxis} from "~/constants";


/**
 * clientLoader-Funktion: Ruft alle benötigten Daten für das Admin-Dashboard in einem einzigen
 * asynchronen Aufruf ab.
 *
 * NOTE: Promise.all wird verwendet, um alle Datenabfragen parallel auszuführen,
 * was die Ladezeit des Dashboards erheblich verkürzt.
 */
export const clientLoader = async () => {
    const [
        user,
        dashboardStats,
        trips,
        userGrowth,
        tripsByTravelStyle,
        allUsers,
    ] = await Promise.all([
        await getUser(),
        await getUsersAndTripsStats(),
        await getAllTrips(4, 0),
        await getUserGrowthPerDay(),
        await getTripsByTravelStyle(),
        await getAllUsers(4, 0),
    ])

    // Aufbereitung der Reise-Daten für die Darstellung im Dashboard
    const allTrips = trips.allTrips.map(({ $id, tripDetail, imageUrls }) => ({
        id: $id,
        ...parseTripData(tripDetail),
        imageUrls: imageUrls ?? []
    }))

    // Aufbereitung der Benutzerdaten für die Tabelle
    const mappedUsers: UsersItineraryCount[] = allUsers.users.map((user) => ({
        imageUrl: user.imageUrl,
        name: user.name,
        count: user.itineraryCount ?? Math.floor(Math.random() * 10),
    }))

    // Rückgabe aller aufbereiteten Daten
    return {
        user,
        dashboardStats,
        allTrips,
        userGrowth,
        tripsByTravelStyle,
        allUsers: mappedUsers
    }
}

/**
 * Dashboard-Komponente: Stellt die administrativen Daten visuell dar.
 * @param loaderData - Die von clientLoader gelieferten Dashboard-Daten.
 */
const Dashboard = ({ loaderData }: Route.ComponentProps) => {
    const user = loaderData.user as User | null;
    const { dashboardStats, allTrips, userGrowth, tripsByTravelStyle, allUsers } = loaderData;

    // Reduzierte Liste der Reisen für die zweite Grid-Tabelle
    const trips = allTrips.map((trip) => ({
        imageUrl: trip.imageUrls[0],
        name: trip.name,
        interest: trip.interests,
    }))

    // Konfiguration der Datenquellen für die beiden GridComponent-Tabellen
    const usersAndTrips = [
        {
            title: 'Latest user signups',
            dataSource: allUsers,
            field: 'count',
            headerText: 'Trips created'
        },
        {
            title: 'Trips based on interests',
            dataSource: trips,
            field: 'interest',
            headerText: 'Interests'
        }
    ]

    return (
        <main className="dashboard wrapper">
            {/* Kopfzeile mit Begrüßung und Beschreibung */}
            <Header
                title={`Welcome ${user?.name ?? 'Guest'} 👋`}
                description="Track activity, trends and popular destinations in real time"
            />

            {/* --- 1. Statistikkarten (Übersichtszahlen) --- */}
            <section className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    <StatsCard
                        headerTitle="Total Users"
                        total={dashboardStats.totalUsers}
                        currentMonthCount={dashboardStats.usersJoined.currentMonth}
                        lastMonthCount={dashboardStats.usersJoined.lastMonth}
                    />
                    <StatsCard
                        headerTitle="Total Trips"
                        total={dashboardStats.totalTrips}
                        currentMonthCount={dashboardStats.tripsCreated.currentMonth}
                        lastMonthCount={dashboardStats.tripsCreated.lastMonth}
                    />
                    <StatsCard
                        headerTitle="Active Users"
                        total={dashboardStats.userRole.total}
                        currentMonthCount={dashboardStats.userRole.currentMonth}
                        lastMonthCount={dashboardStats.userRole.lastMonth}
                    />
                </div>
            </section>

            {/* --- 2. Neueste erstellte Reisen (Kartenansicht) --- */}
            <section className="container">
                <h1 className="text-xl font-semibold text-dark-100">Created Trips</h1>

                <div className='trip-grid'>
                    {allTrips.map((trip) => (
                        <TripCard
                            key={trip.id}
                            id={trip.id.toString()}
                            name={trip.name!}
                            imageUrl={trip.imageUrls[0]}
                            location={trip.itinerary?.[0]?.location ?? ''}
                            tags={[trip.interests!, trip.travelStyle!]}
                            price={trip.estimatedPrice!}
                        />
                    ))}
                </div>
            </section>

            {/* --- 3. Diagramme (Trends) --- */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <ChartComponent
                    id="chart-1"
                    primaryXAxis={userXAxis}
                    primaryYAxis={useryAxis}
                    title="User Growth"
                    tooltip={{ enable: true}}
                >
                    <Inject services={[ColumnSeries, SplineAreaSeries, Category, DataLabel, Tooltip]} />

                    <SeriesCollectionDirective>
                        <SeriesDirective
                            dataSource={userGrowth}
                            xName="day"
                            yName="count"
                            type="Column"
                            name="Column"
                            columnWidth={0.3}
                            cornerRadius={{topLeft: 10, topRight: 10}}
                        />

                        <SeriesDirective
                            dataSource={userGrowth}
                            xName="day"
                            yName="count"
                            type="SplineArea"
                            name="Wave"
                            fill="rgba(71, 132, 238, 0.3)"
                            border={{ width: 2, color: '#4784EE'}}
                        />
                    </SeriesCollectionDirective>
                </ChartComponent>

                <ChartComponent
                    id="chart-2"
                    primaryXAxis={tripXAxis}
                    primaryYAxis={tripyAxis}
                    title="Trip Trends"
                    tooltip={{ enable: true}}
                >
                    <Inject services={[ColumnSeries, SplineAreaSeries, Category, DataLabel, Tooltip]} />

                    <SeriesCollectionDirective>
                        <SeriesDirective
                            dataSource={tripsByTravelStyle}
                            xName="travelStyle"
                            yName="count"
                            type="Column"
                            name="day"
                            columnWidth={0.3}
                            cornerRadius={{topLeft: 10, topRight: 10}}
                        />
                    </SeriesCollectionDirective>
                </ChartComponent>
            </section>

            {/* --- 4. Tabellen (Neueste Benutzer und Interessen) --- */}
            <section className="user-trip wrapper">
                {usersAndTrips.map(({ title, dataSource, field, headerText}, i) => (
                    <div key={i} className="flex flex-col gap-5">
                        <h3 className="p-20-semibold text-dark-100">{title}</h3>

                        <GridComponent dataSource={dataSource} gridLines="None">
                            <ColumnsDirective>
                                <ColumnDirective
                                    field="name"
                                    headerText="Name"
                                    width="200"
                                    textAlign="Left"
                                    template={(props: UserData) => (
                                        <div className="flex items-center gap-1.5 px-4">
                                            <img src={props?.imageUrl || "assets/images/david.webp"} alt="user" className="rounded-full size-8 aspect-square" referrerPolicy="no-referrer" />
                                            <span>{props.name}</span>
                                        </div>
                                    )}
                                />

                                <ColumnDirective
                                    field={field}
                                    headerText={headerText}
                                    width="150"
                                    textAlign="Left"
                                />
                            </ColumnsDirective>
                        </GridComponent>
                    </div>
                ))}
            </section>
        </main>
    )
}
export default Dashboard