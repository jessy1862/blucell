
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Marketplace } from './pages/Marketplace';
import { BestSellers } from './pages/BestSellers';
import { RepairBooking } from './pages/RepairBooking';
import { Dashboard } from './pages/Dashboard';
import { Auth } from './pages/Auth';
import { ProfileSettings } from './pages/ProfileSettings';
import { Checkout } from './pages/Checkout';
import { ContactUs } from './pages/ContactUs';
import { AboutUs } from './pages/AboutUs';
import { CartDrawer } from './components/CartDrawer';
import { SupportChatWidget } from './components/SupportChatWidget';
import { Button } from './components/ui';
import { DEFAULT_LANDING_CONFIG, DEFAULT_CONTACT_INFO, DEFAULT_TEAM, SEED_PRODUCTS } from './constants';
import { User, CartItem, Product, Currency, Language, ChatSession, ChatMessage, LandingPageConfig, ContactInfo, ContactMessage, Order, RepairJob, TeamMember } from './types';
import { ShoppingBag, User as UserIcon, Menu, X, Wrench, LogOut, Sun, Moon, Settings, Star, Globe, Coins, ShieldCheck } from 'lucide-react';
import { generateChatResponse } from './services/geminiService';
import { auth, onAuthStateChanged, signOut } from './services/firebase';
import { 
    getContactMessagesFromNeon, 
    getUsersFromNeon, 
    getFixersFromNeon,
    getUserFromNeon,
    saveRepairToNeon, 
    getRepairsFromNeon, 
    saveOrderToNeon, 
    getOrdersFromNeon, 
    saveProductToNeon, 
    getProductsFromNeon, 
    deleteProductFromNeon, 
    saveChatSessionToNeon, 
    getChatSessionsFromNeon, 
    saveUserToNeon,
    getRepairChatsFromNeon,
    saveRepairChatToNeon,
    saveUserSessionToNeon
} from './services/neon';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  cartCount: number;
  openCart: () => void;
  logo: string;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  language: Language;
  setLanguage: (l: Language) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
    user, onLogout, isDark, toggleTheme, cartCount, openCart, logo,
    currency, setCurrency, language, setLanguage
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const navigate = useNavigate();

  // Toggle navbar background based on scroll or page
  const navClass = isHome 
    ? "bg-slate-950/80 backdrop-blur-md border-b border-white/10 text-white" 
    : "bg-silver-light/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-silver-200 dark:border-slate-800 text-slate-900 dark:text-white";

  const handleNavClick = (id: string) => {
    if (location.pathname === '/') {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    } else {
        navigate('/', { state: { scrollTo: id } });
    }
    setIsOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${navClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 font-bold text-2xl tracking-tighter">
                {logo ? (
                    <img src={logo} alt="BLUCELL" className="h-8 w-auto rounded-md" />
                ) : (
                    <div className="w-8 h-8 bg-blucell-600 rounded-lg flex items-center justify-center text-white">
                        <Wrench className="w-4 h-4" />
                    </div>
                )}
              BLUCELL
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link to="/shop" className="hover:text-blucell-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">Marketplace</Link>
              <Link to="/bestsellers" className="hover:text-blucell-500 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-500" /> Best Sellers
              </Link>
              <Link to="/repair" className="hover:text-blucell-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">Repair</Link>
              {user && <Link to="/dashboard" className="hover:text-blucell-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">Dashboard</Link>}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
             {/* Currency & Language Selectors */}
             <div className="flex items-center gap-2 border-r border-slate-500/20 pr-4 mr-2">
                <div className="relative group">
                    <button className="flex items-center gap-1 text-sm font-medium hover:text-blucell-500 transition-colors">
                        <Coins className="w-4 h-4" /> {currency}
                    </button>
                    <div className="absolute right-0 mt-2 w-24 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden hidden group-hover:block animate-fade-in">
                        {['USD', 'EUR', 'GBP', 'JPY'].map((curr) => (
                            <button 
                                key={curr} 
                                onClick={() => setCurrency(curr as Currency)}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${currency === curr ? 'text-blucell-600 font-bold' : 'text-slate-600 dark:text-slate-400'}`}
                            >
                                {curr}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="relative group">
                    <button className="flex items-center gap-1 text-sm font-medium hover:text-blucell-500 transition-colors">
                        <Globe className="w-4 h-4" /> {language}
                    </button>
                    <div className="absolute right-0 mt-2 w-24 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden hidden group-hover:block animate-fade-in">
                        {['EN', 'ES', 'FR', 'DE'].map((lang) => (
                            <button 
                                key={lang} 
                                onClick={() => setLanguage(lang as Language)}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${language === lang ? 'text-blucell-600 font-bold' : 'text-slate-600 dark:text-slate-400'}`}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>
                </div>
             </div>

             {/* Theme Toggle */}
             <Button variant="ghost" className="p-2 rounded-full" onClick={toggleTheme} aria-label="Toggle Theme">
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </Button>

             <Button variant="ghost" className="p-2 rounded-full relative" onClick={openCart}>
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {cartCount}
                    </span>
                )}
             </Button>
             
             {user ? (
               <div className="flex items-center gap-3">
                  <Link to="/settings" className="p-2 rounded-full hover:bg-silver-200 dark:hover:bg-slate-800 transition-colors" title="Settings">
                    <Settings className="w-5 h-5" />
                  </Link>
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-silver-300 dark:border-slate-700">
                        <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-medium hidden lg:block">{user.name.split(' ')[0]}</span>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => { onLogout(); navigate('/'); }}>
                    <LogOut className="w-4 h-4" />
                  </Button>
               </div>
             ) : (
               <Button onClick={() => navigate('/auth')} size="sm">
                 Sign In
               </Button>
             )}
          </div>

          <div className="-mr-2 flex md:hidden items-center gap-2">
            <Button variant="ghost" className="p-2 rounded-full" onClick={toggleTheme}>
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
             <Button variant="ghost" className="p-2 rounded-full relative" onClick={openCart}>
                <ShoppingBag className="w-5 h-5" />
                 {cartCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {cartCount}
                    </span>
                )}
            </Button>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md hover:bg-slate-800/10 dark:hover:bg-white/10">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-slate-950 text-white border-t border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/shop" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-800">Shop</Link>
            <Link to="/bestsellers" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-800">Best Sellers</Link>
            <Link to="/repair" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-800">Repair</Link>
            <button onClick={() => handleNavClick('about')} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-800">About Us</button>
            <button onClick={() => handleNavClick('contact')} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-800">Contact</button>
            
            <div className="flex items-center gap-4 px-3 py-2 mt-2 border-t border-slate-800">
                <select 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm"
                >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                </select>
                <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm"
                >
                    <option value="EN">English</option>
                    <option value="ES">Español</option>
                    <option value="FR">Français</option>
                    <option value="DE">Deutsch</option>
                </select>
            </div>

            {user ? (
              <>
                <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-800">Dashboard</Link>
                <Link to="/settings" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-800">Settings</Link>
                <button onClick={() => { onLogout(); setIsOpen(false); navigate('/'); }} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-800 text-red-400">Sign Out</button>
              </>
            ) : (
              <Link to="/auth" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-800 text-blucell-400">Sign In</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <h3 className="text-white font-bold text-lg mb-4">BLUCELL</h3>
        <p className="text-sm">Innovating the way you buy, use, and fix technology.</p>
        <div className="mt-4 flex gap-4">
            <Link to="/about" className="text-xs hover:text-white transition-colors">About Us</Link>
            <Link to="/contact" className="text-xs hover:text-white transition-colors">Contact</Link>
        </div>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-4">Shop</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/shop" className="hover:text-blucell-500">Phones</Link></li>
          <li><Link to="/shop" className="hover:text-blucell-500">Laptops</Link></li>
          <li><Link to="/shop" className="hover:text-blucell-500">Drones</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-4">Support</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/contact" className="hover:text-blucell-500">Help Center</Link></li>
          <li><Link to="/dashboard" className="hover:text-blucell-500">Track Repair</Link></li>
          <li><Link to="/contact" className="hover:text-blucell-500">Warranty</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-4">Legal</h4>
        <ul className="space-y-2 text-sm">
          <li><a href="#" className="hover:text-blucell-500">Privacy Policy</a></li>
          <li><a href="#" className="hover:text-blucell-500">Terms of Service</a></li>
        </ul>
      </div>
    </div>
  </footer>
);

export default function App() {
  // --- State Initialization with Persistence ---
  
  const [user, setUser] = useState<User | null>(null);

  const [isDark, setIsDark] = useState(false);
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('blucell_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Start with empty products, fetch from DB
  const [products, setProducts] = useState<Product[]>([]);

  // Global State for Admin/Functional features
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allRepairs, setAllRepairs] = useState<RepairJob[]>([]);
  
  // Specific for Repair Booking
  const [fixers, setFixers] = useState<User[]>([]);

  const [landingPageConfig, setLandingPageConfig] = useState<LandingPageConfig>(() => {
      const saved = localStorage.getItem('blucell_landing_config');
      if (saved) {
          return JSON.parse(saved);
      }
      return DEFAULT_LANDING_CONFIG;
  });

  const [contactInfo, setContactInfo] = useState<ContactInfo>(() => {
      const saved = localStorage.getItem('blucell_contact_info');
      return saved ? JSON.parse(saved) : DEFAULT_CONTACT_INFO;
  });

  const [team, setTeam] = useState<TeamMember[]>(() => {
      const saved = localStorage.getItem('blucell_team');
      return saved ? JSON.parse(saved) : DEFAULT_TEAM;
  });

  // Support sessions
  const [supportSessions, setSupportSessions] = useState<ChatSession[]>([]);
  
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);

  // Repair Chats - Dictionary mapping repairId -> messages
  const [repairChats, setRepairChats] = useState<Record<string, ChatMessage[]>>({});

  // In-memory state for non-critical or simple lists
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [platformLogo, setPlatformLogo] = useState(localStorage.getItem('platform_logo') || '');
  
  // Settings State
  const [currency, setCurrency] = useState<Currency>((localStorage.getItem('currency') as Currency) || 'USD');
  const [language, setLanguage] = useState<Language>((localStorage.getItem('language') as Language) || 'EN');


  // --- Effects for Persistence ---
  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Fetch Products on Mount (Public)
  useEffect(() => {
      getProductsFromNeon().then(dbProducts => {
          if (dbProducts.length > 0) {
              const formattedProducts = dbProducts.map((p: any) => ({
                  id: p.id,
                  name: p.name,
                  price: Number(p.price),
                  category: p.category,
                  image: p.image,
                  rating: Number(p.rating),
                  reviews: Number(p.reviews),
                  description: p.description,
                  specs: JSON.parse(p.specs || '{}'),
                  status: p.status,
                  isBestSeller: p.is_best_seller
              }));
              setProducts(formattedProducts);
          } else {
              setProducts(SEED_PRODUCTS);
          }
      }).catch(err => {
          console.error("Failed to fetch products:", err);
          setProducts(SEED_PRODUCTS);
      });
  }, []);

  // Fetch Chat Sessions on Mount (Public/Admin filtered later)
  useEffect(() => {
      getChatSessionsFromNeon().then(dbSessions => {
          if (dbSessions.length > 0) {
              const formattedSessions = dbSessions.map((s: any) => ({
                  id: s.id,
                  userId: s.user_id,
                  userName: s.user_name,
                  userAvatar: s.user_avatar,
                  messages: JSON.parse(s.messages || '[]').map((msg: any) => ({
                      ...msg,
                      timestamp: new Date(msg.timestamp)
                  })),
                  unreadCount: s.unread_count,
                  lastMessage: s.last_message,
                  lastMessageTime: new Date(s.last_message_time),
                  status: s.status
              }));
              setSupportSessions(formattedSessions);
          }
      });
  }, []);

  // Fetch Repair Chats on Mount
  useEffect(() => {
      getRepairChatsFromNeon().then(dbChats => {
          if (dbChats.length > 0) {
              const chatMap: Record<string, ChatMessage[]> = {};
              dbChats.forEach((chat: any) => {
                  try {
                      const messages = JSON.parse(chat.messages || '[]').map((msg: any) => ({
                          ...msg,
                          timestamp: new Date(msg.timestamp)
                      }));
                      chatMap[chat.repair_id] = messages;
                  } catch (e) {
                      console.error("Error parsing repair chat messages", e);
                  }
              });
              setRepairChats(chatMap);
          }
      });
  }, []);

  // Fetch Available Fixers (For Booking)
  useEffect(() => {
      getFixersFromNeon().then(dbFixers => {
          if (dbFixers.length > 0) {
               const formattedFixers = dbFixers.map((u: any) => ({
                  id: u.id,
                  name: u.name,
                  email: u.email,
                  role: u.role as any,
                  avatar: u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=random`,
                  availabilityStatus: u.availability_status as any || 'ONLINE',
                  bio: u.bio
              }));
              setFixers(formattedFixers);
          }
      });
  }, []);

  const getDeviceName = () => {
    const ua = navigator.userAgent;
    let browser = "Unknown Browser";
    if (ua.indexOf("Chrome") > -1) browser = "Chrome";
    else if (ua.indexOf("Safari") > -1) browser = "Safari";
    else if (ua.indexOf("Firefox") > -1) browser = "Firefox";

    let os = "Unknown OS";
    if (ua.indexOf("Win") > -1) os = "Windows";
    else if (ua.indexOf("Mac") > -1) os = "MacOS";
    else if (ua.indexOf("Linux") > -1) os = "Linux";
    else if (ua.indexOf("Android") > -1) os = "Android";
    else if (ua.indexOf("like Mac") > -1) os = "iOS";

    return `${os} - ${browser}`;
  }

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        
        let role: 'CUSTOMER' | 'FIXER' | 'ADMIN' | 'SUPER_ADMIN' | 'ADMIN_JR' = 'CUSTOMER';
        let availabilityStatus = 'OFFLINE';
        let bio = '';

        // 1. Try fetching from DB to respect Admin-appointed roles and persisted data
        const dbUser = await getUserFromNeon(firebaseUser.uid);
        
        if (dbUser) {
            role = dbUser.role as any;
            bio = dbUser.bio || '';
            availabilityStatus = dbUser.availability_status || 'OFFLINE';
        } else {
            // 2. Fallback logic for initial creation or missing DB record
            if (firebaseUser.email === 'jesicar1100@gmail.com') {
                role = 'SUPER_ADMIN';
            } else if (firebaseUser.email?.includes('admin')) {
                role = 'ADMIN';
            } else if (firebaseUser.email?.includes('fixer')) {
                role = 'FIXER';
                availabilityStatus = 'ONLINE'; // Default online for new fixers
            }
            
            // Auto-save to Neon if missing
            await saveUserToNeon({
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'User',
                email: firebaseUser.email || '',
                role: role,
                avatar: firebaseUser.photoURL || '',
                bio: bio,
                availability_status: availabilityStatus,
                created_at: new Date().toISOString(),
                phone: dbUser?.phone,
                address: dbUser?.address
            });
        }
        
        const appUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          role: role,
          avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.displayName || 'User'}&background=random`,
          availabilityStatus: availabilityStatus as any,
          bio: bio,
          phone: dbUser?.phone, // Map phone from DB
          address: dbUser?.address // Map address from DB
        };
        setUser(appUser);
        
        // --- Session Management ---
        const currentSessionId = sessionStorage.getItem('blucell_session_id');
        let newSessionId = currentSessionId;
        
        if (!newSessionId) {
            newSessionId = `sess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('blucell_session_id', newSessionId);
        }

        // Get timezone as rough location
        const location = Intl.DateTimeFormat().resolvedOptions().timeZone.replace('_', ' ');

        saveUserSessionToNeon({
            id: newSessionId,
            user_id: appUser.id,
            device_name: getDeviceName(),
            location: location,
            last_active: new Date().toISOString()
        });

        // Sync with allUsers list for admin view
        setAllUsers(prev => {
            if (!prev.find(u => u.id === appUser.id)) {
                return [...prev, appUser];
            }
            // Update existing user in list if role changed
            return prev.map(u => u.id === appUser.id ? appUser : u);
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch Data based on User
  useEffect(() => {
    if (!user) return;

    // Fetch Orders for ALL users so customers can see their history
    getOrdersFromNeon().then(dbOrders => {
        if (dbOrders.length > 0) {
            const formattedOrders = dbOrders.map((o: any) => ({
                id: o.id,
                date: o.date,
                total: Number(o.total),
                status: o.status as any,
                items: JSON.parse(o.items || '[]')
            }));
            setAllOrders(formattedOrders);
        }
    });

    // Fetch Repairs for ALL users
    getRepairsFromNeon().then(dbRepairs => {
        if (dbRepairs.length > 0) {
            const formattedRepairs = dbRepairs.map((r: any) => ({
                id: r.id,
                deviceId: r.device_id,
                deviceType: r.device_type,
                issueDescription: r.issue_description,
                status: r.status as any,
                customerId: r.customer_id,
                fixer_id: r.fixer_id,
                date_booked: r.date_booked,
                estimated_cost: r.estimated_cost ? Number(r.estimated_cost) : undefined,
                ai_diagnosis: r.ai_diagnosis,
                delivery_method: r.delivery_method as any,
                pickup_address: r.pickup_address,
                contact_phone: r.contact_phone,
                courier: r.courier,
                trackingNumber: r.tracking_number,
                timeline: JSON.parse(r.timeline || '[]'),
                images: JSON.parse(r.images || '[]')
            }));
            setAllRepairs(formattedRepairs);
        }
    });

    // Admin Specific Data (Admin JR also needs this)
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'ADMIN_JR') {
        // Fetch Contact Messages
        getContactMessagesFromNeon().then(msgs => {
            if (msgs.length > 0) {
                const formatted = msgs.map((m: any) => ({
                    id: m.id.toString(),
                    name: m.name,
                    email: m.email,
                    subject: m.subject,
                    message: m.message,
                    date: new Date(m.created_at),
                    read: false
                }));
                setContactMessages(formatted);
            }
        });

        // Fetch Users
        getUsersFromNeon().then(dbUsers => {
            if (dbUsers.length > 0) {
                const formattedUsers = dbUsers.map((u: any) => ({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    role: u.role as any,
                    avatar: u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=random`,
                    phone: u.phone || '', 
                    address: u.address || '',
                    bio: u.bio || '',
                    availabilityStatus: u.availability_status as any || 'OFFLINE'
                }));
                setAllUsers(formattedUsers);
            }
        });
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
    localStorage.setItem('language', language);
  }, [currency, language]);

  useEffect(() => {
      localStorage.setItem('blucell_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
      localStorage.setItem('blucell_landing_config', JSON.stringify(landingPageConfig));
  }, [landingPageConfig]);
  
  useEffect(() => {
      localStorage.setItem('blucell_contact_info', JSON.stringify(contactInfo));
  }, [contactInfo]);

  useEffect(() => {
      localStorage.setItem('blucell_team', JSON.stringify(team));
  }, [team]);
  
  // --- Handlers ---

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  const formatPrice = (priceInUsd: number): string => {
    const rates: Record<Currency, number> = {
        USD: 1,
        EUR: 0.92,
        GBP: 0.79,
        JPY: 150
    };
    const symbols: Record<Currency, string> = {
        USD: '$',
        EUR: '€',
        GBP: '£',
        JPY: '¥'
    };

    const rate = rates[currency] || 1;
    const symbol = symbols[currency] || '$';
    const val = priceInUsd * rate;
    const fractionDigits = currency === 'JPY' ? 0 : 2;

    return `${symbol}${val.toLocaleString(undefined, { 
        minimumFractionDigits: fractionDigits, 
        maximumFractionDigits: fractionDigits 
    })}`;
  };

  const handleLogin = (loggedInUser: User) => {
    // This is now purely for navigation or additional logic if needed, 
    // as onAuthStateChanged handles the main state
  };

  const handleLogout = () => {
    sessionStorage.removeItem('blucell_session_id');
    signOut(auth);
    setCart([]);
  };

  const handleUpdateUser = async (updatedData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      // Update in global list
      setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
      
      // Update in DB
      await saveUserToNeon({
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          avatar: updatedUser.avatar,
          bio: updatedUser.bio,
          availability_status: updatedUser.availabilityStatus,
          created_at: new Date().toISOString(), // Or keep original
          phone: updatedUser.phone,
          address: updatedUser.address
      });
    }
  };
  
  // Admin User Management Handlers
  const handleAddUser = (newUser: User) => {
      setAllUsers(prev => [newUser, ...prev]);
  };
  
  const handleUpdateUserAdmin = (updatedUser: User) => {
      setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      saveUserToNeon({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        availability_status: updatedUser.availabilityStatus,
        created_at: new Date().toISOString(),
        phone: updatedUser.phone,
        address: updatedUser.address
      });
  };

  const handleUpdatePlatformSettings = (settings: { logo?: string }) => {
    if (settings.logo !== undefined) {
        setPlatformLogo(settings.logo);
        localStorage.setItem('platform_logo', settings.logo);
    }
  };

  const handleAddProduct = (product: Product) => {
    setProducts(prev => [product, ...prev]);
    // Save to Neon
    saveProductToNeon({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        image: product.image,
        rating: product.rating,
        reviews: product.reviews,
        description: product.description,
        specs: JSON.stringify(product.specs),
        status: product.status,
        is_best_seller: product.isBestSeller || false
    });
  };

  const handleUpdateProduct = (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    // Update Neon
    saveProductToNeon({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        image: product.image,
        rating: product.rating,
        reviews: product.reviews,
        description: product.description,
        specs: JSON.stringify(product.specs),
        status: product.status,
        is_best_seller: product.isBestSeller || false
    });
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    deleteProductFromNeon(id);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setCart([]);
  
  // --- Order & Repair Handlers ---
  const handlePlaceOrder = (order: Order) => {
      setAllOrders(prev => [order, ...prev]);
      
      // Save to Neon
      saveOrderToNeon({
          id: order.id,
          date: order.date,
          total: order.total,
          status: order.status,
          items: JSON.stringify(order.items)
      });
  };

  const handleUpdateOrder = (orderId: string, status: Order['status']) => {
      setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      // In a real app, update status in DB here too
      // Ideally we would have updateOrderInNeon
      const order = allOrders.find(o => o.id === orderId);
      if (order) {
          saveOrderToNeon({
            id: order.id,
            date: order.date,
            total: order.total,
            status: status,
            items: JSON.stringify(order.items)
          });
      }
  };

  const handleBookRepair = (repair: RepairJob) => {
      setAllRepairs(prev => [repair, ...prev]);
      
      // Save to Neon
      saveRepairToNeon({
          id: repair.id,
          device_id: repair.deviceId,
          device_type: repair.deviceType,
          issue_description: repair.issueDescription,
          status: repair.status,
          customer_id: repair.customerId,
          fixer_id: repair.fixerId,
          date_booked: repair.dateBooked,
          estimated_cost: repair.estimatedCost || 0,
          ai_diagnosis: repair.aiDiagnosis,
          delivery_method: repair.deliveryMethod,
          pickup_address: repair.pickupAddress,
          contact_phone: repair.contactPhone,
          courier: repair.courier,
          tracking_number: repair.trackingNumber,
          timeline: JSON.stringify(repair.timeline || []),
          images: JSON.stringify(repair.images || [])
      });
  };

  const handleUpdateRepair = (repair: RepairJob) => {
      setAllRepairs(prev => prev.map(r => r.id === repair.id ? repair : r));
      // Save to Neon
      saveRepairToNeon({
          id: repair.id,
          device_id: repair.deviceId,
          device_type: repair.deviceType,
          issue_description: repair.issueDescription,
          status: repair.status,
          customer_id: repair.customerId,
          fixer_id: repair.fixerId,
          date_booked: repair.dateBooked,
          estimated_cost: repair.estimatedCost || 0,
          ai_diagnosis: repair.aiDiagnosis,
          delivery_method: repair.deliveryMethod,
          pickup_address: repair.pickupAddress,
          contact_phone: repair.contactPhone,
          courier: repair.courier,
          tracking_number: repair.trackingNumber,
          timeline: JSON.stringify(repair.timeline || []),
          images: JSON.stringify(repair.images || [])
      });
  };

  // --- Contact Functions ---
  const handleNewContactMessage = (msg: Omit<ContactMessage, 'id' | 'date' | 'read'>) => {
    const newMessage: ContactMessage = {
        ...msg,
        id: Date.now().toString(),
        date: new Date(),
        read: false
    };
    setContactMessages(prev => [newMessage, ...prev]);
  };
  
  const handleDeleteContactMessage = (id: string) => {
      setContactMessages(prev => prev.filter(msg => msg.id !== id));
      // Implement DB delete if needed
  };

  // --- Chat Functions ---

  const saveSession = (session: ChatSession) => {
       saveChatSessionToNeon({
          id: session.id,
          user_id: session.userId,
          user_name: session.userName,
          user_avatar: session.userAvatar,
          messages: JSON.stringify(session.messages),
          unread_count: session.unreadCount,
          last_message: session.lastMessage,
          last_message_time: session.lastMessageTime.toISOString(),
          status: session.status
       });
  };

  const handleSendSupportMessage = async (text: string) => {
    if (!user) return;

    let updatedSessions = [...supportSessions];
    let sessionIndex = updatedSessions.findIndex(s => s.userId === user.id);
    let currentHistory: ChatMessage[] = [];
    let currentSession: ChatSession | null = null;

    const newUserMsg: ChatMessage = {
        id: Date.now().toString(),
        senderId: user.id,
        text,
        timestamp: new Date(),
        isSystem: false
    };

    if (sessionIndex >= 0) {
        updatedSessions[sessionIndex].messages.push(newUserMsg);
        updatedSessions[sessionIndex].lastMessage = text;
        updatedSessions[sessionIndex].lastMessageTime = new Date();
        updatedSessions[sessionIndex].unreadCount += 1; // Unread for admin
        updatedSessions[sessionIndex].status = 'OPEN'; // Re-open if closed
        
        // Move to top
        const session = updatedSessions[sessionIndex];
        updatedSessions.splice(sessionIndex, 1);
        updatedSessions.unshift(session);
        currentSession = session;
        
        currentHistory = session.messages;
    } else {
        const newSession: ChatSession = {
            id: `s-${Date.now()}`,
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatar,
            messages: [newUserMsg],
            unreadCount: 1,
            lastMessage: text,
            lastMessageTime: new Date(),
            status: 'OPEN'
        };
        updatedSessions = [newSession, ...updatedSessions];
        currentSession = newSession;
        currentHistory = newSession.messages;
    }

    setSupportSessions(updatedSessions);
    if (currentSession) saveSession(currentSession);

    // AI Response Integration
    try {
        const aiReplyText = await generateChatResponse(currentHistory, text);
        
        // Add AI response to session
        setSupportSessions(prev => {
             const newSessions = [...prev];
             const idx = newSessions.findIndex(s => s.userId === user.id);
             if (idx >= 0) {
                 const aiMsg: ChatMessage = {
                     id: (Date.now() + 1).toString(),
                     senderId: 'support-bot', // distinct ID for bot
                     text: aiReplyText,
                     timestamp: new Date(),
                     isSystem: false
                 };
                 newSessions[idx].messages.push(aiMsg);
                 newSessions[idx].lastMessage = aiReplyText;
                 newSessions[idx].lastMessageTime = new Date();
                 saveSession(newSessions[idx]);
             }
             return newSessions;
        });

    } catch (error) {
        console.error("AI Chat Error", error);
    }
  };

  const handleAdminReply = (sessionId: string, text: string) => {
      setSupportSessions(prev => prev.map(session => {
          if (session.id === sessionId) {
              const newMessage: ChatMessage = {
                  id: Date.now().toString(),
                  senderId: 'admin',
                  text,
                  timestamp: new Date(),
                  isSystem: false
              };
              const updatedSession = {
                  ...session,
                  messages: [...session.messages, newMessage],
                  lastMessage: text,
                  lastMessageTime: new Date(),
                  unreadCount: 0 // Admin replied
              };
              saveSession(updatedSession);
              return updatedSession;
          }
          return session;
      }));
  };

  const handleCreateSession = (userId: string): string => {
      const existing = supportSessions.find(s => s.userId === userId);
      if (existing) return existing.id;
      
      const targetUser = allUsers.find(u => u.id === userId);
      const newSessionId = `s-${Date.now()}`;
      
      if (targetUser) {
          const newSession: ChatSession = {
              id: newSessionId,
              userId: targetUser.id,
              userName: targetUser.name,
              userAvatar: targetUser.avatar,
              messages: [],
              unreadCount: 0,
              lastMessage: 'Session started from repair request',
              lastMessageTime: new Date(),
              status: 'OPEN'
          };
          setSupportSessions(prev => [newSession, ...prev]);
          saveSession(newSession);
          return newSessionId;
      }
      return '';
  };

  const handleSendRepairMessage = (repairId: string, text: string, senderId: string) => {
      setRepairChats(prev => {
          const currentMessages = prev[repairId] || [];
          const newMessage: ChatMessage = {
              id: Date.now().toString(),
              senderId: senderId,
              text: text,
              timestamp: new Date(),
              isSystem: false
          };
          const updatedMessages = [...currentMessages, newMessage];
          
          // Save to Neon
          saveRepairChatToNeon({
              repair_id: repairId,
              messages: JSON.stringify(updatedMessages),
              last_message_at: newMessage.timestamp.toISOString()
          });

          return {
              ...prev,
              [repairId]: updatedMessages
          };
      });
  };

  // Get current user's session messages for the widget
  const currentUserSession = user ? supportSessions.find(s => s.userId === user.id) : null;
  const userMessages = currentUserSession ? currentUserSession.messages : [];

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-silver-100 via-silver-200 to-silver-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <Navbar 
            user={user} 
            onLogout={handleLogout} 
            isDark={isDark} 
            toggleTheme={toggleTheme}
            cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
            openCart={() => setIsCartOpen(true)}
            logo={platformLogo}
            currency={currency}
            setCurrency={setCurrency}
            language={language}
            setLanguage={setLanguage}
        />
        <CartDrawer 
            isOpen={isCartOpen} 
            onClose={() => setIsCartOpen(false)} 
            cart={cart}
            updateQuantity={updateQuantity}
            removeItem={removeFromCart}
            formatPrice={formatPrice}
        />
        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<LandingPage 
                config={landingPageConfig} 
                contactInfo={contactInfo}
                onSendMessage={handleNewContactMessage}
                team={team}
            />} />
            <Route path="/shop" element={<Marketplace addToCart={addToCart} products={products} formatPrice={formatPrice} />} />
            <Route path="/bestsellers" element={<BestSellers addToCart={addToCart} products={products} formatPrice={formatPrice} />} />
            <Route path="/repair" element={<RepairBooking formatPrice={formatPrice} user={user || undefined} onBookRepair={handleBookRepair} fixers={fixers} />} />
            <Route path="/checkout" element={
              user ? <Checkout 
                        cart={cart} 
                        clearCart={clearCart} 
                        formatPrice={formatPrice}
                        onPlaceOrder={handlePlaceOrder} 
                     /> : <Navigate to="/auth" />
            } />
            <Route path="/auth" element={
              user ? <Navigate to="/dashboard" /> : <Auth onLogin={handleLogin} />
            } />
            <Route path="/dashboard" element={
              user ? <Dashboard 
                        user={user} 
                        onUpdateUser={handleUpdateUser}
                        products={products}
                        onAddProduct={handleAddProduct}
                        onUpdateProduct={handleUpdateProduct}
                        onDeleteProduct={handleDeleteProduct}
                        onUpdatePlatformSettings={handleUpdatePlatformSettings}
                        formatPrice={formatPrice}
                        supportSessions={supportSessions}
                        onAdminReply={handleAdminReply}
                        onCreateSession={handleCreateSession}
                        landingPageConfig={landingPageConfig}
                        onUpdateLandingPage={setLandingPageConfig}
                        contactInfo={contactInfo}
                        onUpdateContactInfo={setContactInfo}
                        contactMessages={contactMessages}
                        onDeleteContactMessage={handleDeleteContactMessage}
                        // Admin specific props
                        allUsers={allUsers}
                        onAddUser={handleAddUser}
                        onUpdateUserAdmin={handleUpdateUserAdmin}
                        allOrders={allOrders}
                        onUpdateOrder={handleUpdateOrder}
                        allRepairs={allRepairs}
                        onUpdateRepair={handleUpdateRepair}
                        platformLogo={platformLogo} // Pass the logo here
                        team={team}
                        onUpdateTeam={setTeam}
                        // Repair Chat
                        repairChats={repairChats}
                        onSendRepairMessage={handleSendRepairMessage}
                     /> : <Navigate to="/auth" />
            } />
            <Route path="/settings" element={
              user ? <ProfileSettings user={user} onUpdate={handleUpdateUser} onLogout={handleLogout} /> : <Navigate to="/auth" />
            } />
            <Route path="/contact" element={<ContactUs contactInfo={contactInfo} onSendMessage={handleNewContactMessage} />} />
            <Route path="/about" element={<AboutUs team={team} />} />
          </Routes>
        </main>
        <Footer />
        
        {/* Support Chat Widget - Only for Customers/Fixers */}
        {user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN_JR' && (
            <SupportChatWidget 
                messages={userMessages}
                onSendMessage={handleSendSupportMessage}
                currentUser={user}
            />
        )}
      </div>
    </HashRouter>
  );
}
