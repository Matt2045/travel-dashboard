# Dashboard Applikation

Diese Anwendung ist ein interaktives Dashboard, dessen zentraler Bestandteil die Generation von personalisierten Reiseplänen über GenAI ist. Nutzer können über ein Formular individuelle Reisen anlegen, die anschließend von **Gemini AI** automatisch mit Metadaten, Textbeschreibungen und strukturierten Reiseplänen angereichert werden.
Zur visuellen Ergänzung nutzt die Anwendung die **Unsplash API**, um passende Bilder dynamisch zu den Reisen zu laden.

Die App bietet vollständige **Authentifizierung** mit E-Mail/Passwort sowie **Google OAuth2**, ergänzt durch einen **Gastzugang**, mit dem die Funktionalität ohne Registrierung getestet werden kann. Alle Nutzerdaten, Reisen und generierten Inhalte werden in **Appwrite** verwaltet.
Das Dashboard zeigt zusätzlich eine Übersicht der registrierten Nutzer sowie verschiedene Statistiken zur Nutzung der Plattform.

Für **Fehler- und Performance-Monitoring** kommt **Sentry** zum Einsatz, inklusive Session-Replays (Screenshots & Videoaufzeichnungen), um Fehler effizient analysieren zu können.

Die Anwendung läuft vollständig produktionsreif auf meinem eigenen VPS. Das Deployment erfolgt als Docker-Container, der über Docker Compose orchestriert wird.
Das Projekt ist unter einer Subdomain meiner persönlichen Website öffentlich erreichbar.

## Core Framework

  - **React 19**
  - **React DOM 19**

## Routing / Server Renderning

  - **react-router v7**
  - **react-router/node**

## Deployment / Hosting

   - **Docker Setup**

## UI / Styling

   - **Tailwind CSS 4**

## UI-Komponenten

   - **Syncfusion React Komponenten**

## KI / GenAI

   - **Google generative AI - Google Gemini API**

## Backend / API / Auth

   - **Appwrite**
        Auth
        Datenbank
        Storage
        Collections

## Monitoring / Logging

   - **Sentry**
    - Fehlertracking
    - Performance Monitoring
    - Profiling

## Developer Tooling

   - **TypeScript 5.8**
   - **Vite 6**

## TL:DR
React 19 • React Router v7 (Full-Stack) • TypeScript • Vite 6 • Tailwind 4 • Appwrite Backend Syncfusion Komponenten • Masonry/Grid Layout • Sentry Monitoring Google Generative AI Integration • SSR • Docker-ready • Unsplash API Integration
