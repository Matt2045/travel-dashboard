import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { appwriteConfig, database } from "~/appwrite/client";
import { ID } from "appwrite";



/**
 * Die Action-Funktion verarbeitet die POST-Anfrage vom Client, generiert den Reiseplan
 * mit der Gemini API, sucht Bilder über Unsplash und speichert die Daten in Appwrite.
 *
 * Anmerkung: Die Funktion kann fehlschlagen, wenn das Gemini-2.5-flash-lite Modell kurzzeitig überlastet ist
 *
 * @param {ActionFunctionArgs} { request } Das Request-Objekt von React Router.
 * @returns {Promise<Response>} Eine Response, die die ID des neuen Appwrite-Dokuments enthält.
 */

export const action = async ({ request }: ActionFunctionArgs) => {
    const {
        country,
        numberOfDays,
        travelStyle,
        interests,
        budget,
        groupType,
        userId
    } = await request.json();

    // Validiere API-Keys
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const unsplashApiKey = process.env.UNSPLASH_ACCESS_KEY;

    if (!geminiApiKey) {
        console.error('GEMINI_API_KEY is missing');
        throw new Response('Server configuration error', { status: 500 });
    }

    try {
        // Initialisiere Gemini mit JSON-Response-Mode
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.8,
            }
        });

        // Konstruiere den Prompt
        const prompt = `Generate a ${numberOfDays}-day travel itinerary for ${country} based on:
Budget: ${budget}
Interests: ${interests}
Travel Style: ${travelStyle}
Group Type: ${groupType}

Return a JSON object with this exact structure. IMPORTANT: Add relevant emojis at the start of all activity descriptions to make them visually appealing:
{
  "name": "Trip title",
  "description": "Brief description (max 100 words)",
  "estimatedPrice": "$amount",
  "duration": ${numberOfDays},
  "budget": "${budget}",
  "travelStyle": "${travelStyle}",
  "country": "${country}",
  "interests": "${interests}",
  "groupType": "${groupType}",
  "bestTimeToVisit": [
    "🌸 Spring (March to May): reason",
    "☀️ Summer (June to August): reason",
    "🍁 Fall (September to November): reason",
    "❄️ Winter (December to February): reason"
  ],
  "weatherInfo": [
    "☀️ Spring: 10-20°C (50-68°F)",
    "🌦️ Summer: 20-30°C (68-86°F)",
    "🌧️ Fall: 10-20°C (50-68°F)",
    "❄️ Winter: 0-10°C (32-50°F)"
  ],
  "location": {
    "city": "Main city name",
    "coordinates": [latitude, longitude],
    "openStreetMap": "https://osm.org/link"
  },
  "itinerary": [
    {
      "day": 1,
      "location": "City Name",
      "activities": [
        {"time": "Morning", "description": "🏰 Activity description with relevant emoji"},
        {"time": "Afternoon", "description": "🍽️ Activity description with relevant emoji"},
        {"time": "Evening", "description": "🌆 Activity description with relevant emoji"}
      ]
    }
  ]
}

Use one contextually appropriate emojis for activities like:
- 🏰 🏛️ ⛪ for historic sites and monuments
- 🖼️ 🎨 🎭 for museums and art galleries
- 🍽️ 🍷 ☕ 🍕 for dining and food experiences
- 🏖️ 🏞️ 🌊 ⛰️ for nature and beaches
- 🛍️ 🏬 for shopping
- 🚶 🚴 🚠 for walking tours and transportation
- 🌆 🌃 🎆 for evening activities and nightlife
- 🎪 🎡 🎢 for entertainment venues
- 🏨 💤 for accommodation and rest`;

        console.log('Sending request to Gemini API...');

        const textResult = await model.generateContent([prompt]);

        console.log('Received response from Gemini API');

        // Parse die JSON-Antwort
        const rawText = textResult.response.text();
        let tripData;

        try {
            tripData = JSON.parse(rawText);
        } catch (parseError) {
            console.error('JSON parsing failed:', parseError);
            console.error('Raw response:', rawText);
            throw new Error('Invalid JSON response from AI');
        }

        // Validiere die Struktur
        if (!tripData || typeof tripData !== 'object' || !tripData.name || !tripData.itinerary) {
            console.error('Invalid trip data structure:', tripData);
            throw new Error('AI returned incomplete trip data');
        }

        console.log('Trip data validated successfully');

        // Hole Bilder von Unsplash
        let imageUrls: string[] = [];
        if (unsplashApiKey) {
            try {
                console.log('Fetching images from Unsplash...');
                const searchQuery = `${country} ${interests} ${travelStyle}`;
                console.log('Search query:', searchQuery);
                console.log('API Key present:', unsplashApiKey ? 'Yes (length: ' + unsplashApiKey.length + ')' : 'No');

                // Verwende https.get als Alternative zu fetch
                const https = await import('https');
                const url = new URL('https://api.unsplash.com/search/photos');
                url.searchParams.set('query', searchQuery);
                url.searchParams.set('per_page', '3');
                url.searchParams.set('client_id', unsplashApiKey);

                console.log('Request URL:', url.toString().replace(unsplashApiKey, 'API_KEY_HIDDEN'));

                const imageData = await new Promise<any>((resolve, reject) => {
                    const request = https.get(url.toString(), {
                        headers: {
                            'Accept': 'application/json',
                            'Accept-Version': 'v1'
                        },
                        timeout: 50000
                    }, (res) => {
                        let data = '';

                        res.on('data', (chunk) => {
                            data += chunk;
                        });

                        res.on('end', () => {
                            console.log('Unsplash response status:', res.statusCode);
                            if (res.statusCode === 200) {
                                try {
                                    resolve(JSON.parse(data));
                                } catch (e) {
                                    console.error('Failed to parse JSON:', e);
                                    reject(new Error('Failed to parse Unsplash response'));
                                }
                            } else {
                                console.error('Unsplash error response:', data);
                                reject(new Error(`Unsplash API returned status ${res.statusCode}`));
                            }
                        });
                    });

                    request.on('error', (error) => {
                        console.error('Request error:', error);
                        reject(error);
                    });

                    request.on('timeout', () => {
                        console.warn('Request timeout after 50s, aborting request');
                        request.destroy();
                        reject(new Error('Request timeout'));
                    });
                });

                console.log('Number of images found:', imageData.results?.length || 0);

                if (imageData.results && imageData.results.length > 0) {
                    imageUrls = imageData.results
                        .slice(0, 3)
                        .map((result: any) => result.urls?.regular)
                        .filter((url: string) => url);

                    console.log('Image URLs collected:', imageUrls.length, 'URLs');
                } else {
                    console.log('No images found for query');
                }
            } catch (imageError) {
                console.error('Failed to fetch images from Unsplash:', {
                    message: imageError instanceof Error ? imageError.message : 'Unknown error',
                    stack: imageError instanceof Error ? imageError.stack : undefined
                });
                // Fahre ohne Bilder fort - Trip wird trotzdem gespeichert
            }
        } else {
            console.warn('UNSPLASH_ACCESS_KEY is not configured');
        }

        // Speichere in Appwrite
        console.log('Saving trip to database...');
        const result = await database.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId,
            ID.unique(),
            {
                tripDetail: JSON.stringify(tripData),
                createdAt: new Date().toISOString(),
                imageUrls,
                userId,
            }
        );

        console.log('Trip saved successfully with ID:', result.$id);
        return data({ id: result.$id });

    } catch (error) {
        // Detailliertes Error-Logging
        console.error('Error generating trip:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            name: error instanceof Error ? error.name : 'Unknown',
            stack: error instanceof Error ? error.stack : undefined,
            cause: error instanceof Error ? (error as any).cause : undefined
        });

        // Benutzerfreundliche Fehlermeldung
        const errorMessage = error instanceof Error
            ? error.message
            : 'Failed to generate trip';

        throw new Response(
            JSON.stringify({
                error: errorMessage,
                details: 'Please check your API keys and try again'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}