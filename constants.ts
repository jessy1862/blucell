
import { Product, RepairJob, User, Order, ChatSession, LandingPageConfig, ContactInfo, TeamMember } from './types';

// Initialize with empty real-time states
export const MOCK_USER: User | null = null;

export const MOCK_PRODUCTS: Product[] = [];

export const MOCK_REPAIRS: RepairJob[] = [];

export const MOCK_ORDERS: Order[] = [];

export const MOCK_ALL_USERS: User[] = [];

export const MOCK_ALL_ORDERS: Order[] = [];

export const MOCK_CHAT_SESSIONS: ChatSession[] = [];

export const SEED_PRODUCTS: Product[] = [
    // --- PHONE (6) ---
    {
        id: 'p-phone-1',
        name: 'iPhone 15 Pro Max',
        price: 1199,
        category: 'Phone',
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800',
        rating: 4.9,
        reviews: 128,
        description: 'Titanium design, A17 Pro chip, and the most powerful iPhone camera system ever.',
        specs: { "Screen": "6.7 inch Super Retina XDR", "Chip": "A17 Pro", "Storage": "256GB" },
        status: 'IN_STOCK',
        isBestSeller: true
    },
    {
        id: 'p-phone-2',
        name: 'Samsung Galaxy S24 Ultra',
        price: 1299,
        category: 'Phone',
        image: 'https://images.unsplash.com/photo-1610945265078-d86f3d29299a?auto=format&fit=crop&q=80&w=800',
        rating: 4.8,
        reviews: 92,
        description: 'Galaxy AI is here. Epic titanium design and the Note signature S Pen.',
        specs: { "Screen": "6.8 inch QHD+", "Camera": "200MP", "Battery": "5000mAh" },
        status: 'IN_STOCK',
        isBestSeller: true
    },
    {
        id: 'p-phone-3',
        name: 'Google Pixel 8 Pro',
        price: 999,
        category: 'Phone',
        image: 'https://images.unsplash.com/photo-1598327773297-9c6795b4366d?auto=format&fit=crop&q=80&w=800',
        rating: 4.7,
        reviews: 85,
        description: 'The most advanced Pixel cameras and Google AI help you do more, even faster.',
        specs: { "Screen": "6.7 inch LTPO", "Chip": "Tensor G3", "Camera": "50MP Main" },
        status: 'IN_STOCK',
        isBestSeller: false
    },
    {
        id: 'p-phone-4',
        name: 'OnePlus 12',
        price: 799,
        category: 'Phone',
        image: 'https://images.unsplash.com/photo-1660357283431-7b025348398b?auto=format&fit=crop&q=80&w=800',
        rating: 4.6,
        reviews: 45,
        description: 'Smooth beyond belief. Powered by the Snapdragon 8 Gen 3 and Trinity Engine.',
        specs: { "Charging": "80W SuperVOOC", "Screen": "120Hz ProXDR", "Ram": "16GB" },
        status: 'IN_STOCK',
        isBestSeller: false
    },
    {
        id: 'p-phone-5',
        name: 'Nothing Phone (2)',
        price: 599,
        category: 'Phone',
        image: 'https://images.unsplash.com/photo-1689885885175-027588b39401?auto=format&fit=crop&q=80&w=800',
        rating: 4.5,
        reviews: 30,
        description: 'New Glyph Interface. 50 MP dual rear camera. Nothing OS 2.0.',
        specs: { "Interface": "Glyph", "Screen": "6.7 OLED", "Chip": "Snapdragon 8+ Gen 1" },
        status: 'IN_STOCK',
        isBestSeller: false
    },
    {
        id: 'p-phone-6',
        name: 'Sony Xperia 1 V',
        price: 1399,
        category: 'Phone',
        image: 'https://images.unsplash.com/photo-1595941069915-4ebc5d27aa5e?auto=format&fit=crop&q=80&w=800',
        rating: 4.8,
        reviews: 20,
        description: 'Next-gen sensor. Next-gen imaging. Created for creators.',
        specs: { "Display": "4K HDR OLED", "Audio": "3.5mm Jack", "Aspect": "21:9" },
        status: 'OUT_OF_STOCK',
        isBestSeller: false
    },

    // --- LAPTOP (6) ---
    {
        id: 'p-laptop-1',
        name: 'MacBook Pro 14"',
        price: 1599,
        category: 'Laptop',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=800',
        rating: 4.9,
        reviews: 89,
        description: 'M3 Pro chip. The most advanced chips ever built for a personal computer.',
        specs: { "Chip": "M3 Pro", "Ram": "18GB", "SSD": "512GB" },
        status: 'IN_STOCK',
        isBestSeller: true
    },
    {
        id: 'p-laptop-2',
        name: 'Dell XPS 15',
        price: 1899,
        category: 'Laptop',
        image: 'https://images.unsplash.com/photo-1593642632823-8f78536788c6?auto=format&fit=crop&q=80&w=800',
        rating: 4.5,
        reviews: 76,
        description: 'Immersive display and powerful performance for creators.',
        specs: { "Processor": "Intel Core i9", "GPU": "RTX 4060", "Display": "OLED 3.5K" },
        status: 'IN_STOCK',
        isBestSeller: false
    },
    {
        id: 'p-laptop-3',
        name: 'Razer Blade 16',
        price: 2999,
        category: 'Laptop',
        image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=800',
        rating: 4.7,
        reviews: 34,
        description: 'The world’s first dual-mode mini-LED display laptop.',
        specs: { "GPU": "RTX 4090", "Screen": "UHD+ 120Hz / FHD+ 240Hz", "CPU": "i9-13950HX" },
        status: 'IN_STOCK',
        isBestSeller: false
    },
    {
        id: 'p-laptop-4',
        name: 'Lenovo ThinkPad X1 Carbon',
        price: 1799,
        category: 'Laptop',
        image: 'https://images.unsplash.com/photo-1588872657578-137a685ee7fc?auto=format&fit=crop&q=80&w=800',
        rating: 4.8,
        reviews: 150,
        description: 'Ultralight weight. Heavyweight performance. The ultimate business tool.',
        specs: { "Weight": "1.12kg", "Build": "Carbon Fiber", "Battery": "15 Hours" },
        status: 'IN_STOCK',
        isBestSeller: false
    },
    {
        id: 'p-laptop-5',
        name: 'Asus ROG Zephyrus G14',
        price: 1499,
        category: 'Laptop',
        image: 'https://images.unsplash.com/photo-1636211993589-6226c367468e?auto=format&fit=crop&q=80&w=800',
        rating: 4.9,
        reviews: 210,
        description: 'The world\'s most powerful 14-inch gaming laptop.',
        specs: { "Screen": "Nebula HDR", "GPU": "RTX 4070", "Anime Matrix": "Yes" },
        status: 'IN_STOCK',
        isBestSeller: true
    },
    {
        id: 'p-laptop-6',
        name: 'Microsoft Surface Laptop Studio 2',
        price: 1999,
        category: 'Laptop',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800',
        rating: 4.6,
        reviews: 45,
        description: 'Versatility to create and power to perform. The most powerful Surface yet.',
        specs: { "Mode": "Laptop, Stage, Studio", "Touch": "PixelSense", "Pen": "Supported" },
        status: 'IN_STOCK',
        isBestSeller: false
    },

    // --- AUDIO (6) ---
    {
        id: 'p-audio-1',
        name: 'Sony WH-1000XM5',
        price: 348,
        category: 'Audio',
        image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800',
        rating: 4.7,
        reviews: 342,
        description: 'Industry-leading noise canceling headphones with exceptional sound quality.',
        specs: { "Battery": "30 hours", "Noise Canceling": "Active", "Drivers": "30mm" },
        status: 'IN_STOCK',
        isBestSeller: true
    },
    {
        id: 'p-audio-2',
        name: 'Bose QuietComfort Ultra',
        price: 429,
        category: 'Audio',
        image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800',
        rating: 4.6,
        reviews: 112,
        description: 'World-class noise cancellation, quieter than ever before.',
        specs: { "Battery": "24 hours", "Audio": "Immersive Audio", "Connectivity": "Bluetooth 5.3" },
        status: 'IN_STOCK',
        isBestSeller: false
    },
    {
        id: 'p-audio-3',
        name: 'Apple AirPods Max',
        price: 549,
        category: 'Audio',
        image: 'https://images.unsplash.com/photo-1628202926206-c63a34b1618f?auto=format&fit=crop&q=80&w=800',
        rating: 4.8,
        reviews: 520,
        description: 'A perfect balance of exhilarating high-fidelity audio and the effortless magic of AirPods.',
        specs: { "Material": "Stainless Steel", "Audio": "Spatial", "ANC": "Industry Leading" },
        status: 'IN_STOCK',
        isBestSeller: true
    },
    {
        id: 'p-audio-4',
        name: 'Sennheiser Momentum 4',
        price: 299,
        category: 'Audio',
        image: 'https://images.unsplash.com/photo-1585298723682-7115561c51b7?auto=format&fit=crop&q=80&w=800',
        rating: 4.5,
        reviews: 88,
        description: 'Signature Sennheiser sound with a battery that lasts 60 hours.',
        specs: { "Battery": "60 Hours", "Sound": "Signature", "Design": "Fold flat" },
        status: 'IN_STOCK',
        isBestSeller: false
    },
    {
        id: 'p-audio-5',
        name: 'Sonos Era 300',
        price: 449,
        category: 'Audio',
        image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=800',
        rating: 4.8,
        reviews: 65,
        description: 'With next-level audio that hits from every direction, Era 300 doesn’t just surround you, it puts you inside your music.',
        specs: { "Audio": "Dolby Atmos", "Connectivity": "WiFi & Bluetooth", "Voice": "Alexa Built-in" },
        status: 'IN_STOCK',
        isBestSeller: false
    },
    {
        id: 'p-audio-6',
        name: 'JBL Flip 6',
        price: 129,
        category: 'Audio',
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=800',
        rating: 4.7,
        reviews: 1200,
        description: 'Bold sound for every adventure. Waterproof and dustproof.',
        specs: { "Waterproof": "IP67", "Playtime": "12 Hours", "Feature": "PartyBoost" },
        status: 'IN_STOCK',
        isBestSeller: true
    },

    // --- CAMERA (6) ---
    {
        id: 'p-camera-1',
        name: 'Canon EOS R6 Mark II',
        price: 2499,
        category: 'Camera',
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800',
        rating: 4.8,
        reviews: 56,
        description: 'Versatile full-frame mirrorless camera for photographers and videographers.',
        specs: { "Sensor": "24.2MP Full-Frame", "Video": "4K 60p", "Stabilization": "In-body" },
        status: 'IN_STOCK',
        isBestSeller: false
    },
    {
        id: 'p-camera-2',
        name: 'GoPro Hero 12 Black',
        price: 399,
        category: 'Camera',
        image: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&q=80&w=800',
        rating: 4.6,
        reviews: 210,
        description: 'Unbelievable image quality, even better HyperSmooth video stabilization.',
        specs: { "Video": "5.3K 60fps", "Waterproof": "33ft", "Stabilization": "HyperSmooth 6.0" },
        status: 'IN_STOCK',
        isBestSeller: true
    },
    {
        id: 'p-camera-3',
        name: 'Fujifilm X-T5',
        price: 1699,
        category: 'Camera',
        image: 'https://images.unsplash.com/photo-1500634245200-e5245c7574ef?auto=format&fit=crop&q=80&w=800',
        rating: 4.9,
        reviews: 110,
        description: 'Photography first. 40MP APS-C X-Trans CMOS 5 HR BSI Sensor.',
        specs: { "Sensor": "40MP APS-C", "Dials": "Classic", "Screen": "3-way Tilt" },
        status: 'IN_STOCK',
        isBestSeller: true
    },
    {
        id: 'p-camera-4',
        name: 'Sony Alpha a7 IV',
        price: 2498,
        category: 'Camera',
        image: 'https://images.unsplash.com/photo-1624100523171-464296b010d8?auto=format&fit=crop&q=80&w=800',
        rating: 4.8,
        reviews: 300,
        description: 'Basic has never been this good. The new baseline for full-frame excellence.',
        specs: { "Sensor": "33MP Full-Frame", "Focus": "Real-time Eye AF", "Video": "4K 60p 10-bit" },
        status: 'IN_STOCK',
        isBestSeller: true
    },
    {
        id: 'p-camera-5',
        name: 'Nikon Z8',
        price: 3996,
        category: 'Camera',
        image: 'https://images.unsplash.com/photo-1564466021188-1e1b8a3417e1?auto=format&fit=crop&q=80&w=800',
        rating: 4.9,
        reviews: 45,
        description: 'A true hybrid powerhouse. 45.7MP stacked sensor in a compact body.',
        specs: { "Sensor": "45.7MP Stacked", "Video": "8K 60p", "Burst": "120 fps" },
        status: 'OUT_OF_STOCK',
        isBestSeller: false
    },
    {
        id: 'p-camera-6',
        name: 'Insta360 X3',
        price: 449,
        category: 'Camera',
        image: 'https://images.unsplash.com/photo-1654157925394-4b7809721149?auto=format&fit=crop&q=80&w=800',
        rating: 4.7,
        reviews: 180,
        description: 'The ultimate 360 action camera. Magic in action.',
        specs: { "Resolution": "5.7K 360", "Waterproof": "10m", "Screen": "2.29 inch Touch" },
        status: 'IN_STOCK',
        isBestSeller: false
    },

    // --- GAMING (6) ---
    {
        id: 'p-gaming-1',
        name: 'PlayStation 5 Slim',
        price: 499,
        category: 'Gaming',
        image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=800',
        rating: 4.9,
        reviews: 1250,
        description: 'Experience lightning-fast loading with an ultra-high speed SSD.',
        specs: { "Storage": "1TB SSD", "Output": "4K 120Hz", "Drive": "Disc Edition" },
        status: 'IN_STOCK',
        isBestSeller: true
    },
    {
        id: 'p-gaming-2',
        name: 'Nintendo Switch OLED',
        price: 349,
        category: 'Gaming',
        image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&q=80&w=800',
        rating: 4.8,
        reviews: 3400,
        description: 'Features a vibrant 7-inch OLED screen and enhanced audio.',
        specs: { "Screen": "7-inch OLED", "Storage": "64GB", "Modes": "TV, Tabletop, Handheld" },
        status: 'IN_STOCK',
        isBestSeller: true
    },
    {
        id: 'p-gaming-3',
        name: 'Xbox Series X',
        price: 499,
        category: 'Gaming',
        image: 'https://images.unsplash.com/photo-1621259182902-885f1d2945c5?auto=format&fit=crop&q=80&w=800',
        rating: 4.8,
        reviews: 950,
        description: 'The fastest, most powerful Xbox ever.',
        specs: { "Performance": "12 TFLOPS", "Res": "True 4K Gaming", "FPS": "Up to 120 FPS" },
        status: 'IN_STOCK',
        isBestSeller: false
    },
    {
        id: 'p-gaming-4',
        name: 'Steam Deck OLED',
        price: 549,
        category: 'Gaming',
        image: 'https://images.unsplash.com/photo-1698651859664-9cb6e1b65377?auto=format&fit=crop&q=80&w=800',
        rating: 4.9,
        reviews: 420,
        description: 'The ultimate handheld gaming PC, now with an OLED screen.',
        specs: { "Screen": "7.4 inch OLED 90Hz", "Battery": "50Whr", "Storage": "512GB" },
        status: 'IN_STOCK',
        isBestSeller: true
    },
    {
        id: 'p-gaming-5',
        name: 'Meta Quest 3',
        price: 499,
        category: 'Gaming',
        image: 'https://images.unsplash.com/photo-1622979135225-d2ba269fb1bd?auto=format&fit=crop&q=80&w=800',
        rating: 4.7,
        reviews: 150,
        description: 'The most powerful Meta Quest yet. Mixed reality, breakthrough performance.',
        specs: { "Resolution": "2064x2208 per eye", "Pass-through": "Full Color", "Processor": "Snapdragon XR2 Gen 2" },
        status: 'IN_STOCK',
        isBestSeller: false
    },
    {
        id: 'p-gaming-6',
        name: 'ASUS ROG Ally',
        price: 699,
        category: 'Gaming',
        image: 'https://images.unsplash.com/photo-1531297461136-82lw8c2d2948?auto=format&fit=crop&q=80&w=800',
        rating: 4.5,
        reviews: 110,
        description: 'Play all your games. Handheld Windows gaming console.',
        specs: { "Chip": "AMD Z1 Extreme", "Screen": "1080p 120Hz", "OS": "Windows 11" },
        status: 'IN_STOCK',
        isBestSeller: false
    },

    // --- DRONE (6) ---
    {
        id: 'p-drone-1',
        name: 'DJI Mavic 3 Pro',
        price: 2199,
        category: 'Drone',
        image: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&q=80&w=800',
        rating: 4.8,
        reviews: 45,
        description: 'Triple-camera system with Hasselblad main camera for professional aerial photography.',
        specs: { "Flight Time": "43 mins", "Range": "15km", "Video": "5.1K ProRes" },
        status: 'IN_STOCK',
        isBestSeller: true
    },
    {
        id: 'p-drone-2',
        name: 'DJI Mini 4 Pro',
        price: 759,
        category: 'Drone',
        image: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&q=80&w=800',
        rating: 4.9,
        reviews: 150,
        description: 'Mini to the max. 4K/60fps HDR True Vertical Shooting.',
        specs: { "Weight": "<249g", "Sensing": "Omnidirectional", "Transmission": "20km" },
        status: 'IN_STOCK',
        isBestSeller: true
    },
    {
        id: 'p-drone-3',
        name: 'DJI Air 3',
        price: 1099,
        category: 'Drone',
        image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80&w=800',
        rating: 4.7,
        reviews: 60,
        description: 'Double Up. Dual-camera system with medium tele and wide-angle cameras.',
        specs: { "Flight Time": "46 mins", "Cameras": "Dual 48MP", "Obstacle Sensing": "Omnidirectional" },
        status: 'IN_STOCK',
        isBestSeller: false
    },
    {
        id: 'p-drone-4',
        name: 'Autel Evo Lite+',
        price: 1399,
        category: 'Drone',
        image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&q=80&w=800',
        rating: 4.5,
        reviews: 30,
        description: 'Cinematic 6K video with a 1-inch sensor and adjustable aperture.',
        specs: { "Video": "6K/30fps", "Sensor": "1-inch CMOS", "Flight Time": "40 mins" },
        status: 'IN_STOCK',
        isBestSeller: false
    },
    {
        id: 'p-drone-5',
        name: 'DJI Avata 2',
        price: 999,
        category: 'Drone',
        image: 'https://images.unsplash.com/photo-1506947411487-a56738267384?auto=format&fit=crop&q=80&w=800',
        rating: 4.8,
        reviews: 80,
        description: 'Immersive Flight Experience. Intuitive Motion Control. Tight Shots in 4K.',
        specs: { "Type": "FPV", "Video": "4K/60fps", "Safety": "Propeller Guard" },
        status: 'IN_STOCK',
        isBestSeller: true
    },
    {
        id: 'p-drone-6',
        name: 'Holy Stone HS720G',
        price: 299,
        category: 'Drone',
        image: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&q=80&w=800',
        rating: 4.3,
        reviews: 400,
        description: 'Great starter drone with 2-axis gimbal and 4K EIS Camera.',
        specs: { "Camera": "4K EIS", "Gimbal": "2-Axis", "Flight Time": "26 mins" },
        status: 'IN_STOCK',
        isBestSeller: false
    },

    // --- OTHERS (6) ---
    {
        id: 'p-others-1',
        name: 'Apple Watch Ultra 2',
        price: 799,
        category: 'Others',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
        rating: 4.9,
        reviews: 200,
        description: 'The most rugged and capable Apple Watch. Designed for outdoor adventure.',
        specs: { "Case": "49mm Titanium", "Battery": "36 Hours", "Water": "100m" },
        status: 'IN_STOCK',
        isBestSeller: true
    },
    {
        id: 'p-others-2',
        name: 'Samsung Galaxy Watch 6',
        price: 299,
        category: 'Others',
        image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800',
        rating: 4.6,
        reviews: 150,
        description: 'Start your everyday wellness journey. Larger screen, thinner bezel.',
        specs: { "Health": "BIA Sensor", "Sleep": "Coaching", "Bezel": "Rotating (Classic)" },
        status: 'IN_STOCK',
        isBestSeller: false
    },
    {
        id: 'p-others-3',
        name: 'iPad Pro 12.9"',
        price: 1099,
        category: 'Others',
        image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800',
        rating: 4.9,
        reviews: 300,
        description: 'The ultimate iPad experience with the M2 chip.',
        specs: { "Chip": "M2", "Screen": "Liquid Retina XDR", "Connectivity": "5G" },
        status: 'IN_STOCK',
        isBestSeller: true
    },
    {
        id: 'p-others-4',
        name: 'Kindle Paperwhite',
        price: 189,
        category: 'Others',
        image: 'https://images.unsplash.com/photo-1592496001020-d31bd164a919?auto=format&fit=crop&q=80&w=800',
        rating: 4.8,
        reviews: 2500,
        description: 'Wireless charging, auto-adjusting front light, and 32 GB storage.',
        specs: { "Screen": "6.8 inch 300ppi", "Waterproof": "IPX8", "Battery": "10 Weeks" },
        status: 'IN_STOCK',
        isBestSeller: true
    },
    {
        id: 'p-others-5',
        name: 'Dyson Zone Headphones',
        price: 699,
        category: 'Others',
        image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&q=80&w=800',
        rating: 4.2,
        reviews: 20,
        description: 'High-fidelity audio with advanced noise cancellation and air purification.',
        specs: { "Filter": "Removes 99% particles", "ANC": "Advanced", "Audio": "Low distortion" },
        status: 'IN_STOCK',
        isBestSeller: false
    },
    {
        id: 'p-others-6',
        name: 'Philips Hue Starter Kit',
        price: 199,
        category: 'Others',
        image: 'https://images.unsplash.com/photo-1558002038-1091a16600a3?auto=format&fit=crop&q=80&w=800',
        rating: 4.7,
        reviews: 1000,
        description: 'White and Color Ambiance. Control your lights your way.',
        specs: { "Bulbs": "4 x A19", "Hub": "Included", "Voice": "Alexa, Google, Apple" },
        status: 'IN_STOCK',
        isBestSeller: false
    }
];

export const DEFAULT_LANDING_CONFIG: LandingPageConfig = {
  hero: {
    titlePrefix: 'Future of',
    titleHighlight: 'Tech',
    titleSuffix: 'Repair & Retail.',
    subtitle: 'BLUCELL is the premier ecosystem for buying premium gadgets and booking expert repairs instantly.',
    ctaPrimary: 'Shop Gadgets',
    ctaSecondary: 'Fix My Device',
    images: [
        'https://images.unsplash.com/photo-1581092921461-eab62e97a782?auto=format&fit=crop&q=80&w=1200', // Tech Repair/Soldering
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200', // Retro Tech/Gaming
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1200', // Team working on tech
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=1200', // Laptop
        'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=1200'  // Person using MacBook
    ]
  },
  features: [
    { title: "Certified Fixers", description: "Every technician is vetted and expert-level." },
    { title: "Fast Logistics", description: "Same-day pickup and delivery for repairs." },
    { title: "Genuine Parts", description: "We use only OEM or high-grade components." },
    { title: "90-Day Warranty", description: "Peace of mind on all services provided." }
  ],
  trending: {
    sectionTitle: "Trending Gear",
    sectionSubtitle: "Explore the latest tech hitting our shelves this week.",
    items: [
      {
        title: "Aerial Photography",
        description: "Capture the world from above with 4K drones.",
        image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80&w=800",
        badge: "HOT"
      },
      {
        title: "High-Fidelity Audio",
        description: "",
        image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800"
      },
      {
        title: "Wearables",
        description: "",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600"
      },
      {
        title: "Pro Cameras",
        description: "",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600"
      }
    ]
  },
  ctaBottom: {
    title: "Ready to Upgrade?",
    description: "Join thousands of users who trust BLUCELL for their tech needs. Shop the latest tech or restore your current device to glory.",
    buttonText: "Get Started Now"
  }
};

export const DEFAULT_CONTACT_INFO: ContactInfo = {
  phone: '+1 (555) 123-4567',
  email: 'support@blucell.com',
  address: '123 Tech Boulevard, San Francisco, CA 94107'
};

export const DEFAULT_TEAM: TeamMember[] = [
    { id: 't-1', name: 'Sarah Connor', role: 'CEO & Founder', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256' },
    { id: 't-2', name: 'Mike Ross', role: 'Head Technician', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256' },
    { id: 't-3', name: 'Emily Chen', role: 'Product Design', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=256' },
    { id: 't-4', name: 'David Kim', role: 'Operations', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256' },
];
