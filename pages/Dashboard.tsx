import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, ChatMessage, Product, Order, UserRole, AvailabilityStatus, RepairJob, ChatSession } from '../types';
import { MOCK_REPAIRS, MOCK_ORDERS, MOCK_ALL_USERS, MOCK_ALL_ORDERS } from '../constants';
import { Card, Button, Badge, Input } from '../components/ui';
import { Package, Wrench, MessageSquare, MapPin, BarChart3, CheckCircle, Smartphone, User as UserIcon, MoreHorizontal, Plus, Trash2, Edit, Search, Users, ShoppingBag, LayoutDashboard, Settings, ChevronRight, LogOut, X, Save, Download, Filter, Circle, Upload, Star, Send, MessageCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useSearchParams } from 'react-router-dom';

const ADMIN_DATA = [
  { name: 'Mon', repairs: 12, sales: 2400 },
  { name: 'Tue', repairs: 19, sales: 1398 },
  { name: 'Wed', repairs: 15, sales: 9800 },
  { name: 'Thu', repairs: 22, sales: 3908 },
  { name: 'Fri', repairs: 30, sales: 4800 },
  { name: 'Sat', repairs: 10, sales: 3800 },
  { name: 'Sun', repairs: 5,  sales: 4300 },
];

interface DashboardProps {
  user: User;
  onUpdateUser: (data: Partial<User>) => void;
  // Admin Props
  products?: Product[];
  onAddProduct?: (product: Product) => void;
  onUpdateProduct?: (product: Product) => void;
  onDeleteProduct?: (id: string) => void;
  onUpdatePlatformSettings?: (settings: { logo?: string }) => void;
  formatPrice?: (price: number) => string;
  supportSessions?: ChatSession[];
  onAdminReply?: (sessionId: string, text: string) => void;
}

// --- Shared Components ---

const StatusIndicator = ({ status }: { status?: AvailabilityStatus }) => {
    if (!status) return null;
    const colors = {
        'ONLINE': 'text-green-500',
        'BUSY': 'text-red-500',
        'OFFLINE': 'text-slate-400'
    };
    return <Circle className={`w-3 h-3 fill-current ${colors[status]}`} />;
};

interface ChatWidgetProps {
    fixerName?: string;
    fixerStatus?: AvailabilityStatus;
    repairContext?: string;
    onClose?: () => void;
    isOpen?: boolean;
}

const ChatWidget = ({ fixerName, fixerStatus, repairContext, onClose, isOpen }: ChatWidgetProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', senderId: 'fixer', text: `Hello! I've been assigned to your repair: ${repairContext || 'Device'}. How can I help?`, timestamp: new Date(), isSystem: false }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if(!input.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'user',
      text: input,
      timestamp: new Date()
    };
    setMessages([...messages, newMsg]);
    setInput('');
    setTimeout(() => {
        setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            senderId: 'fixer',
            text: 'Thanks for the details. I will update you shortly.',
            timestamp: new Date()
        }])
    }, 1500);
  };

  if (!isOpen && onClose) return null;

  return (
    <Card className={`flex flex-col overflow-hidden shadow-2xl border-slate-200 dark:border-slate-800 ${onClose ? 'fixed bottom-4 right-4 w-96 h-[500px] z-50' : 'h-[500px]'}`}>
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="relative">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-slate-300" />
                </div>
                <div className="absolute bottom-0 right-0 p-0.5 bg-slate-900 rounded-full">
                    <StatusIndicator status={fixerStatus || 'ONLINE'} />
                </div>
            </div>
            <div>
                <h3 className="font-bold text-sm">{fixerName || 'Support Agent'}</h3>
                {repairContext && <p className="text-xs text-slate-400 truncate max-w-[150px]">{repairContext}</p>}
            </div>
        </div>
        {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
            </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-slate-950">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.senderId === 'user' ? 'bg-blucell-600 text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-800 dark:text-slate-100 rounded-bl-none'}`}>
              <p className="text-sm">{msg.text}</p>
              <span className="text-[10px] opacity-70 block mt-1 text-right">{msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex gap-2">
        <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1"
        />
        <Button onClick={handleSend} size="sm" className="px-3">
            <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

// --- Admin Views ---

const AdminDashboard = ({ 
    user, 
    products = [], 
    onAddProduct, 
    onUpdateProduct, 
    onDeleteProduct,
    onUpdatePlatformSettings,
    formatPrice = (p) => `$${p}`,
    supportSessions = [],
    onAdminReply
}: DashboardProps) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [replyInput, setReplyInput] = useState('');
    const replyEndRef = useRef<HTMLDivElement>(null);
    
    // Admin Data State
    const [users, setUsers] = useState<User[]>(MOCK_ALL_USERS);
    const [orders, setOrders] = useState<Order[]>(MOCK_ALL_ORDERS);
    const [searchTerm, setSearchTerm] = useState('');
    const [settings, setSettings] = useState({ 
        platformName: 'BLUCELL', 
        supportEmail: 'support@blucell.com', 
        maintenanceMode: false,
        platformLogo: localStorage.getItem('platform_logo') || ''
    });
    
    // Modal State
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

    // Add User State
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [newUserData, setNewUserData] = useState({ name: '', email: '', role: 'CUSTOMER' as UserRole });

    // --- Actions ---

    useEffect(() => {
        if (selectedSessionId) {
            replyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedSessionId, supportSessions]);

    const handleSendReply = () => {
        if (!replyInput.trim() || !selectedSessionId) return;
        onAdminReply?.(selectedSessionId, replyInput);
        setReplyInput('');
    };

    const handleDeleteProduct = (id: string) => {
        if(confirm('Are you sure you want to delete this product?')) {
            onDeleteProduct?.(id);
        }
    };

    const handleSaveProduct = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        if (editingProduct.id) {
            // Update
            onUpdateProduct?.(editingProduct as Product);
        } else {
            // Create
            const newProduct: Product = {
                ...editingProduct,
                id: Date.now().toString(),
                rating: 0,
                reviews: 0,
                specs: {},
                image: editingProduct.image || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=800',
                status: editingProduct.status || 'IN_STOCK',
            } as Product;
            onAddProduct?.(newProduct);
        }
        setIsProductModalOpen(false);
        setEditingProduct(null);
    };

    const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditingProduct(prev => ({
                    ...prev,
                    image: reader.result as string
                }));
            };
            reader.readAsDataURL(file);
        }
    };

     const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setSettings(prev => ({ ...prev, platformLogo: result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveSettings = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdatePlatformSettings?.({ logo: settings.platformLogo });
        alert('Settings Saved!');
    };

    const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        setEditingUser(null);
    };

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        const newUser: User = {
            id: Date.now().toString(),
            name: newUserData.name,
            email: newUserData.email,
            role: newUserData.role,
            avatar: `https://ui-avatars.com/api/?name=${newUserData.name}&background=random`,
        };
        setUsers(prev => [newUser, ...prev]);
        setIsAddUserModalOpen(false);
        setNewUserData({ name: '', email: '', role: 'CUSTOMER' });
    };

    const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        if (viewingOrder) setViewingOrder(prev => prev ? { ...prev, status } : null);
    };

    const handleExportCSV = () => {
        const headers = ['Order ID', 'Date', 'Total', 'Status', 'Items'];
        const rows = orders.map(o => [
            o.id, 
            o.date, 
            o.total.toFixed(2), 
            o.status, 
            o.items.map(i => `${i.quantity}x ${i.productName}`).join('; ')
        ]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "blucell_orders.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Computed ---
    const filteredProducts = useMemo(() => products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    ), [products, searchTerm]);

    const filteredUsers = useMemo(() => users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    ), [users, searchTerm]);

    const selectedSession = supportSessions.find(s => s.id === selectedSessionId);

    // --- Components ---

    const SidebarItem = ({ id, icon: Icon, label }: any) => (
        <button
            onClick={() => { setActiveTab(id); setSearchTerm(''); }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg ${
                activeTab === id 
                ? 'bg-blucell-600 text-white shadow-lg shadow-blucell-500/20' 
                : 'text-silver-600 dark:text-silver-400 hover:bg-silver-100 dark:hover:bg-silver-800'
            }`}
        >
            <Icon className="w-5 h-5" />
            {label}
        </button>
    );

    const Modal = ({ title, onClose, children }: { title: string, onClose: () => void, children: React.ReactNode }) => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-silver-surface-light dark:bg-silver-surface-dark rounded-xl shadow-2xl max-w-lg w-full p-6 animate-scale-up border border-silver-200 dark:border-silver-800 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-silver-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-silver-100 dark:hover:bg-silver-800 rounded-full text-silver-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );

    const renderOverview = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-l-4 border-l-green-500">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-sm text-silver-500 font-medium uppercase tracking-wider">Total Revenue</p>
                            <h3 className="text-3xl font-bold text-silver-900 dark:text-white mt-1">
                                {formatPrice(orders.reduce((acc, curr) => acc + curr.total, 0))}
                            </h3>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </Card>
                <Card className="p-6 border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-sm text-silver-500 font-medium uppercase tracking-wider">Active Repairs</p>
                            <h3 className="text-3xl font-bold text-silver-900 dark:text-white mt-1">142</h3>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <Wrench className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </Card>
                <Card className="p-6 border-l-4 border-l-purple-500">
                     <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-sm text-silver-500 font-medium uppercase tracking-wider">Total Users</p>
                            <h3 className="text-3xl font-bold text-silver-900 dark:text-white mt-1">{users.length}</h3>
                        </div>
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                            <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-6 h-[400px]">
                    <h3 className="text-lg font-bold mb-6 text-silver-900 dark:text-white">Performance Analytics</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ADMIN_DATA}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.3} />
                            <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                                cursor={{ fill: 'transparent' }}
                            />
                            <Bar dataKey="sales" fill="#ea580c" radius={[4, 4, 0, 0]} name="Sales ($)" />
                            <Bar dataKey="repairs" fill="#6366f1" radius={[4, 4, 0, 0]} name="Repairs (#)" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4 text-silver-900 dark:text-white">Recent Activity</h3>
                    <div className="space-y-4">
                        {users.slice(0, 5).map((u, i) => (
                            <div key={i} className="flex gap-3 items-start pb-4 border-b border-silver-100 dark:border-silver-800 last:border-0 last:pb-0">
                                <div className="w-8 h-8 rounded-full bg-silver-100 dark:bg-silver-800 flex items-center justify-center shrink-0">
                                    <UserIcon className="w-4 h-4 text-silver-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-silver-900 dark:text-white">{u.name} joined</p>
                                    <p className="text-xs text-silver-500">2 minutes ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );

    const renderSupport = () => (
        <div className="flex h-[calc(100vh-10rem)] border border-silver-200 dark:border-silver-800 rounded-xl overflow-hidden bg-silver-surface-light dark:bg-silver-surface-dark animate-fade-in">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-silver-200 dark:border-silver-800 overflow-y-auto">
                <div className="p-4 border-b border-silver-200 dark:border-silver-800 bg-silver-50 dark:bg-silver-800/50">
                    <h3 className="font-bold text-silver-900 dark:text-white mb-2">Inbox</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-400" />
                        <input 
                            placeholder="Search..." 
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-silver-200 dark:border-silver-700 bg-white dark:bg-silver-900 focus:outline-none focus:ring-2 focus:ring-blucell-500"
                        />
                    </div>
                </div>
                <div className="divide-y divide-silver-100 dark:divide-silver-800">
                    {supportSessions.map(session => (
                        <div 
                            key={session.id}
                            onClick={() => setSelectedSessionId(session.id)}
                            className={`p-4 hover:bg-silver-100 dark:hover:bg-silver-800/50 cursor-pointer transition-colors ${selectedSessionId === session.id ? 'bg-silver-100 dark:bg-silver-800' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img src={session.userAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                        {session.unreadCount > 0 && (
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-silver-900"></div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className={`text-sm font-semibold ${session.unreadCount > 0 ? 'text-black dark:text-white' : 'text-silver-700 dark:text-silver-300'}`}>{session.userName}</h4>
                                        <p className="text-xs text-silver-500 truncate max-w-[140px]">{session.lastMessage}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] text-silver-400 whitespace-nowrap">
                                    {new Date(session.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-silver-950">
                {selectedSession ? (
                    <>
                        <div className="p-4 border-b border-silver-200 dark:border-silver-800 flex justify-between items-center bg-silver-50 dark:bg-silver-900/50">
                            <div className="flex items-center gap-3">
                                <img src={selectedSession.userAvatar} alt="" className="w-8 h-8 rounded-full" />
                                <div>
                                    <h3 className="font-bold text-silver-900 dark:text-white">{selectedSession.userName}</h3>
                                    <p className="text-xs text-silver-500">Customer</p>
                                </div>
                            </div>
                            <Button size="sm" variant="outline">View Profile</Button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {selectedSession.messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.senderId === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                                        msg.senderId === 'admin' 
                                        ? 'bg-blucell-600 text-white rounded-br-none' 
                                        : 'bg-silver-100 dark:bg-silver-800 text-silver-900 dark:text-silver-100 rounded-bl-none'
                                    }`}>
                                        <p className="text-sm leading-relaxed">{msg.text}</p>
                                        <span className={`text-[10px] block mt-1 text-right ${msg.senderId === 'admin' ? 'text-blucell-100' : 'text-silver-400'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <div ref={replyEndRef} />
                        </div>

                        <div className="p-4 border-t border-silver-200 dark:border-silver-800 bg-silver-50 dark:bg-silver-900/50">
                            <div className="flex gap-2">
                                <input 
                                    className="flex-1 bg-white dark:bg-silver-800 border border-silver-200 dark:border-silver-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blucell-500 text-silver-900 dark:text-white"
                                    placeholder="Type your reply..."
                                    value={replyInput}
                                    onChange={(e) => setReplyInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                                />
                                <Button onClick={handleSendReply}>
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-silver-400 p-8 text-center">
                        <div className="w-16 h-16 bg-silver-100 dark:bg-silver-800 rounded-full flex items-center justify-center mb-4">
                            <MessageCircle className="w-8 h-8 text-silver-300" />
                        </div>
                        <h3 className="text-lg font-bold text-silver-900 dark:text-white">Select a conversation</h3>
                        <p className="max-w-xs mx-auto">Choose a chat from the left sidebar to start messaging.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderProducts = () => (
         <div className="space-y-6 animate-fade-in">
             <div className="flex flex-col sm:flex-row justify-between gap-4">
                 <div className="relative w-full max-w-md">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-400" />
                     <Input 
                        placeholder="Search inventory..." 
                        className="pl-10" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
                 <Button className="flex items-center gap-2" onClick={() => { setEditingProduct({}); setIsProductModalOpen(true); }}>
                     <Plus className="w-4 h-4" /> Add Product
                 </Button>
             </div>
             
             <Card className="overflow-hidden">
                 <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm">
                         <thead className="bg-silver-100 dark:bg-silver-800/50 text-silver-500 border-b border-silver-200 dark:border-silver-800">
                             <tr>
                                 <th className="p-4 font-medium">Product Name</th>
                                 <th className="p-4 font-medium">Category</th>
                                 <th className="p-4 font-medium">Price</th>
                                 <th className="p-4 font-medium">Status</th>
                                 <th className="p-4 font-medium text-right">Actions</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-silver-100 dark:divide-silver-800">
                             {filteredProducts.map(product => (
                                 <tr key={product.id} className="hover:bg-silver-50 dark:hover:bg-silver-800/50 transition-colors">
                                     <td className="p-4 flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-lg bg-silver-100 dark:bg-silver-800 flex items-center justify-center overflow-hidden">
                                             <img src={product.image} className="w-full h-full object-cover" alt="" />
                                         </div>
                                         <div className="flex flex-col">
                                            <span className="font-medium text-silver-900 dark:text-white">{product.name}</span>
                                            {product.isBestSeller && (
                                                <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold uppercase tracking-wider mt-0.5">
                                                    <Star className="w-3 h-3 fill-current" /> Best Seller
                                                </div>
                                            )}
                                         </div>
                                     </td>
                                     <td className="p-4 text-silver-500">{product.category}</td>
                                     <td className="p-4 font-medium text-silver-900 dark:text-white">{formatPrice(product.price)}</td>
                                     <td className="p-4">
                                         <Badge color={product.status === 'OUT_OF_STOCK' ? 'red' : 'green'}>
                                             {product.status === 'OUT_OF_STOCK' ? 'Out of Stock' : 'In Stock'}
                                         </Badge>
                                     </td>
                                     <td className="p-4">
                                         <div className="flex justify-end items-center gap-2">
                                             <button 
                                                onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }}
                                                className="p-2 hover:bg-silver-200 dark:hover:bg-silver-700 rounded-full transition-colors"
                                             >
                                                <Edit className="w-4 h-4 text-silver-500" />
                                             </button>
                                             <button 
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
                                             >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                             </button>
                                         </div>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             </Card>

            {isProductModalOpen && (
                <Modal title={editingProduct?.id ? 'Edit Product' : 'Add New Product'} onClose={() => setIsProductModalOpen(false)}>
                    <form onSubmit={handleSaveProduct} className="space-y-4">
                        <Input 
                            label="Product Name" 
                            value={editingProduct?.name || ''} 
                            onChange={e => setEditingProduct(prev => ({...prev, name: e.target.value}))}
                            required
                        />
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-silver-700 dark:text-silver-300 mb-1">Category</label>
                                <select 
                                    className="w-full rounded-lg border border-silver-300 dark:border-silver-700 bg-white dark:bg-silver-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blucell-500 text-silver-900 dark:text-silver-100"
                                    value={editingProduct?.category || 'Phone'}
                                    onChange={e => setEditingProduct(prev => ({...prev, category: e.target.value as any}))}
                                >
                                    {['Phone', 'Laptop', 'Audio', 'Camera', 'Gaming', 'Drone', 'Others'].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-silver-700 dark:text-silver-300 mb-1">Status</label>
                                <select 
                                    className="w-full rounded-lg border border-silver-300 dark:border-silver-700 bg-white dark:bg-silver-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blucell-500 text-silver-900 dark:text-silver-100"
                                    value={editingProduct?.status || 'IN_STOCK'}
                                    onChange={e => setEditingProduct(prev => ({...prev, status: e.target.value as any}))}
                                >
                                    <option value="IN_STOCK">In Stock</option>
                                    <option value="OUT_OF_STOCK">Out of Stock</option>
                                </select>
                            </div>
                        </div>
                         
                         {/* Best Seller Checkbox */}
                        <div className="flex items-center gap-2 p-3 bg-silver-50 dark:bg-silver-800 rounded-lg">
                            <input 
                                type="checkbox" 
                                id="isBestSeller"
                                checked={editingProduct?.isBestSeller || false}
                                onChange={e => setEditingProduct(prev => ({...prev, isBestSeller: e.target.checked}))}
                                className="w-4 h-4 text-blucell-600 rounded border-silver-300 focus:ring-blucell-500"
                            />
                            <label htmlFor="isBestSeller" className="text-sm font-medium text-silver-900 dark:text-silver-100 flex items-center gap-1">
                                <Star className="w-4 h-4 text-amber-500 fill-current" />
                                Mark as Best Seller
                            </label>
                        </div>

                        <Input 
                            label="Price ($)" 
                            type="number" 
                            value={editingProduct?.price || ''} 
                            onChange={e => setEditingProduct(prev => ({...prev, price: Number(e.target.value)}))}
                            required
                        />
                        
                        {/* Image Upload / URL Section */}
                        <div className="space-y-2">
                           <label className="block text-sm font-medium text-silver-700 dark:text-silver-300">Product Image</label>
                           <div className="flex gap-4 items-start">
                             <div className="flex-1">
                                <div className="relative">
                                    <Input 
                                        placeholder="Paste image URL or use upload button" 
                                        value={editingProduct?.image || ''} 
                                        onChange={e => setEditingProduct(prev => ({...prev, image: e.target.value}))}
                                        className="pr-24" 
                                    />
                                    <div className="absolute right-1 top-1 bottom-1">
                                        <label className="flex items-center justify-center px-3 h-full bg-silver-100 dark:bg-silver-800 hover:bg-silver-200 dark:hover:bg-silver-700 rounded text-xs font-medium cursor-pointer transition-colors border-l border-silver-200 dark:border-silver-700 text-silver-700 dark:text-silver-300">
                                            <Upload className="w-3 h-3 mr-1" /> Upload
                                            <input type="file" className="hidden" accept="image/*" onChange={handleProductImageUpload} />
                                        </label>
                                    </div>
                                </div>
                             </div>
                             {editingProduct?.image && (
                                 <div className="w-10 h-10 rounded border border-silver-200 dark:border-silver-700 overflow-hidden shrink-0 bg-silver-50">
                                     <img src={editingProduct.image} alt="Preview" className="w-full h-full object-cover" />
                                 </div>
                             )}
                           </div>
                        </div>

                         <div>
                            <label className="block text-sm font-medium text-silver-700 dark:text-silver-300 mb-1">Description</label>
                            <textarea 
                                className="w-full rounded-lg border border-silver-300 dark:border-silver-700 bg-white dark:bg-silver-950 px-3 py-2 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-blucell-500 text-silver-900 dark:text-silver-100"
                                value={editingProduct?.description || ''} 
                                onChange={e => setEditingProduct(prev => ({...prev, description: e.target.value}))}
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsProductModalOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Product</Button>
                        </div>
                    </form>
                </Modal>
            )}
         </div>
    );

    const renderUsers = () => (
         <div className="space-y-6 animate-fade-in">
             <div className="flex flex-col sm:flex-row justify-between gap-4">
                 <div className="relative w-full max-w-md">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-400" />
                     <Input 
                        placeholder="Search users..." 
                        className="pl-10" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                 </div>
                 <Button className="flex items-center gap-2" onClick={() => setIsAddUserModalOpen(true)}>
                     <Plus className="w-4 h-4" /> Add User
                 </Button>
             </div>
             
             <Card className="overflow-hidden">
                 <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm">
                         <thead className="bg-silver-100 dark:bg-silver-800/50 text-silver-500 border-b border-silver-200 dark:border-silver-800">
                             <tr>
                                 <th className="p-4 font-medium">User Profile</th>
                                 <th className="p-4 font-medium">Role</th>
                                 <th className="p-4 font-medium">Status</th>
                                 <th className="p-4 font-medium text-right">Actions</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-silver-100 dark:divide-silver-800">
                             {filteredUsers.map(u => (
                                 <tr key={u.id} className="hover:bg-silver-50 dark:hover:bg-silver-800/50 transition-colors">
                                     <td className="p-4 flex items-center gap-3">
                                         <img src={u.avatar} className="w-9 h-9 rounded-full border border-silver-200 dark:border-silver-700" alt="" />
                                         <div>
                                            <p className="font-medium text-silver-900 dark:text-white">{u.name}</p>
                                            <p className="text-xs text-silver-500">{u.email}</p>
                                         </div>
                                     </td>
                                     <td className="p-4">
                                         <Badge color={u.role === 'ADMIN' ? 'red' : u.role === 'FIXER' ? 'blue' : 'green'}>{u.role}</Badge>
                                     </td>
                                     <td className="p-4"><span className="flex items-center gap-1.5 text-xs font-medium text-green-600"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Active</span></td>
                                     <td className="p-4 text-right">
                                         <Button size="sm" variant="ghost" onClick={() => setEditingUser(u)}>
                                            <MoreHorizontal className="w-4 h-4" />
                                         </Button>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             </Card>

             {/* Add User Modal */}
             {isAddUserModalOpen && (
                 <Modal title="Add New User" onClose={() => setIsAddUserModalOpen(false)}>
                     <form onSubmit={handleAddUser} className="space-y-4">
                         <Input 
                            label="Full Name" 
                            placeholder="John Doe" 
                            value={newUserData.name} 
                            onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
                            required
                         />
                         <Input 
                            label="Email Address" 
                            type="email" 
                            placeholder="john@example.com" 
                            value={newUserData.email} 
                            onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                            required
                         />
                         <div>
                             <label className="block text-sm font-medium text-silver-700 dark:text-silver-300 mb-1">Role</label>
                             <select 
                                className="w-full rounded-lg border border-silver-300 dark:border-silver-700 bg-white dark:bg-silver-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blucell-500 text-silver-900 dark:text-silver-100"
                                value={newUserData.role}
                                onChange={(e) => setNewUserData({...newUserData, role: e.target.value as UserRole})}
                             >
                                 <option value="CUSTOMER">Customer</option>
                                 <option value="FIXER">Technician/Fixer</option>
                                 <option value="ADMIN">Admin</option>
                             </select>
                         </div>
                         <div className="flex justify-end gap-2 pt-4">
                             <Button type="button" variant="ghost" onClick={() => setIsAddUserModalOpen(false)}>Cancel</Button>
                             <Button type="submit">Create User</Button>
                         </div>
                     </form>
                 </Modal>
             )}

            {editingUser && (
                <Modal title="Manage User" onClose={() => setEditingUser(null)}>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 mb-6">
                            <img src={editingUser.avatar} className="w-16 h-16 rounded-full" alt="" />
                            <div>
                                <h4 className="font-bold text-lg text-silver-900 dark:text-white">{editingUser.name}</h4>
                                <p className="text-silver-500">{editingUser.email}</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-silver-700 dark:text-silver-300 mb-2">Change Role</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['CUSTOMER', 'FIXER', 'ADMIN'] as UserRole[]).map(role => (
                                    <button
                                        key={role}
                                        onClick={() => handleUpdateUserRole(editingUser.id, role)}
                                        className={`p-2 rounded-lg border text-sm font-medium transition-colors ${
                                            editingUser.role === role 
                                            ? 'bg-blucell-50 border-blucell-500 text-blucell-700 dark:bg-blucell-900/20 dark:text-blucell-300' 
                                            : 'border-silver-200 dark:border-silver-700 hover:bg-silver-50 dark:hover:bg-silver-800 text-silver-700 dark:text-silver-300'
                                        }`}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="pt-4 border-t border-silver-100 dark:border-silver-800">
                             <Button variant="danger" className="w-full">Deactivate Account</Button>
                        </div>
                    </div>
                </Modal>
            )}
         </div>
    );

    const renderOrders = () => (
         <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
                 <h2 className="text-xl font-bold text-silver-900 dark:text-white">All Orders</h2>
                 <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportCSV}>
                        <Download className="w-4 h-4 mr-2" /> Export CSV
                    </Button>
                    <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" /> Filter
                    </Button>
                 </div>
             </div>
             <Card className="overflow-hidden">
                 <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm">
                         <thead className="bg-silver-100 dark:bg-silver-800/50 text-silver-500 border-b border-silver-200 dark:border-silver-800">
                             <tr>
                                 <th className="p-4 font-medium">Order ID</th>
                                 <th className="p-4 font-medium">Items</th>
                                 <th className="p-4 font-medium">Total</th>
                                 <th className="p-4 font-medium">Date</th>
                                 <th className="p-4 font-medium">Status</th>
                                 <th className="p-4 font-medium text-right">Actions</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-silver-100 dark:divide-silver-800">
                             {orders.map(order => (
                                 <tr key={order.id} className="hover:bg-silver-50 dark:hover:bg-silver-800/50 transition-colors">
                                     <td className="p-4 font-medium text-silver-900 dark:text-white">{order.id}</td>
                                     <td className="p-4 text-silver-500 max-w-xs truncate">
                                        {order.items.map(i => i.productName).join(', ')}
                                     </td>
                                     <td className="p-4 font-bold text-silver-900 dark:text-white">${order.total.toLocaleString()}</td>
                                     <td className="p-4 text-silver-500">{new Date(order.date).toLocaleDateString()}</td>
                                     <td className="p-4">
                                         <Badge color={order.status === 'DELIVERED' ? 'green' : order.status === 'SHIPPED' ? 'blue' : 'yellow'}>{order.status}</Badge>
                                     </td>
                                     <td className="p-4 text-right">
                                         <Button size="sm" variant="ghost" onClick={() => setViewingOrder(order)}>Details</Button>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             </Card>

            {viewingOrder && (
                <Modal title={`Order Details: ${viewingOrder.id}`} onClose={() => setViewingOrder(null)}>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-silver-100 dark:bg-silver-800/50 p-4 rounded-lg">
                            <div>
                                <p className="text-sm text-silver-500">Total Amount</p>
                                <p className="text-2xl font-bold text-silver-900 dark:text-white">${viewingOrder.total.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-silver-500 text-right">Order Date</p>
                                <p className="font-medium text-silver-900 dark:text-white">{new Date(viewingOrder.date).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold mb-3 text-silver-900 dark:text-white">Items</h4>
                            <div className="space-y-3">
                                {viewingOrder.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <img src={item.image} className="w-12 h-12 rounded bg-silver-100 object-cover" alt="" />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm text-silver-900 dark:text-white">{item.productName}</p>
                                            <p className="text-xs text-silver-500">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold mb-3 text-silver-900 dark:text-white">Update Status</h4>
                            <div className="grid grid-cols-3 gap-2">
                                {(['PROCESSING', 'SHIPPED', 'DELIVERED'] as const).map(status => (
                                    <button
                                        key={status}
                                        onClick={() => handleUpdateOrderStatus(viewingOrder.id, status)}
                                        className={`p-2 rounded-lg border text-xs font-bold transition-colors ${
                                            viewingOrder.status === status 
                                            ? status === 'DELIVERED' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-blue-50 border-blue-500 text-blue-700'
                                            : 'border-silver-200 dark:border-silver-700 hover:bg-silver-50 dark:hover:bg-silver-800 text-silver-700 dark:text-silver-300'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
         </div>
    );

    const renderSettings = () => (
        <div className="space-y-6 animate-fade-in">
            <Card className="p-8 max-w-2xl">
                <h3 className="text-xl font-bold mb-6 text-silver-900 dark:text-white">Platform Settings</h3>
                <form className="space-y-4" onSubmit={handleSaveSettings}>
                    <Input 
                        label="Platform Name" 
                        value={settings.platformName} 
                        onChange={(e) => setSettings({...settings, platformName: e.target.value})} 
                    />
                    
                    <div className="space-y-2">
                       <label className="block text-sm font-medium text-silver-700 dark:text-silver-300">Platform Logo / Icon</label>
                       <div className="flex gap-4 items-center">
                         <div className="flex-1">
                            <div className="relative">
                                <Input 
                                    placeholder="Paste image URL or use upload button" 
                                    value={settings.platformLogo || ''} 
                                    onChange={e => setSettings({...settings, platformLogo: e.target.value})}
                                    className="pr-24" 
                                />
                                <div className="absolute right-1 top-1 bottom-1">
                                    <label className="flex items-center justify-center px-3 h-full bg-silver-100 dark:bg-silver-800 hover:bg-silver-200 dark:hover:bg-silver-700 rounded text-xs font-medium cursor-pointer transition-colors border-l border-silver-200 dark:border-silver-700 text-silver-700 dark:text-silver-300">
                                        <Upload className="w-3 h-3 mr-1" /> Upload
                                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                    </label>
                                </div>
                            </div>
                         </div>
                         <div className="w-12 h-12 rounded-lg border border-silver-200 dark:border-silver-700 overflow-hidden shrink-0 bg-silver-50 flex items-center justify-center">
                             {settings.platformLogo ? (
                                 <img src={settings.platformLogo} alt="Logo" className="w-full h-full object-cover" />
                             ) : (
                                 <Wrench className="w-6 h-6 text-silver-400" />
                             )}
                         </div>
                       </div>
                       <p className="text-xs text-silver-500">This logo will be displayed in the navigation bar.</p>
                    </div>

                    <Input 
                        label="Support Email" 
                        value={settings.supportEmail} 
                        onChange={(e) => setSettings({...settings, supportEmail: e.target.value})} 
                    />
                    <div className="flex items-center justify-between p-4 bg-silver-50 dark:bg-silver-800 rounded-lg">
                        <div>
                            <h4 className="font-medium text-silver-900 dark:text-white">Maintenance Mode</h4>
                            <p className="text-sm text-silver-500">Disable customer access temporarily</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={settings.maintenanceMode}
                                onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                            />
                            <div className="w-11 h-6 bg-silver-200 peer-focus:outline-none rounded-full peer dark:bg-silver-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blucell-600"></div>
                        </label>
                    </div>
                    <div className="pt-4">
                        <Button type="submit" className="flex items-center gap-2">
                            <Save className="w-4 h-4" /> Save Changes
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] -m-4 md:-m-8">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-silver-surface-light dark:bg-silver-surface-dark border-r border-silver-200 dark:border-silver-800 p-4 flex flex-col gap-2 shrink-0">
                <div className="mb-6 px-4">
                    <span className="text-xs font-bold text-silver-400 uppercase tracking-wider">Admin Console</span>
                    <h2 className="text-lg font-bold text-silver-900 dark:text-white">Dashboard</h2>
                </div>
                
                <SidebarItem id="overview" icon={LayoutDashboard} label="Overview" />
                <SidebarItem id="products" icon={Package} label="Products" />
                <SidebarItem id="users" icon={Users} label="Users" />
                <SidebarItem id="orders" icon={ShoppingBag} label="Orders" />
                <SidebarItem id="support" icon={MessageCircle} label="Support" />
                
                <div className="mt-auto pt-4 border-t border-silver-100 dark:border-silver-800">
                    <SidebarItem id="settings" icon={Settings} label="Settings" />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-transparent">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-silver-900 dark:text-white capitalize">{activeTab}</h1>
                        <p className="text-silver-500">Welcome back, {user.name}. Here's what's happening today.</p>
                    </div>
                    
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'products' && renderProducts()}
                    {activeTab === 'users' && renderUsers()}
                    {activeTab === 'orders' && renderOrders()}
                    {activeTab === 'support' && renderSupport()}
                    {activeTab === 'settings' && renderSettings()}
                </div>
            </div>
        </div>
    );
};

// --- Customer/Fixer Shared View Wrapper ---

const StandardDashboard = ({ user, onUpdateUser, formatPrice = (p) => `$${p}` }: { user: User, onUpdateUser: (data: Partial<User>) => void, formatPrice?: (p: number) => string }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [fixerRepairs, setFixerRepairs] = useState(MOCK_REPAIRS);
    const [searchParams] = useSearchParams();
    const [selectedRepairForChat, setSelectedRepairForChat] = useState<RepairJob | null>(null);

    // Check for chat params on mount
    useEffect(() => {
        const chatRepairId = searchParams.get('chatRepairId');
        if (chatRepairId) {
            // Find existing or mock new one if from recent booking
            const repair = MOCK_REPAIRS.find(r => r.id === chatRepairId) || {
                id: chatRepairId,
                deviceType: 'New Repair Booking',
                fixerId: 'f1', // Default to Mike Ross
                status: 'PENDING',
                issueDescription: 'Newly booked repair'
            } as RepairJob;
            
            setSelectedRepairForChat(repair);
        }
    }, [searchParams]);

    const handleStatusUpdate = (id: string, newStatus: any) => {
        setFixerRepairs(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    };

    const handleAvailabilityChange = (newStatus: AvailabilityStatus) => {
        onUpdateUser({ availabilityStatus: newStatus });
    };

    const openChat = (repair: RepairJob) => {
        setSelectedRepairForChat(repair);
    };

    const renderFixerView = () => (
        <div className="space-y-6 animate-fade-in-up">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
             <div>
                <h2 className="text-2xl font-bold text-silver-900 dark:text-white">Assigned Jobs</h2>
                <p className="text-silver-500">Manage your active repair tickets.</p>
             </div>
             <div className="flex items-center gap-3 bg-silver-surface-light dark:bg-silver-surface-dark p-2 rounded-lg border border-silver-200 dark:border-silver-800">
                <span className="text-sm font-medium pl-2 text-silver-900 dark:text-silver-100">Status:</span>
                <div className="flex gap-1">
                    {(['ONLINE', 'BUSY', 'OFFLINE'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => handleAvailabilityChange(status)}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                                user.availabilityStatus === status || (!user.availabilityStatus && status === 'ONLINE')
                                ? status === 'ONLINE' ? 'bg-green-100 text-green-700' : status === 'BUSY' ? 'bg-red-100 text-red-700' : 'bg-silver-100 text-silver-700'
                                : 'hover:bg-silver-50 dark:hover:bg-silver-800 text-silver-400'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
             </div>
          </div>
    
          <div className="grid gap-6">
             {fixerRepairs.map(job => (
                <Card key={job.id} className="p-6 border-l-4 border-l-blucell-600">
                   <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1 space-y-4">
                         <div className="flex items-start justify-between">
                            <div>
                               <h4 className="font-bold text-lg flex items-center gap-2 text-silver-900 dark:text-white">
                                  {job.deviceType}
                               </h4>
                               <p className="text-sm text-silver-500 mt-1">Ticket #{job.id} • {new Date(job.dateBooked).toLocaleDateString()}</p>
                            </div>
                            <Badge color={job.status === 'COMPLETED' ? 'green' : job.status === 'IN_PROGRESS' ? 'blue' : 'yellow'}>{job.status}</Badge>
                         </div>
                         
                         <div className="bg-silver-50 dark:bg-silver-900/50 p-4 rounded-lg">
                            <p className="text-sm font-semibold text-silver-700 dark:text-silver-300 mb-1">Issue Description:</p>
                            <p className="text-silver-600 dark:text-silver-400">{job.issueDescription}</p>
                         </div>
    
                         {job.aiDiagnosis && (
                            <div className="flex gap-2 text-sm text-blucell-600 bg-blucell-50 dark:bg-blucell-900/10 p-2 rounded border border-blucell-100 dark:border-blucell-900">
                               <CheckCircle className="w-4 h-4 mt-0.5" />
                               <span><strong>AI Note:</strong> {job.aiDiagnosis}</span>
                            </div>
                         )}
                      </div>
    
                      <div className="flex flex-col gap-3 min-w-[200px] border-t md:border-t-0 md:border-l border-silver-100 dark:border-silver-800 pt-4 md:pt-0 md:pl-6">
                         <p className="font-semibold text-sm mb-2 text-silver-900 dark:text-white">Actions</p>
                         {job.status === 'PENDING' && (
                            <Button size="sm" onClick={() => handleStatusUpdate(job.id, 'DIAGNOSING')}>Start Diagnostics</Button>
                         )}
                         {job.status === 'DIAGNOSING' && (
                            <Button size="sm" onClick={() => handleStatusUpdate(job.id, 'IN_PROGRESS')}>Start Repair</Button>
                         )}
                         {job.status === 'IN_PROGRESS' && (
                            <Button size="sm" onClick={() => handleStatusUpdate(job.id, 'COMPLETED')} className="bg-green-600 hover:bg-green-700">Mark Completed</Button>
                         )}
                         {job.status === 'COMPLETED' && (
                            <Button size="sm" variant="outline" disabled>Awaiting Delivery</Button>
                         )}
                         <Button size="sm" variant="secondary" onClick={() => openChat(job)}>Contact Customer</Button>
                         <Button size="sm" variant="ghost">View Full Details</Button>
                      </div>
                   </div>
                </Card>
             ))}
          </div>
        </div>
    );

    const renderCustomerOverview = () => (
        <div className="space-y-6 animate-fade-in-up">
          {/* Quick Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6 bg-gradient-to-br from-blucell-600 to-blucell-800 text-white border-none">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blucell-100 mb-1">Active Repair</p>
                  <h3 className="text-2xl font-bold">iPhone 13 Pro Max</h3>
                  <p className="text-sm text-blucell-200 mt-2">Status: Diagnosing</p>
                </div>
                <div className="p-3 bg-white/10 rounded-full">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-6">
                <div className="w-full bg-black/20 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
                <div className="flex justify-between text-xs mt-2 text-blucell-100">
                  <span>Received</span>
                  <span>Diagnostics</span>
                  <span className="opacity-50">Repair</span>
                  <span className="opacity-50">Delivery</span>
                </div>
              </div>
            </Card>
    
            <Card className="p-6">
               <div className="flex justify-between items-start">
                <div>
                  <p className="text-silver-500 dark:text-silver-400 mb-1">Next Delivery</p>
                  <h3 className="text-2xl font-bold text-silver-900 dark:text-white">Sony XM5 Headphones</h3>
                  <p className="text-sm text-silver-500 mt-2 flex items-center gap-1">
                     <MapPin className="w-4 h-4" /> Arriving Tomorrow
                  </p>
                </div>
                 <div className="p-3 bg-silver-100 dark:bg-silver-800 rounded-full">
                  <Package className="w-6 h-6 text-silver-900 dark:text-white" />
                </div>
              </div>
              <Button variant="outline" className="w-full mt-6">Track Order</Button>
            </Card>
          </div>
    
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                 <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-silver-900 dark:text-white">Repair History</h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('repairs')}>View All</Button>
                 </div>
                 {MOCK_REPAIRS.slice(0, 3).map(repair => (
                     <Card key={repair.id} className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('repairs')}>
                        <div className="w-12 h-12 rounded-lg bg-silver-100 dark:bg-silver-800 flex items-center justify-center">
                            <Wrench className="w-6 h-6 text-silver-600" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-silver-900 dark:text-white">{repair.deviceType}</h4>
                            <p className="text-sm text-silver-500 line-clamp-1">{repair.issueDescription}</p>
                        </div>
                        <Badge color={repair.status === 'COMPLETED' ? 'green' : 'yellow'}>{repair.status}</Badge>
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openChat(repair); }} className="rounded-full w-8 h-8 p-0">
                            <MessageSquare className="w-4 h-4 text-blucell-600" />
                        </Button>
                     </Card>
                 ))}
            </div>
            <div className="lg:col-span-1">
                {/* Active Chat or General Support */}
                <ChatWidget 
                    isOpen={true}
                    fixerName={MOCK_ALL_USERS.find(u => u.role === 'FIXER')?.name} 
                    fixerStatus={MOCK_ALL_USERS.find(u => u.role === 'FIXER')?.availabilityStatus}
                />
            </div>
          </div>
        </div>
    );

    const renderCustomerRepairs = () => (
        <div className="space-y-6 animate-fade-in-up">
           <div className="flex justify-between items-center mb-6">
             <div>
                <h2 className="text-2xl font-bold text-silver-900 dark:text-white">My Repairs</h2>
                <p className="text-silver-500">Manage ongoing and past repairs</p>
             </div>
             <Button onClick={() => window.location.hash = '#/repair'}>
                <Wrench className="w-4 h-4 mr-2" /> Book Repair
             </Button>
          </div>
    
          <div className="grid gap-4">
              {MOCK_REPAIRS.map(repair => {
                const assignedFixer = MOCK_ALL_USERS.find(u => u.id === repair.fixerId);
                return (
                    <Card key={repair.id} className="p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 rounded-xl bg-blucell-50 dark:bg-blucell-900/20 flex items-center justify-center shrink-0">
                        <Smartphone className="w-8 h-8 text-blucell-600" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                                <div>
                                <h4 className="font-bold text-lg text-silver-900 dark:text-white">{repair.deviceType}</h4>
                                <p className="text-sm text-silver-500">Booked on {new Date(repair.dateBooked).toLocaleDateString()}</p>
                                </div>
                                <Badge color={repair.status === 'COMPLETED' ? 'green' : 'yellow'}>{repair.status}</Badge>
                        </div>
                        <p className="text-silver-600 dark:text-silver-300 mb-4">{repair.issueDescription}</p>
                        
                        {repair.aiDiagnosis && (
                            <div className="bg-silver-50 dark:bg-silver-800 p-3 rounded-lg mb-4 text-sm">
                                <span className="font-bold text-blucell-600">AI Diagnosis:</span> {repair.aiDiagnosis}
                            </div>
                        )}
    
                        <div className="flex items-center gap-6 text-sm text-silver-500 border-t border-silver-100 dark:border-silver-800 pt-4">
                            {repair.estimatedCost && (
                                <span className="flex items-center gap-1">
                                    <span className="font-medium text-silver-900 dark:text-white">Est. Cost:</span> {formatPrice(repair.estimatedCost)}
                                </span>
                            )}
                            {assignedFixer && (
                                <span className="flex items-center gap-1.5">
                                    <span className="font-medium text-silver-900 dark:text-white">Technician:</span> 
                                    {assignedFixer.name.split(' ')[0]}
                                    <StatusIndicator status={assignedFixer.availabilityStatus || 'OFFLINE'} />
                                    <span className="text-xs text-silver-400">({assignedFixer.availabilityStatus || 'Offline'})</span>
                                </span>
                            )}
                             <span className="flex items-center gap-2 ml-auto">
                                    <Button variant="secondary" size="sm" onClick={() => openChat(repair)}>
                                        <MessageSquare className="w-4 h-4 mr-2" /> Chat
                                    </Button>
                                    <Button variant="outline" size="sm">View Details</Button>
                                </span>
                        </div>
                    </div>
                    </Card>
                );
              })}
          </div>
        </div>
    );

    const renderCustomerOrders = () => (
        <div className="space-y-6 animate-fade-in-up">
           <div className="flex justify-between items-center mb-6">
             <div>
                <h2 className="text-2xl font-bold text-silver-900 dark:text-white">Order History</h2>
                <p className="text-silver-500">Track and view past purchases</p>
             </div>
             <Button onClick={() => window.location.hash = '#/shop'}>
                <Package className="w-4 h-4 mr-2" /> Browse Shop
             </Button>
          </div>
    
          <div className="grid gap-4">
            {MOCK_ORDERS.map(order => (
                 <Card key={order.id} className="overflow-hidden">
                    <div className="bg-silver-50 dark:bg-silver-800/50 p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-silver-100 dark:border-silver-800">
                        <div className="flex gap-6 text-sm">
                            <div>
                                <p className="text-silver-500">Order Placed</p>
                                <p className="font-semibold text-silver-900 dark:text-white">{new Date(order.date).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-silver-500">Total</p>
                                <p className="font-semibold text-silver-900 dark:text-white">{formatPrice(order.total)}</p>
                            </div>
                            <div>
                                <p className="text-silver-500">Order #</p>
                                <p className="font-semibold text-silver-900 dark:text-white">{order.id}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Badge color={order.status === 'DELIVERED' ? 'green' : 'blue'}>{order.status}</Badge>
                            <Button size="sm" variant="outline">Invoice</Button>
                        </div>
                    </div>
                    <div className="p-6">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-center mb-4 last:mb-0">
                                <div className="w-16 h-16 bg-silver-100 dark:bg-silver-800 rounded-lg overflow-hidden border border-silver-200 dark:border-silver-700 shrink-0">
                                    <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-silver-900 dark:text-white">{item.productName}</h4>
                                    <p className="text-sm text-silver-500">Qty: {item.quantity}</p>
                                </div>
                                <Button size="sm" variant="secondary">Buy Again</Button>
                            </div>
                        ))}
                    </div>
                 </Card>
            ))}
          </div>
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto relative">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                <h1 className="text-3xl font-bold text-silver-900 dark:text-white">
                    {user.role === 'FIXER' ? `Technician Portal` : `Hello, ${user.name.split(' ')[0]}`}
                </h1>
                <p className="text-silver-500 dark:text-silver-400">
                    {user.role === 'FIXER' ? 'Manage assigned repairs and schedules' : 'Manage your devices and orders'}
                </p>
                </div>
                {user.role === 'CUSTOMER' && (
                    <div className="flex gap-2">
                        <Button variant={activeTab === 'overview' ? 'primary' : 'secondary'} onClick={() => setActiveTab('overview')}>Overview</Button>
                        <Button variant={activeTab === 'repairs' ? 'primary' : 'secondary'} onClick={() => setActiveTab('repairs')}>Repairs</Button>
                        <Button variant={activeTab === 'orders' ? 'primary' : 'secondary'} onClick={() => setActiveTab('orders')}>Orders</Button>
                    </div>
                )}
            </div>
            
            {user.role === 'FIXER' ? renderFixerView() : (
                <>
                    {activeTab === 'overview' && renderCustomerOverview()}
                    {activeTab === 'repairs' && renderCustomerRepairs()}
                    {activeTab === 'orders' && renderCustomerOrders()}
                    {/* Support tab only renders for admin in the admin block, but just in case customer view uses this prop */}
                </>
            )}

            {/* Global Chat Overlay for Selected Repair */}
            {selectedRepairForChat && (
                <ChatWidget 
                    isOpen={true}
                    onClose={() => setSelectedRepairForChat(null)}
                    fixerName={MOCK_ALL_USERS.find(u => u.id === selectedRepairForChat.fixerId)?.name || 'Assigned Technician'}
                    fixerStatus={MOCK_ALL_USERS.find(u => u.id === selectedRepairForChat.fixerId)?.availabilityStatus || 'ONLINE'}
                    repairContext={selectedRepairForChat.deviceType}
                />
            )}
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = (props) => {
    if (props.user.role === 'ADMIN') {
        return <AdminDashboard {...props} />;
    }
    return <StandardDashboard user={props.user} onUpdateUser={props.onUpdateUser} formatPrice={props.formatPrice} />;
};
