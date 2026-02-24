"use client";

export default function Schema({ data }: { data: any }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Hotel",
        "name": "Parkside Villa Kitui",
        "description": "Discover an oasis of tranquility in the heart of Kitui, Kenya. Luxury rooms, fine dining, and world-class conference facilities.",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Parkside Villa",
            "addressLocality": "Kitui",
            "addressRegion": "Kitui County",
            "addressCountry": "Kenya"
        },
        "telephone": data.contactInfo.phone,
        "email": data.contactInfo.email,
        "url": "https://parksidevillakitui.com",
        "image": data.heroImages[0],
        "starRating": {
            "@type": "Rating",
            "ratingValue": "4"
        },
        "hasMenu": "https://parksidevillakitui.com/dining",
        "amenityFeature": [
            { "@type": "LocationFeatureSpecification", "name": "Free WiFi", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Infinity Pool", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "VIP Lounge", "value": true }
        ],
        "containsPlace": data.rooms.map((room: any) => ({
            "@type": "HotelRoom",
            "name": room.name,
            "description": room.desc,
            "occupancy": {
                "@type": "QuantitativeValue",
                "maxValue": 2
            }
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
