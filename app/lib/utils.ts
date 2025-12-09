import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";

/**
 * Kombiniert `clsx` und `tailwind-merge`, um Tailwind CSS-Klassennamen bedingt zu verketten
 * und automatisch Duplikate sowie Konflikte (z.B. p-4 und p-6) zu bereinigen.
 *
 * @param {...ClassValue[]} inputs Eine Liste von Klassenwerten oder Arrays.
 * @returns {string} Der bereinigte und zusammengefasste String der CSS-Klassen.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Formatiert einen Datumsstring in das Format "Monat Tag, Jahr" (z.B. "November 11, 2025").
 * Verwendet die `dayjs`-Bibliothek für die Formatierung.
 *
 * @param {string} dateString Der Datumsstring, der formatiert werden soll.
 * @returns {string} Das formatierte Datum.
 */
export const formatDate = (dateString: string): string => {
    return dayjs(dateString).format("MMMM DD, YYYY");
};

/**
 * Extrahiert und parst einen JSON-Block, der in einem Markdown-Codeblock (` ```json...``` `) eingebettet ist.
 * Dies ist typischerweise notwendig, um strukturierte Antworten von einem Large Language Model (LLM) zu verarbeiten.
 *
 * @param {string} markdownText Der vollständige Text, der den JSON-Codeblock enthält.
 * @returns {unknown | null} Das geparste JSON-Objekt oder null bei Fehlern/wenn kein JSON gefunden wird.
 */
export function parseMarkdownToJson(markdownText: string): unknown | null {
    const regex = /```json\n([\s\S]+?)\n```/;
    const match = markdownText.match(regex);

    if (match && match[1]) {
        try {
            return JSON.parse(match[1]);
        } catch (error) {
            console.error("Error parsing JSON:", error);
            return null;
        }
    }
    console.error("No valid JSON found in markdown text.");
    return null;
}

/**
 * Parst einen reinen JSON-String, der die vollständigen Reisedaten (`Trip`) enthält.
 *
 * @param {string} jsonString Der JSON-String der Reisedaten.
 * @returns {Trip | null} Das geparste `Trip`-Objekt oder null bei Parsing-Fehlern.
 */
export function parseTripData(jsonString: string): Trip | null {
    try {


        const data: Trip = JSON.parse(jsonString);

        return data;
    } catch (error) {
        console.error("Failed to parse trip data:", error);
        return null;
    }
}

/**
 * Extrahiert das erste Wort aus einem gegebenen Eingabestring.
 * Nützlich für die Anzeige von verkürzten Namen oder Titeln.
 *
 * @param {string} [input=""] Der Eingabestring.
 * @returns {string} Das erste Wort des Strings oder ein leerer String.
 */
export function getFirstWord(input: string = ""): string {
    return input.trim().split(/\s+/)[0] || "";
}

/**
 * Berechnet die prozentuale Veränderung (Trend) zwischen zwei Zahlen (z.B. aktuellem und letztem Monat).
 *
 * @param {number} countOfThisMonth Die Zählung des aktuellen Monats.
 * @param {number} countOfLastMonth Die Zählung des letzten Monats.
 * @returns {TrendResult} Ein Objekt mit dem Trend ("increment", "decrement", "no change") und dem Prozentwert.
 */
export const calculateTrendPercentage = (
    countOfThisMonth: number,
    countOfLastMonth: number
): TrendResult => {
    if (countOfLastMonth === 0) {
        return countOfThisMonth === 0
            ? { trend: "no change", percentage: 0 }
            : { trend: "increment", percentage: 100 };
    }

    const change = countOfThisMonth - countOfLastMonth;
    const percentage = Math.abs((change / countOfLastMonth) * 100);

    if (change > 0) {
        return { trend: "increment", percentage };
    } else if (change < 0) {
        return { trend: "decrement", percentage };
    } else {
        return { trend: "no change", percentage: 0 };
    }
};

/**
 * Konvertiert einen CamelCase-Schlüssel (keyof TripFormData) in einen lesbaren Titel.
 * Beispiel: "travelStyle" wird zu "Travel Style".
 *
 * @param {keyof TripFormData} key Der CamelCase-Schlüssel.
 * @returns {string} Der formatierte Titel.
 */
export const formatKey = (key: keyof TripFormData) => {
    return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
};