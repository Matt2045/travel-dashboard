import React from 'react'
import {Header} from "../../../components";
import {ColumnDirective, ColumnsDirective, GridComponent} from "@syncfusion/ej2-react-grids";
import {cn, formatDate} from "~/lib/utils";
import {getAllUsers} from "~/appwrite/auth";
import type {Route} from "../../../.react-router/types/app/routes/admin/+types/all-users";


/**
 * Loader-Funktion für die Route. Sie wird vor dem Rendern der Komponente ausgeführt
 * und dient zum Abrufen der notwendigen Daten (Benutzerliste und Gesamtanzahl) von Appwrite.
 * Diese Daten werden an die Komponente übergeben.
 */

export const loader = async () => {
    const {users, total} = await getAllUsers(10, 0);

    return {users, total};
}

/**
 * Die Hauptkomponente für die Benutzerverwaltungsseite.
 * Zeigt eine Tabelle aller Benutzer unter Verwendung der Syncfusion GridComponent an.
 *
 * @param loaderData - Die Daten, die von der `loader`-Funktion bereitgestellt wurden.
 * @returns Die gerenderte Seite mit Überschrift und Benutzertabelle.
 */
export default function AllUsers({ loaderData}: Route.ComponentProps) {
    // Extrahiert die Benutzerliste aus den geladenen Daten
    const {users} = loaderData;


    return (
        <main className="all-users wrapper">
            {/* Kopfzeile der Seite für Titel und Beschreibung */}
            <Header
            title="Manage Users"
            description="Filter, sort, and access detailed user profiles"

        />
            {/* Syncfusion GridComponent zur Anzeige der Benutzerdaten */}
            <GridComponent dataSource={users} gridLines="None">
                <ColumnsDirective>

                    <ColumnDirective
                        field="name"
                        headerText="Name"
                        width="200"
                        textAlign="Left"
                        template={(props: UserData) => (
                            <div className="flex items-center gap-1.5 px-4 ">

                                <img
                                src={props.imageUrl || "assets/images/david.webp"}
                                alt="user"
                                className="rounded-full size-8 aspect-square"
                                referrerPolicy="no-referrer"
                                />
                                <span>{props.name}</span>
                            </div>
                        )}
                    />
                    <ColumnDirective
                        field="email"
                        headerText="Email"
                        width="200"
                        textAlign="Left"

                    />
                    <ColumnDirective
                        field="joinedAt"
                        headerText="Date Joined"
                        width="140"
                        textAlign="Left"
                        template={({joinedAt}: {joinedAt: string}) => formatDate(joinedAt)}

                    />
                    <ColumnDirective
                        field="status"
                        headerText="Type"
                        width="100"
                        textAlign="Left"
                        template={({status}: UserData) => (
                            <article className={cn("status-column", status === "user" ? "bg-success-50" : "bg-light-300")}>
                                <div className={cn("size-1.5 rounded-full", status === "user" ? "bg-success-500" : "bg-gray-500")} />
                                    <h3 className={cn("font-inter text-xs font-medium", status === "user" ? "text-success-500" : "text-gray-500")}>{status}</h3>

                            </article>
                        )}

                    />
                </ColumnsDirective>
            </GridComponent>
        </main>
    )
}
