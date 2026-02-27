export const heroImages = [
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=2080",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=2070",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=2070"
];

export const rooms = [
    {
        id: "executive-suites",
        name: "Executive Suites",
        desc: "Spacious living area, king-sized bed, and premium amenities for the discerning traveler.",
        price: "$150",
        image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=2024",
        tag: "Best Seller",
        capacity: 2
    },
    {
        id: "deluxe-suites",
        name: "Deluxe Suites",
        desc: "Peaceful views focused on comfort and elegance with modern amenities.",
        price: "$120",
        image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=2074",
        capacity: 2
    },
    {
        id: "highrise-suites",
        name: "Highrise Suites",
        desc: "Panoramic views of the surroundings with elevated luxury and elegant design.",
        price: "$100",
        image: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&q=80&w=2074",
        capacity: 4
    },
    {
        id: "cottages",
        name: "Cottages",
        desc: "Feature backyard balconies, high-speed Wi-Fi, television, and hot showers. Designed for extra privacy and groups.",
        price: "$200",
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=2070",
        tag: "Private",
        capacity: 4
    }
];

export const facilities = [
    {
        id: "conference",
        title: "Conference Halls",
        desc: "Modern M.I.C.E facilities with high-speed internet. Amboseli, Nzambani, Syokimau, Highrise, and Masai Mara halls.",
        icon: "Users",
        image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=2069",
        features: [
            "Amboseli & Nzambani Halls",
            "Syokimau & Highrise Halls",
            "Masai Mara Hall"
        ],
        highlights: [
            "Theatre, U-shape & Classroom setups",
            "Corporate meetings & Team building",
            "Curated environment for groups",
            "High-speed connectivity and support",
            "Weddings & private parties"
        ]
    },
    {
        id: "dining",
        title: "Dining & Bars",
        desc: "A culinary journey featuring the Main Restaurant, VIP Lounge, and Open Bar & Restaurant.",
        icon: "Utensils",
        image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=2070",
        features: [
            "Main Restaurant",
            "VIP Lounge",
            "Open Bar & Restaurant"
        ],
        highlights: [
            "International and local Kamba cuisine",
            "Over 50 wine selections & single malts",
            "Traditional English afternoon teas",
            "Signature indoor barbeque",
            "24-hour room service"
        ]
    },
    {
        id: "pool",
        title: "Swimming Pool & Gardens",
        desc: "Relax in our central swimming pool or unwind in the lush gardens and kids zone.",
        icon: "Waves",
        image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=2070",
        features: [
            "Swimming Pool",
            "Kids Zone",
            "Lush Gardens"
        ],
        highlights: [
            "Dedicated children's activities area",
            "Extensive relaxation gardens",
            "Poolside service and bar",
            "Ample and secure parking space",
            "Pool Tables for recreation"
        ]
    }
];

export const testimonials = [
    {
        id: 1,
        name: "David Musyoka",
        title: "Business Traveler",
        text: "The Executive Suite was beyond my expectations. The blend of modern comfort with the serene Kitui atmosphere made my business trip feel like a vacation."
    },
    {
        id: 2,
        name: "Sarah Wanjiku",
        title: "Event Coordinator",
        text: "Best conference facilities in the region. The staff were professional, and the food was absolutely divine. Highly recommend for corporate events."
    },
    {
        id: 3,
        name: "James Omondi",
        title: "Holiday Maker",
        text: "An oasis of tranquility! The infinity pool and the VIP lounge are must-visits. Parkside Villa is truly the pride of Kitui."
    }
];

export const menuCategories = [
    {
        id: "starters",
        name: "Starters",
        items: [
            { name: "Villa House Salad", desc: "Fresh organic greens, cherry tomatoes, cucumbers, and avocado with lemon vinaigrette.", price: "$12" },
            { name: "Creamy Garden Soup", desc: "Seasonal vegetables blended with fresh cream and herbs, served with garlic bread.", price: "$10" },
            { name: "Crispy Calamari", desc: "Lightly battered calamari rings with spicy aioli and fresh lime.", price: "$15" }
        ]
    },
    {
        id: "mains",
        name: "Main Course",
        items: [
            { name: "Pan-Seared Tilapia", desc: "Local tilapia fillet with coconut ginger sauce, steamed rice, and sautéed greens.", price: "$25" },
            { name: "Grilled Beef Tenderloin", desc: "Prime Kenyan beef served with mashed potatoes, seasonal vegetables, and red wine jus.", price: "$32" },
            { name: "Vegetable Curry", desc: "Aromatic garden vegetables in a rich coconut curry sauce, served with basmati rice and naan.", price: "$20" }
        ]
    },
    {
        id: "desserts",
        name: "Dessert",
        items: [
            { name: "Warm Chocolate Brownie", desc: "Rich dark chocolate with vanilla bean ice cream and chocolate drizzle.", price: "$10" },
            { name: "Fresh Fruit Platter", desc: "Selection of seasonal tropical fruits from the local market.", price: "$8" },
            { name: "Cheesecake Excellence", desc: "Baked cheesecake with berry compote and white chocolate shavings.", price: "$12" }
        ]
    }
];

export const contactInfo = {
    phone: "+254 700 000000",
    email: "info@parksidevillakitui.com",
    whatsapp: "254700000000",
    address: "Parkside Villa, Kitui - Kenya",
    social: {
        facebook: "https://facebook.com/parksidevillakitui",
        instagram: "https://instagram.com/parksidevillakitui",
        linkedin: "https://linkedin.com/company/parksidevillakitui",
        tiktok: "https://tiktok.com/@parksidevillakitui",
        whatsapp: "https://wa.me/254701023026"
    }
};

export const blogPosts = [
    {
        id: "luxury-kitui-hospitality",
        title: "Exploring Luxury in the Heart of Kitui",
        excerpt: "Discover how Parkside Villa is redefining hospitality in the region with modern amenities and traditional charm.",
        date: "Feb 24, 2026",
        author: "Admin",
        category: "Hospitality",
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1000"
    },
    {
        id: "green-interior-design",
        title: "Green Interior Design Inspiration",
        excerpt: "Bringing the lush gardens of Kitui inside. How we use natural elements to create a serene guest experience.",
        date: "Feb 18, 2026",
        author: "Design Team",
        category: "Interior Design",
        image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=1000"
    }
];

export const galleryVideos = [
    {
        id: "villa-tour",
        title: "Parkside Villa Virtual Tour",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1000"
    }
];
