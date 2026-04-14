"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
    interface Window {
        google: any;
        googleTranslateElementInit: () => void;
    }
}

export default function GoogleTranslateScript() {
    const pathname = usePathname();

    useEffect(() => {
        // Re-initialize translate on route changes if necessary
        // When using layout.tsx, the script stays, but sometimes the DOM element is re-rendered.
        // We only clean up or re-init if the dropdown has vanished.
        const initTranslate = () => {
            if (typeof window !== "undefined" && window.google && window.google.translate) {
                const element = document.getElementById("google_translate_element");
                if (element && element.innerHTML === "") {
                    new window.google.translate.TranslateElement(
                        { pageLanguage: "en" },
                        "google_translate_element"
                    );
                }
                const adminElement = document.getElementById("google_translate_admin");
                if (adminElement && adminElement.innerHTML === "") {
                    new window.google.translate.TranslateElement(
                        { pageLanguage: "en" },
                        "google_translate_admin"
                    );
                }
            }
        };

        // Delay to ensure DOM is ready
        setTimeout(initTranslate, 300);
    }, [pathname]);

    return (
        <>
            <Script id="google-translate-script" strategy="afterInteractive">
                {`
                    function googleTranslateElementInit() {
                        if (document.getElementById('google_translate_element')) {
                            new google.translate.TranslateElement(
                                {pageLanguage: 'en'}, 
                                'google_translate_element'
                            );
                        }
                        if (document.getElementById('google_translate_admin')) {
                            new google.translate.TranslateElement(
                                {pageLanguage: 'en'}, 
                                'google_translate_admin'
                            );
                        }
                    }
                `}
            </Script>
            <Script
                src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
                strategy="afterInteractive"
            />
        </>
    );
}
