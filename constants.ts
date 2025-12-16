
import { Product, RepairJob, User, Order, ChatSession, LandingPageConfig, ContactInfo } from './types';

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Sterling',
  email: 'alex@example.com',
  role: 'CUSTOMER', // Change this to 'FIXER' or 'ADMIN' to test other views
  avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256',
  phone: '+1 (555) 010-9988',
  address: '42 Silicon Ave, Tech City, CA 94000',
  bio: 'Tech enthusiast and gadget collector. Always looking for the latest drones.'
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Xenon Ultra Phone 15',
    category: 'Phone',
    price: 999,
    rating: 4.8,
    reviews: 124,
    image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=800',
    description: 'The ultimate smartphone experience with AI-enhanced photography and all-day battery life.',
    specs: { screen: '6.7" OLED', battery: '5000mAh', processor: 'X1 Chip' },
    status: 'IN_STOCK',
    isBestSeller: true
  },
  {
    id: 'p2',
    name: 'Nebula Laptop Pro',
    category: 'Laptop',
    price: 1899,
    rating: 4.9,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=800',
    description: 'Power meets portability. Designed for creators who need performance on the go.',
    specs: { cpu: 'M3 Max', ram: '32GB', storage: '1TB SSD' },
    status: 'IN_STOCK',
    isBestSeller: false
  },
  {
    id: 'p3',
    name: 'SonicBlast 360',
    category: 'Audio',
    price: 249,
    rating: 4.5,
    reviews: 210,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=800',
    description: 'Immersive 360-degree sound for your home or outdoor adventures.',
    specs: { battery: '24hr', connectivity: 'BT 5.3', waterproof: 'IP67' },
    status: 'IN_STOCK',
    isBestSeller: true
  },
  {
    id: 'p4',
    name: 'SkyHawk Drone X',
    category: 'Drone',
    price: 1299,
    rating: 4.7,
    reviews: 56,
    image: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&q=80&w=800',
    description: 'Professional aerial photography made easy with obstacle avoidance.',
    specs: { range: '10km', camera: '4K 60fps', flightTime: '45min' },
    status: 'OUT_OF_STOCK',
    isBestSeller: false
  },
    {
    id: 'p5',
    name: 'GameStation 5',
    category: 'Gaming',
    price: 499,
    rating: 4.9,
    reviews: 3400,
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=800',
    description: 'Next-gen gaming is here with ultra-fast loading and ray tracing.',
    specs: { storage: '825GB', output: '8K HDR', fps: '120Hz' },
    status: 'IN_STOCK',
    isBestSeller: true
  },
   {
    id: 'p6',
    name: 'ProLens 85mm',
    category: 'Camera',
    price: 899,
    rating: 4.6,
    reviews: 42,
    image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&q=80&w=800',
    description: 'Portrait perfection in a compact lens. Sharpness edge to edge.',
    specs: { aperture: 'f/1.4', mount: 'E-Mount', stabilization: 'Optical' },
    status: 'IN_STOCK',
    isBestSeller: false
  },
  {
    id: 'p7',
    name: 'Echo Noise-Canceling',
    category: 'Audio',
    price: 349,
    rating: 4.7,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
    description: 'Silence the world and lose yourself in the music.',
    specs: { type: 'Over-ear', battery: '30hr', anc: 'Adaptive' },
    status: 'IN_STOCK',
    isBestSeller: true
  },
  {
    id: 'p8',
    name: 'Chrono Smartwatch',
    category: 'Phone',
    price: 399,
    rating: 4.5,
    reviews: 88,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
    description: 'Track your health, notifications, and life on your wrist.',
    specs: { screen: 'OLED Always-On', waterproof: '50m', sensors: 'HR, SpO2' },
    status: 'IN_STOCK',
    isBestSeller: false
  }
];

export const MOCK_REPAIRS: RepairJob[] = [
  {
    id: 'r1',
    deviceId: 'dev1',
    deviceType: 'Smartphone - Screen Crack',
    issueDescription: 'Dropped on concrete, screen shattered but touch works.',
    status: 'IN_PROGRESS',
    customerId: 'u1',
    fixerId: 'f1',
    dateBooked: '2023-10-25',
    estimatedCost: 120
  },
  {
    id: 'r2',
    deviceId: 'dev2',
    deviceType: 'Laptop - Battery Issue',
    issueDescription: 'Battery drains in 30 minutes.',
    status: 'PENDING',
    customerId: 'u1',
    dateBooked: '2023-10-28',
    aiDiagnosis: 'Likely battery degradation requiring replacement. Approx cost: $80-$150.'
  },
  {
    id: 'r3',
    deviceId: 'dev3',
    deviceType: 'Gaming Console - Overheating',
    issueDescription: 'Console shuts down after 10 minutes of gameplay.',
    status: 'DIAGNOSING',
    customerId: 'u3',
    fixerId: 'u2', // Assigned to Super Admin (Jesica)
    dateBooked: '2023-11-05',
    aiDiagnosis: 'Thermal paste application issue or fan failure. Recommended: Cleaning and thermal paste replacement.'
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-1023',
    date: '2023-10-15',
    total: 1248.00,
    status: 'DELIVERED',
    items: [
      { productName: 'Xenon Ultra Phone 15', quantity: 1, image: MOCK_PRODUCTS[0].image },
      { productName: 'SonicBlast 360', quantity: 1, image: MOCK_PRODUCTS[2].image }
    ]
  },
  {
    id: 'ord-1045',
    date: '2023-10-28',
    total: 249.00,
    status: 'SHIPPED',
    items: [
      { productName: 'SonicBlast 360', quantity: 1, image: MOCK_PRODUCTS[2].image }
    ]
  }
];

export const MOCK_ALL_USERS: User[] = [
    { 
        id: 'u1', 
        name: 'Alex Sterling', 
        email: 'alex@example.com', 
        role: 'CUSTOMER', 
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256',
        phone: '+1 (555) 010-9988',
        address: '42 Silicon Ave, Tech City, CA',
        bio: 'Tech enthusiast. I break things, you fix them.'
    },
    { 
        id: 'u2', 
        name: 'Jesica R', 
        email: 'jesicar1100@gmail.com', 
        role: 'ADMIN', 
        avatar: 'https://ui-avatars.com/api/?name=Jesica+R&background=random', 
        availabilityStatus: 'ONLINE',
        phone: '+1 (555) 999-0000',
        address: 'BLUCELL HQ, San Francisco, CA',
        bio: 'Platform Administrator and Lead Tech.'
    },
    { 
        id: 'f1', 
        name: 'Mike Ross', 
        email: 'mike@blucell.com', 
        role: 'FIXER', 
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256', 
        availabilityStatus: 'ONLINE',
        phone: '+1 (555) 234-5678',
        address: 'Mobile Unit 4, Downtown',
        bio: 'Certified Apple & Samsung Repair Technician. 5 years experience.'
    },
    { 
        id: 'f2', 
        name: 'Sarah Jane', 
        email: 'sarah@blucell.com', 
        role: 'FIXER', 
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=256', 
        availabilityStatus: 'BUSY',
        phone: '+1 (555) 876-5432',
        address: 'North Hills Repair Center',
        bio: 'Specialist in micro-soldering and logic board repairs.'
    },
    { 
        id: 'u3', 
        name: 'John Doe', 
        email: 'john@example.com', 
        role: 'CUSTOMER', 
        avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random',
        phone: '+1 (555) 111-2222',
        address: '789 Pine St, Suburbia, NY',
        bio: 'Just looking for good deals on gaming gear.'
    },
];

export const MOCK_ALL_ORDERS: Order[] = [
    ...MOCK_ORDERS,
    {
        id: 'ord-1099',
        date: '2023-11-01',
        total: 899.00,
        status: 'PROCESSING',
        items: [{ productName: 'ProLens 85mm', quantity: 1, image: MOCK_PRODUCTS[5].image }]
    },
    {
        id: 'ord-1102',
        date: '2023-11-02',
        total: 1299.00,
        status: 'SHIPPED',
        items: [{ productName: 'SkyHawk Drone X', quantity: 1, image: MOCK_PRODUCTS[3].image }]
    }
];

export const MOCK_CHAT_SESSIONS: ChatSession[] = [
    {
        id: 's1',
        userId: 'u1', // Alex
        userName: 'Alex Sterling',
        userAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256',
        messages: [
            { id: 'm1', senderId: 'u1', text: 'Hi, I have a question about the warranty on the Xenon Phone.', timestamp: new Date(Date.now() - 3600000), isSystem: false },
            { id: 'm2', senderId: 'admin', text: 'Hello Alex! All our phones come with a standard 1-year warranty.', timestamp: new Date(Date.now() - 3500000), isSystem: false },
            { id: 'm3', senderId: 'u1', text: 'Does that cover screen replacements?', timestamp: new Date(Date.now() - 3400000), isSystem: false }
        ],
        unreadCount: 1,
        lastMessage: 'Does that cover screen replacements?',
        lastMessageTime: new Date(Date.now() - 3400000),
        status: 'OPEN'
    },
    {
        id: 's2',
        userId: 'u3', // John Doe
        userName: 'John Doe',
        userAvatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random',
        messages: [
            { id: 'm4', senderId: 'u3', text: 'My order hasn\'t arrived yet. Order #ord-1099.', timestamp: new Date(Date.now() - 900000), isSystem: false }
        ],
        unreadCount: 1,
        lastMessage: 'My order hasn\'t arrived yet. Order #ord-1099.',
        lastMessageTime: new Date(Date.now() - 900000),
        status: 'OPEN'
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
