
import { Product, RepairJob, User, Order, ChatSession } from './types';

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Sterling',
  email: 'alex@example.com',
  role: 'CUSTOMER', // Change this to 'FIXER' or 'ADMIN' to test other views
  avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256'
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
    { id: 'u1', name: 'Alex Sterling', email: 'alex@example.com', role: 'CUSTOMER', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256' },
    { id: 'u2', name: 'Jesica R', email: 'jesicar1100@gmail.com', role: 'ADMIN', avatar: 'https://ui-avatars.com/api/?name=Jesica+R&background=random' },
    { id: 'f1', name: 'Mike Ross', email: 'mike@blucell.com', role: 'FIXER', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256', availabilityStatus: 'ONLINE' },
    { id: 'f2', name: 'Sarah Jane', email: 'sarah@blucell.com', role: 'FIXER', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=256', availabilityStatus: 'BUSY' },
    { id: 'u3', name: 'John Doe', email: 'john@example.com', role: 'CUSTOMER', avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random' },
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
