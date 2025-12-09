import React from 'react'
import { cn } from "~/lib/utils";
import {Link, useLocation} from "react-router";
import {ButtonComponent} from "@syncfusion/ej2-react-buttons";

interface Props {
    title: string;
    description: string;
    ctaText?: string;
    ctaUrl?: string;
}

/**
 * Header-Komponente: Zeigt den Seitentitel, die Beschreibung und optional einen
 * Call-to-Action-Button an. Passt die Schriftgröße basierend auf dem aktuellen Pfad an.
 */
const Header = ({title, description, ctaText, ctaUrl}: Props) => {
    // Ruft den aktuellen Pfad ab, um die Größe der Überschrift anzupassen
    const location = useLocation();

    return (
        <header className="header">
            <article>
                <h1 className={cn("text-dark-100", location.pathname === "/" ? "text-2xl md:text-4xl font-bold" : "text-xl md:text-2xl font-semibold"

                    )}>{title}</h1>
                <p className={cn("text-grey-100 font-normal", location.pathname === "/" ? "text-base md:text-lg" : "text-sm md:text-lg"

                )}>{description}</p>
            </article>
            { ctaText && ctaUrl && (
                <Link to={ctaUrl}>
                    <ButtonComponent type="button" className="button-class !h-11 !w-full md:w-[240px]">
                        <img src="/assets/icons/plus.svg" alt="plus" className="size-5" />
                        <span className="p-16-semibold text-white">{ctaText}</span>


                    </ButtonComponent>
                </Link>
            )}
        </header>
    )
}

export default Header
