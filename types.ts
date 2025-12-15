
export type UserRole = 'CUSTOMER' | 'FIXER' | 'ADMIN';

export type AvailabilityStatus = 'ONLINE' | 'OFFLINE' | 'BUSY';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY';
export type Language = 'EN' | 'ES' | 'FR' | 'DE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  address?: string;
  bio?: string;
  availabilityStatus?: AvailabilityStatus;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'Phone' | 'Laptop' | 'Audio' | 'Camera' | 'Gaming' | 'Drone' | 'Others';
  image: string;
  rating: number;
  reviews: number;
  description: string;
  specs: Record<string, string>;
  status: 'IN_STOCK' | 'OUT_OF_STOCK';
  isBestSeller?: boolean;
}

export interface RepairJob {
  id: string;
  deviceId: string;
  deviceType: string;
  issueDescription: string;
  status: 'PENDING' | 'DIAGNOSING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELIVERED';
  customerId: string;
  fixerId?: string;
  dateBooked: string;
  estimatedCost?: number;
  aiDiagnosis?: string;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  items: { productName: string; quantity: number; image: string }[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isSystem?: boolean;
}

export interface ChatSession {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  messages: ChatMessage[];
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: Date;
  status: 'OPEN' | 'CLOSED';
}

export interface CartItem extends Product {
  quantity: number;
}

export interface LandingPageConfig {
  hero: {
    titlePrefix: string;
    titleHighlight: string;
    titleSuffix: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    imageForeground: string;
    imageBackground: string;
  };
  features: {
    title: string;
    description: string;
  }[];
  trending: {
    sectionTitle: string;
    sectionSubtitle: string;
    items: {
      title: string;
      description: string;
      image: string;
      badge?: string;
    }[];
  };
  ctaBottom: {
    title: string;
    description: string;
    buttonText: string;
  };
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: Date;
  read: boolean;
}
