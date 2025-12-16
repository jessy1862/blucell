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
import { MOCK_USER, MOCK_PRODUCTS, MOCK_CHAT_SESSIONS, DEFAULT_LANDING_CONFIG, DEFAULT_CONTACT_INFO } from './constants';
import { User, CartItem, Product, Currency, Language, ChatSession, ChatMessage, LandingPageConfig, ContactInfo, ContactMessage } from './types';
import { ShoppingBag, User as UserIcon, Menu, X, Wrench, LogOut, Sun, Moon, Settings, Star, Globe, Coins } from 'lucide-react';

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

             {user && (
                <Button variant="ghost" className="p-2 rounded-full relative" onClick={openCart}>
                    <ShoppingBag className="w-5 h-5" />
                    {cartCount > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                            {cartCount}
                        </span>
                    )}
                </Button>
             )}
             
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
             {user && (
                <Button variant="ghost" className="p-2 rounded-full relative" onClick={openCart}>
                    <ShoppingBag className="w-5 h-5" />
                     {cartCount > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                            {cartCount}
                        </span>
                    )}
                </Button>
             )}
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
  const [user, setUser] = useState<User | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [platformLogo, setPlatformLogo] = useState(localStorage.getItem('platform_logo') || '');
  
  // Settings State
  const [currency, setCurrency] = useState<Currency>((localStorage.getItem('currency') as Currency) || 'USD');
  const [language, setLanguage] = useState<Language>((localStorage.getItem('language') as Language) || 'EN');

  // Products State
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);

  // Chat State
  const [supportSessions, setSupportSessions] = useState<ChatSession[]>(MOCK_CHAT_SESSIONS);

  // Landing Page State
  const [landingPageConfig, setLandingPageConfig] = useState<LandingPageConfig>(DEFAULT_LANDING_CONFIG);

  // Contact Info & Messages State
  const [contactInfo, setContactInfo] = useState<ContactInfo>(DEFAULT_CONTACT_INFO);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('currency', currency);
    localStorage.setItem('language', language);
  }, [currency, language]);

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
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    setCart([]);
  };

  const handleUpdateUser = (updatedData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedData });
    }
  };

  const handleUpdatePlatformSettings = (settings: { logo?: string }) => {
    if (settings.logo !== undefined) {
        setPlatformLogo(settings.logo);
        localStorage.setItem('platform_logo', settings.logo);
    }
  };

  const handleAddProduct = (product: Product) => {
    setProducts(prev => [product, ...prev]);
  };

  const handleUpdateProduct = (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
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

  // --- Chat Functions ---

  const handleSendSupportMessage = (text: string) => {
    if (!user) return;

    setSupportSessions(prev => {
        const existingSessionIndex = prev.findIndex(s => s.userId === user.id);
        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            senderId: user.id,
            text,
            timestamp: new Date(),
            isSystem: false
        };

        if (existingSessionIndex >= 0) {
            const updatedSessions = [...prev];
            const session = updatedSessions[existingSessionIndex];
            session.messages.push(newMessage);
            session.lastMessage = text;
            session.lastMessageTime = new Date();
            session.unreadCount += 1; // Assuming unread for admin
            // Move to top
            updatedSessions.splice(existingSessionIndex, 1);
            updatedSessions.unshift(session);
            return updatedSessions;
        } else {
            const newSession: ChatSession = {
                id: `s-${Date.now()}`,
                userId: user.id,
                userName: user.name,
                userAvatar: user.avatar,
                messages: [newMessage],
                unreadCount: 1,
                lastMessage: text,
                lastMessageTime: new Date(),
                status: 'OPEN'
            };
            return [newSession, ...prev];
        }
    });
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
              return {
                  ...session,
                  messages: [...session.messages, newMessage],
                  lastMessage: text,
                  lastMessageTime: new Date(),
                  unreadCount: 0 // Admin replied, so we assume they read it. In a real app, unread logic is per user.
              };
          }
          return session;
      }));
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
            />} />
            <Route path="/shop" element={
              user ? <Marketplace addToCart={addToCart} products={products} formatPrice={formatPrice} /> : <Navigate to="/auth" />
            } />
            <Route path="/bestsellers" element={
               user ? <BestSellers addToCart={addToCart} products={products} formatPrice={formatPrice} /> : <Navigate to="/auth" />
            } />
            <Route path="/repair" element={
              user ? <RepairBooking formatPrice={formatPrice} /> : <Navigate to="/auth" />
            } />
            <Route path="/checkout" element={
              user ? <Checkout cart={cart} clearCart={clearCart} formatPrice={formatPrice} /> : <Navigate to="/auth" />
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
                        landingPageConfig={landingPageConfig}
                        onUpdateLandingPage={setLandingPageConfig}
                        contactInfo={contactInfo}
                        onUpdateContactInfo={setContactInfo}
                        contactMessages={contactMessages}
                     /> : <Navigate to="/auth" />
            } />
            <Route path="/settings" element={
              user ? <ProfileSettings user={user} onUpdate={handleUpdateUser} onLogout={handleLogout} /> : <Navigate to="/auth" />
            } />
            <Route path="/contact" element={<ContactUs contactInfo={contactInfo} onSendMessage={handleNewContactMessage} />} />
            <Route path="/about" element={<AboutUs />} />
          </Routes>
        </main>
        <Footer />
        
        {/* Support Chat Widget - Only for Customers/Fixers */}
        {user && user.role !== 'ADMIN' && (
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