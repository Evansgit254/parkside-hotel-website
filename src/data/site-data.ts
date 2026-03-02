export const heroImages = [
    "https://res.cloudinary.com/dizwm3mic/image/upload/v1772373650/parkside-villa-media/EXTRA_PHOTOS/IMG_8543_xxgwxl.jpg",
    "https://res.cloudinary.com/dizwm3mic/image/upload/v1772373714/parkside-villa-media/EXTRA_PHOTOS/IMG_8555_u1zu5r.jpg",
    "https://res.cloudinary.com/dizwm3mic/image/upload/v1772373779/parkside-villa-media/EXTRA_PHOTOS/IMG_8564_o4vaky.jpg"
];

export const rooms = [
    {
        id: "executive-suites",
        name: "Executive Suites",
        desc: "Spacious living area, king-sized bed, and premium amenities for the discerning traveler.",
        price: "$150",
        image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772376033/parkside-villa-media/EXTRA_PHOTOS/resized_0I2A0030_wlh5hx.jpg",
        tag: "Best Seller",
        capacity: 2
    },
    {
        id: "deluxe-suites",
        name: "Deluxe Suites",
        desc: "Peaceful views focused on comfort and elegance with modern amenities.",
        price: "$120",
        image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772376080/parkside-villa-media/EXTRA_PHOTOS/resized_0I2A0050_xxgrnc.jpg",
        capacity: 2
    },
    {
        id: "highrise-suites",
        name: "Highrise Suites",
        desc: "Panoramic views of the surroundings with elevated luxury and elegant design.",
        price: "$100",
        image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772376103/parkside-villa-media/EXTRA_PHOTOS/resized_0I2A0054_otxvms.jpg",
        capacity: 4
    },
    {
        id: "cottages",
        name: "Cottages",
        desc: "Feature backyard balconies, high-speed Wi-Fi, television, and hot showers. Designed for extra privacy and groups.",
        price: "$200",
        image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772376067/parkside-villa-media/EXTRA_PHOTOS/resized_0I2A0041_yfxnuk.jpg",
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
        image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772373676/parkside-villa-media/EXTRA_PHOTOS/IMG_8551_mbm7db.jpg",
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
        image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772371880/parkside-villa-media/Dining_and_Restaurant/20220322_124810_n3g83g.jpg",
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
        image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772447162/parkside-villa-media/Swimming_Pool/IMG-20251119-WA0051_lwmtna.jpg",
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
        image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772373725/parkside-villa-media/EXTRA_PHOTOS/IMG_8556_ds9eib.jpg"
    },
    {
        id: "green-interior-design",
        title: "Green Interior Design Inspiration",
        excerpt: "Bringing the lush gardens of Kitui inside. How we use natural elements to create a serene guest experience.",
        date: "Feb 18, 2026",
        author: "Design Team",
        category: "Interior Design",
        image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772373754/parkside-villa-media/EXTRA_PHOTOS/IMG_8560_vlao4a.jpg"
    }
];

export const galleryVideos = [
    {
        id: "villa-tour",
        title: "Parkside Villa Virtual Tour",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772373733/parkside-villa-media/EXTRA_PHOTOS/IMG_8557_ntfhqq.jpg"
    }
];
