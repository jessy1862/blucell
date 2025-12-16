
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
    {
        id: 'p-1',
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
        id: 'p-2',
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
        id: 'p-3',
        name: 'Sony WH-1000XM5',
        price: 348,
        category: 'Audio',
        image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800',
        rating: 4.7,
        reviews: 342,
        description: 'Industry-leading noise canceling headphones with exceptional sound quality.',
        specs: { "Battery": "30 hours", "Noise Canceling": "Active", "Drivers": "30mm" },
        status: 'IN_STOCK',
        isBestSeller: false
    },
    {
        id: 'p-4',
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
        id: 'p-5',
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
        id: 'p-6',
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
        id: 'p-7',
        name: 'Samsung Galaxy S24 Ultra',
        price: 1299,
        category: 'Phone',
        image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=800',
        rating: 4.8,
        reviews: 92,
        description: 'Galaxy AI is here. Epic titanium design and the Note signature S Pen.',
        specs: { "Screen": "6.8 inch QHD+", "Camera": "200MP", "Battery": "5000mAh" },
        status: 'IN_STOCK',
        isBestSeller: true
    },
    {
        id: 'p-8',
        name: 'GoPro Hero 12 Black',
        price: 399,
        category: 'Camera',
        image: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&q=80&w=800',
        rating: 4.6,
        reviews: 210,
        description: 'Unbelievable image quality, even better HyperSmooth video stabilization.',
        specs: { "Video": "5.3K 60fps", "Waterproof": "33ft", "Stabilization": "HyperSmooth 6.0" },
        status: 'IN_STOCK',
        isBestSeller: false
    },
    {
        id: 'p-9',
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
        id: 'p-10',
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
        id: 'p-11',
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
        id: 'p-12',
        name: 'DJI Mini 4 Pro',
        price: 759,
        category: 'Drone',
        image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80&w=800',
        rating: 4.9,
        reviews: 150,
        description: 'Mini to the max. 4K/60fps HDR True Vertical Shooting.',
        specs: { "Weight": "<249g", "Sensing": "Omnidirectional", "Transmission": "20km" },
        status: 'IN_STOCK',
        isBestSeller: true
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
        'https://images.unsplash.com/photo-1597872258083-ef52741e8696?auto=format&fit=crop&q=80&w=1000', // Phone Repair (Internal)
        'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&q=80&w=1000', // Repair Tools/Kit
        'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=1000', // Gaming
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=1000', // Phone
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=1000', // Laptop
        'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&q=80&w=1000'  // Drone
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
        image: "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&q=80&w=800",
        badge: "HOT"
      },
      {
        title: "High-Fidelity Audio",
        description: "",
        image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800"
      },
      {
        title: "Wearables",
        description: "",
        image: "https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&q=80&w=600"
      },
      {
        title: "Pro Cameras",
        description: "",
        image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=600"
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
    { id: 't-2', name: 'Mike Ross', role: 'Head Technician', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256' },
    { id: 't-3', name: 'Emily Chen', role: 'Product Design', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=256' },
    { id: 't-4', name: 'David Kim', role: 'Operations', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256' },
];
