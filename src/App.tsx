import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './services/firebase';
import { 
  getProductsFromNeon, saveProductToNeon, deleteProductFromNeon,
  getRepairsFromNeon, saveRepairToNeon,
  getOrdersFromNeon, saveOrderToNeon,
  getUsersFromNeon, saveUserToNeon, getUserFromNeon,
  getContactMessagesFromNeon,
  getChatSessionsFromNeon, saveChatSessionToNeon,
  getRepairChatsFromNeon, saveRepairChatToNeon
} from './services/neon';
import { generateChatResponse } from './services/geminiService';

import { 
  User, Product, CartItem, Order, RepairJob, 
  ChatSession, ChatMessage, LandingPageConfig, ContactInfo, ContactMessage, TeamMember 
} from './types';
import { 
  SEED_PRODUCTS, DEFAULT_LANDING_CONFIG, DEFAULT_CONTACT_INFO, DEFAULT_TEAM 
} from './constants';

// Pages
import { LandingPage } from './pages/LandingPage';
import { Marketplace } from './pages/Marketplace';
import { BestSellers } from './pages/BestSellers';
import { RepairBooking } from './pages/RepairBooking';
import { Checkout } from './pages/Checkout';
import { Dashboard } from './pages/Dashboard';
import { Auth } from './pages/Auth';
import { ProfileSettings } from './pages/ProfileSettings';
import { ContactUs } from './pages/ContactUs';
import { AboutUs } from './pages/AboutUs';

// Components
import { CartDrawer } from './components/CartDrawer';
import { SupportChatWidget } from './components/SupportChatWidget';
import { ShoppingBag } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Data State
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [repairs, setRepairs] = useState<RepairJob[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // CMS State
  const [landingConfig, setLandingConfig] = useState<LandingPageConfig>(DEFAULT_LANDING_CONFIG);
  const [contactInfo, setContactInfo] = useState<ContactInfo>(DEFAULT_CONTACT_INFO);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [team, setTeam] = useState<TeamMember[]>(DEFAULT_TEAM);

  // Chat State
  const [supportSessions, setSupportSessions] = useState<ChatSession[]>([]);
  const [userChatMessages, setUserChatMessages] = useState<ChatMessage[]>([]);
  const [repairChats, setRepairChats] = useState<Record<string, ChatMessage[]>>({});

  // Initialize Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          dbProducts, dbRepairs, dbOrders, dbUsers, 
          dbMessages, dbSessions, dbRepairChats
        ] = await Promise.all([
          getProductsFromNeon(),
          getRepairsFromNeon(),
          getOrdersFromNeon(),
          getUsersFromNeon(),
          getContactMessagesFromNeon(),
          getChatSessionsFromNeon(),
          getRepairChatsFromNeon()
        ]);

        if (dbProducts.length > 0) {
            // Map DB fields to TS interfaces if needed, assuming direct mapping for now
            // Need to parse JSON fields if they come as strings from Neon
            const parsedProducts = dbProducts.map((p: any) => ({
                ...p,
                specs: typeof p.specs === 'string' ? JSON.parse(p.specs) : p.specs
            }));
            setProducts(parsedProducts);
        }
        
        if (dbRepairs.length > 0) {
            const parsedRepairs = dbRepairs.map((r: any) => ({
                ...r,
                timeline: typeof r.timeline === 'string' ? JSON.parse(r.timeline) : r.timeline,
                attachments: typeof r.images === 'string' ? JSON.parse(r.images) : r.images,
                // map snake_case to camelCase
                deviceId: r.device_id,
                deviceType: r.device_type,
                issueDescription: r.issue_description,
                customerId: r.customer_id,
                fixerId: r.fixer_id,
                dateBooked: r.date_booked,
                estimatedCost: parseFloat(r.estimated_cost),
                aiDiagnosis: r.ai_diagnosis,
                deliveryMethod: r.delivery_method,
                pickupAddress: r.pickup_address,
                contactPhone: r.contact_phone,
                trackingNumber: r.tracking_number,
                isPaid: r.is_paid
            }));
            setRepairs(parsedRepairs);
        }

        if (dbOrders.length > 0) {
             const parsedOrders = dbOrders.map((o: any) => ({
                ...o,
                items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
                total: parseFloat(o.total)
            }));
            setOrders(parsedOrders);
        }

        if (dbUsers.length > 0) {
            const parsedUsers = dbUsers.map((u: any) => ({
                ...u,
                availabilityStatus: u.availability_status
            }));
            setUsers(parsedUsers);
        }

        // Repair Chats
        const chatMap: Record<string, ChatMessage[]> = {};
        dbRepairChats.forEach((chat: any) => {
            chatMap[chat.repair_id] = typeof chat.messages === 'string' ? JSON.parse(chat.messages) : chat.messages;
        });
        setRepairChats(chatMap);

        // Support Sessions (Admin View)
        const parsedSessions = dbSessions.map((s: any) => ({
            ...s,
            userId: s.user_id,
            userName: s.user_name,
            userAvatar: s.user_avatar,
            messages: typeof s.messages === 'string' ? JSON.parse(s.messages) : s.messages,
            unreadCount: s.unread_count,
            lastMessage: s.last_message,
            lastMessageTime: new Date(s.last_message_time)
        }));
        setSupportSessions(parsedSessions);

      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    };

    fetchData();
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch full user profile from Neon
        const dbUser = await getUserFromNeon(firebaseUser.uid);
        if (dbUser) {
            setUser({
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                role: dbUser.role as any,
                avatar: dbUser.avatar,
                bio: dbUser.bio,
                availabilityStatus: dbUser.availability_status as any,
                phone: dbUser.phone,
                address: dbUser.address
            });
        } else {
            // Fallback to basic firebase info if DB fetch fails or first login race condition
             setUser({
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'User',
                email: firebaseUser.email || '',
                role: firebaseUser.email === 'jesicar1100@gmail.com' ? 'SUPER_ADMIN' : 'CUSTOMER',
                avatar: firebaseUser.photoURL || '',
                availabilityStatus: 'ONLINE'
            });
        }
        
        // Load user's chat session
        const sessions = await getChatSessionsFromNeon(); // In real app, filter by user ID via API
        const mySession = sessions.find((s: any) => s.user_id === firebaseUser.uid);
        if (mySession) {
             const msgs = typeof mySession.messages === 'string' ? JSON.parse(mySession.messages) : mySession.messages;
             setUserChatMessages(msgs.map((m: any) => ({...m, timestamp: new Date(m.timestamp)})));
        }

      } else {
        setUser(null);
        setUserChatMessages([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handlers
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
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

  const updateCartQuantity = (id: string, delta: number) => {
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

  const handleBookRepair = async (repair: RepairJob) => {
    // Optimistic Update
    setRepairs(prev => [repair, ...prev]);
    // Save to DB
    await saveRepairToNeon({
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
        images: JSON.stringify(repair.attachments || []),
        timeline: JSON.stringify(repair.timeline || []),
        is_paid: repair.isPaid
    });
  };

  const handleUpdateRepair = async (updatedRepair: RepairJob) => {
      setRepairs(prev => prev.map(r => r.id === updatedRepair.id ? updatedRepair : r));
      await saveRepairToNeon({
        id: updatedRepair.id,
        device_id: updatedRepair.deviceId,
        device_type: updatedRepair.deviceType,
        issue_description: updatedRepair.issueDescription,
        status: updatedRepair.status,
        customer_id: updatedRepair.customerId,
        fixer_id: updatedRepair.fixerId,
        date_booked: updatedRepair.dateBooked,
        estimated_cost: updatedRepair.estimatedCost || 0,
        ai_diagnosis: updatedRepair.aiDiagnosis,
        delivery_method: updatedRepair.deliveryMethod,
        pickup_address: updatedRepair.pickupAddress,
        contact_phone: updatedRepair.contactPhone,
        images: JSON.stringify(updatedRepair.attachments || []),
        timeline: JSON.stringify(updatedRepair.timeline || []),
        is_paid: updatedRepair.isPaid,
        rating: updatedRepair.rating,
        review: updatedRepair.review
    });
  };

  const handlePlaceOrder = async (order: Order) => {
      setOrders(prev => [order, ...prev]);
      await saveOrderToNeon({
          id: order.id,
          date: order.date,
          total: order.total,
          status: order.status,
          items: JSON.stringify(order.items)
      });
  };

  const handleUpdateUser = async (updatedData: Partial<User>) => {
      if (!user) return;
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      // Update in DB
      await saveUserToNeon({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          avatar: newUser.avatar,
          bio: newUser.bio,
          availability_status: newUser.availabilityStatus,
          created_at: new Date().toISOString(), // won't overwrite due to conflict handler logic if needed, or pass original
          phone: newUser.phone,
          address: newUser.address
      });
      // Also update in users list if admin
      setUsers(prev => prev.map(u => u.id === newUser.id ? newUser : u));
  };

  const handleLogout = async () => {
      await signOut(auth);
      setUser(null);
      setCart([]);
  };

  // Chat Logic
  const handleSupportMessage = async (text: string) => {
      if (!user) return; // Must be logged in
      
      const newMessage: ChatMessage = {
          id: Date.now().toString(),
          senderId: user.id,
          text: text,
          timestamp: new Date()
      };

      const updatedMessages = [...userChatMessages, newMessage];
      setUserChatMessages(updatedMessages);

      // AI Response
      const aiReplyText = await generateChatResponse(updatedMessages, text);
      const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          senderId: 'ai_agent',
          text: aiReplyText,
          timestamp: new Date(),
          isSystem: true
      };
      
      const finalMessages = [...updatedMessages, aiMessage];
      setUserChatMessages(finalMessages);

      // Save Session
      const sessionData: any = {
          id: user.id, // simplified session ID = User ID
          user_id: user.id,
          user_name: user.name,
          user_avatar: user.avatar,
          messages: JSON.stringify(finalMessages),
          unread_count: 0,
          last_message: text,
          last_message_time: new Date().toISOString(),
          status: 'OPEN'
      };
      await saveChatSessionToNeon(sessionData);
  };

  // Repair Chat Logic
  const handleRepairMessage = async (repairId: string, text: string, senderId: string) => {
      const currentMessages = repairChats[repairId] || [];
      const newMessage: ChatMessage = {
          id: Date.now().toString(),
          senderId,
          text,
          timestamp: new Date()
      };
      const updatedMessages = [...currentMessages, newMessage];
      
      setRepairChats(prev => ({
          ...prev,
          [repairId]: updatedMessages
      }));

      await saveRepairChatToNeon({
          repair_id: repairId,
          messages: JSON.stringify(updatedMessages),
          last_message_at: new Date().toISOString()
      });
  };

  // Admin / Management Handlers
  const handleAddProduct = async (product: Product) => {
      setProducts(prev => [product, ...prev]);
      await saveProductToNeon({
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

  const handleUpdateProduct = async (product: Product) => {
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
      await saveProductToNeon({
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

  const handleDeleteProduct = async (id: string) => {
      setProducts(prev => prev.filter(p => p.id !== id));
      await deleteProductFromNeon(id);
  };

  // Routing Protection
  const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user) return <Navigate to="/auth" />;
    return <>{children}</>;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-silver-50 dark:bg-silver-950">Loading BLUCELL...</div>;

  return (
    <div className="min-h-screen bg-silver-50 dark:bg-silver-950 text-silver-900 dark:text-white font-sans transition-colors duration-300">
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<LandingPage config={landingConfig} team={team} contactInfo={contactInfo} />} />
            <Route path="/shop" element={<Marketplace addToCart={addToCart} products={products} formatPrice={formatPrice} />} />
            <Route path="/bestsellers" element={<BestSellers addToCart={addToCart} products={products} formatPrice={formatPrice} />} />
            <Route path="/repair" element={<RepairBooking formatPrice={formatPrice} user={user || undefined} onBookRepair={handleBookRepair} fixers={users.filter(u => u.role === 'FIXER')} repairs={repairs} />} />
            <Route path="/checkout" element={
              user ? <Checkout 
                        cart={cart} 
                        clearCart={clearCart} 
                        formatPrice={formatPrice}
                        onPlaceOrder={handlePlaceOrder}
                     /> 
                   : <Navigate to="/auth" />
            } />
            <Route path="/auth" element={<Auth onLogin={(u) => setUser(u)} />} />
            <Route path="/profile" element={
                <ProtectedRoute>
                    <ProfileSettings user={user!} onUpdate={handleUpdateUser} onLogout={handleLogout} />
                </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Dashboard 
                        user={user!}
                        onUpdateUser={handleUpdateUser}
                        products={products}
                        onAddProduct={handleAddProduct}
                        onUpdateProduct={handleUpdateProduct}
                        onDeleteProduct={handleDeleteProduct}
                        onUpdatePlatformSettings={() => {}}
                        formatPrice={formatPrice}
                        supportSessions={supportSessions}
                        onAdminReply={(sid, text) => {/* Implement admin reply logic */}}
                        onCreateSession={() => ""}
                        landingPageConfig={landingConfig}
                        onUpdateLandingPage={setLandingConfig}
                        contactInfo={contactInfo}
                        onUpdateContactInfo={setContactInfo}
                        contactMessages={contactMessages}
                        onDeleteContactMessage={(id) => setContactMessages(prev => prev.filter(m => m.id !== id))}
                        allUsers={users}
                        onAddUser={(u) => setUsers(prev => [...prev, u])}
                        onUpdateUserAdmin={(u) => setUsers(prev => prev.map(user => user.id === u.id ? u : user))}
                        allOrders={orders}
                        onUpdateOrder={(oid, status) => setOrders(prev => prev.map(o => o.id === oid ? {...o, status} : o))}
                        allRepairs={repairs}
                        onUpdateRepair={handleUpdateRepair}
                        platformLogo=""
                        team={team}
                        onUpdateTeam={setTeam}
                        repairChats={repairChats}
                        onSendRepairMessage={handleRepairMessage}
                    />
                </ProtectedRoute>
            } />
            <Route path="/contact" element={<ContactUs contactInfo={contactInfo} />} />
            <Route path="/about" element={<AboutUs team={team} />} />
        </Routes>

        <CartDrawer 
            isOpen={isCartOpen} 
            onClose={() => setIsCartOpen(false)} 
            cart={cart} 
            updateQuantity={updateCartQuantity} 
            removeItem={removeFromCart} 
            formatPrice={formatPrice} 
        />

        {/* Floating Cart Button for non-dashboard pages */}
        {!isCartOpen && cart.length > 0 && (
            <button 
                onClick={() => setIsCartOpen(true)}
                className="fixed bottom-24 right-6 z-40 p-4 bg-white dark:bg-silver-800 text-silver-900 dark:text-white rounded-full shadow-xl border border-silver-200 dark:border-silver-700 md:hidden"
            >
                <div className="relative">
                    <ShoppingBag className="w-6 h-6" />
                    <span className="absolute -top-2 -right-2 bg-blucell-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {cart.reduce((acc, i) => acc + i.quantity, 0)}
                    </span>
                </div>
            </button>
        )}

        {user && <SupportChatWidget messages={userChatMessages} onSendMessage={handleSupportMessage} currentUser={user} />}
      </BrowserRouter>
    </div>
  );
};

export default App;