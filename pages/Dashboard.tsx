import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, ChatMessage, Product, Order, UserRole, AvailabilityStatus, RepairJob, ChatSession, LandingPageConfig, ContactInfo, ContactMessage } from '../types';
import { MOCK_REPAIRS, MOCK_ORDERS, MOCK_ALL_USERS, MOCK_ALL_ORDERS, DEFAULT_CONTACT_INFO } from '../constants';
import { Card, Button, Badge, Input } from '../components/ui';
import { Package, Wrench, MessageSquare, MapPin, BarChart3, CheckCircle, Smartphone, User as UserIcon, MoreHorizontal, Plus, Trash2, Edit, Search, Users, ShoppingBag, LayoutDashboard, Settings, ChevronRight, LogOut, X, Save, Download, Filter, Circle, Upload, Star, Send, MessageCircle, Globe, Briefcase, Mail, Eye, Layout, PenTool } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useSearchParams, Link } from 'react-router-dom';

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
  landingPageConfig?: LandingPageConfig;
  onUpdateLandingPage?: (config: LandingPageConfig) => void;
  contactInfo?: ContactInfo;
  onUpdateContactInfo?: (info: ContactInfo) => void;
  contactMessages?: ContactMessage[];
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
    <Card className={`flex flex-col overflow-hidden shadow-2xl border-slate-200 dark:border-slate-800 ${onClose ? 'fixed bottom-4 right-4 w-96 h-[500px] z-50 animate-scale-up' : 'h-[500px]'}`}>
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

// --- Standard Dashboard Component (Client View) ---

const StandardDashboard = ({ user, formatPrice = (p) => `$${p}`, onUpdateUser }: { user: User, onUpdateUser?: (data: Partial<User>) => void, formatPrice?: (price: number) => string }) => {
    // Filter repairs by user ID. If no repairs found (e.g. fresh user), it will be empty which is correct.
    // MOCK_REPAIRS contains data for 'u1' (Alex) and 'u3' (John).
    const repairs = MOCK_REPAIRS.filter(r => r.customerId === user.id); 
    // Mock orders are not linked by ID in the constant, so we just show all for demo purposes, or we could filter if we add IDs to orders.
    // For now, assuming MOCK_ORDERS belongs to the logged in user for visual population.
    const orders = MOCK_ORDERS;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in">
             <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-silver-900 dark:text-white">My Dashboard</h1>
                    <p className="text-silver-500">Welcome back, {user.name}</p>
                </div>
                <Link to="/repair">
                    <Button>Book New Repair</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Repairs Section */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-silver-900 dark:text-white flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-blucell-600" /> Active Repairs
                    </h2>
                    {repairs.length > 0 ? (
                        repairs.map(repair => (
                             <Card key={repair.id} className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">{repair.deviceType}</h3>
                                        <p className="text-sm text-silver-500">ID: {repair.id}</p>
                                    </div>
                                    <Badge color={repair.status === 'COMPLETED' ? 'green' : 'blue'}>{repair.status}</Badge>
                                </div>
                                <div className="space-y-2 mb-4">
                                    <p className="text-sm text-silver-600 dark:text-silver-300"><strong>Issue:</strong> {repair.issueDescription}</p>
                                    {repair.aiDiagnosis && (
                                        <div className="p-3 bg-blucell-50 dark:bg-blucell-900/20 rounded-lg text-sm border border-blucell-100 dark:border-blucell-800">
                                            <span className="font-bold text-blucell-700 dark:text-blucell-300">AI Note:</span> {repair.aiDiagnosis}
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-silver-100 dark:border-silver-800">
                                     <div className="text-sm text-silver-500">
                                        Estimated Cost: <span className="font-bold text-silver-900 dark:text-white">{repair.estimatedCost ? formatPrice(repair.estimatedCost) : 'Pending'}</span>
                                     </div>
                                     <Button size="sm" variant="outline">View Details</Button>
                                </div>
                             </Card>
                        ))
                    ) : (
                        <Card className="p-8 text-center text-silver-500">
                            <p>No active repairs found.</p>
                            <Link to="/repair" className="text-blucell-600 hover:underline mt-2 inline-block">Start a repair request</Link>
                        </Card>
                    )}

                    <h2 className="text-xl font-bold text-silver-900 dark:text-white flex items-center gap-2 mt-8">
                        <Package className="w-5 h-5 text-blucell-600" /> Recent Orders
                    </h2>
                    <div className="space-y-4">
                        {orders.map(order => (
                            <Card key={order.id} className="p-4 flex flex-col sm:flex-row gap-4 items-center">
                                <div className="p-3 bg-silver-100 dark:bg-silver-800 rounded-lg">
                                    <ShoppingBag className="w-6 h-6 text-silver-500" />
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <h4 className="font-bold">Order #{order.id}</h4>
                                    <p className="text-sm text-silver-500">{order.items.length} items • {order.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">{formatPrice(order.total)}</p>
                                    <Badge color={order.status === 'DELIVERED' ? 'green' : 'yellow'}>{order.status}</Badge>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Profile / Stats Sidebar */}
                <div className="space-y-6">
                    <Card className="p-6 text-center">
                        <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-silver-100 dark:border-silver-800" />
                        <h3 className="font-bold text-xl">{user.name}</h3>
                        <p className="text-silver-500 mb-6">{user.email}</p>
                        <Link to="/settings">
                            <Button variant="outline" className="w-full">Edit Profile</Button>
                        </Link>
                    </Card>
                    
                    <Card className="p-6">
                        <h3 className="font-bold mb-4">Quick Stats</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-silver-500">Total Orders</span>
                                <span className="font-bold">{orders.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-silver-500">Repairs</span>
                                <span className="font-bold">{repairs.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-silver-500">Member Since</span>
                                <span className="font-bold">2023</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
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
    onAdminReply,
    landingPageConfig,
    onUpdateLandingPage,
    contactInfo = DEFAULT_CONTACT_INFO,
    onUpdateContactInfo,
    contactMessages = [],
    onUpdateUser
}: DashboardProps) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [replyInput, setReplyInput] = useState('');
    const replyEndRef = useRef<HTMLDivElement>(null);
    
    // Admin Data State
    const [users, setUsers] = useState<User[]>(MOCK_ALL_USERS);
    const [orders, setOrders] = useState<Order[]>(MOCK_ALL_ORDERS);
    // Local Repairs State to simulate updates in Technician view
    const [allRepairs, setAllRepairs] = useState<RepairJob[]>(MOCK_REPAIRS);
    const [searchTerm, setSearchTerm] = useState('');
    const [settings, setSettings] = useState({ 
        platformName: 'BLUCELL', 
        supportEmail: 'support@blucell.com', 
        maintenanceMode: false,
        platformLogo: localStorage.getItem('platform_logo') || ''
    });
    
    // Tech Chat State
    const [activeTechChatJobId, setActiveTechChatJobId] = useState<string | null>(null);

    // Modal State
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

    // Add User State
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [newUserData, setNewUserData] = useState({ name: '', email: '', role: 'CUSTOMER' as UserRole });

    // Fixer Recruit State
    const [isRecruitModalOpen, setIsRecruitModalOpen] = useState(false);

    // CMS State
    const [cmsConfig, setCmsConfig] = useState<LandingPageConfig>(landingPageConfig!);
    const [localContactInfo, setLocalContactInfo] = useState<ContactInfo>(contactInfo);

    useEffect(() => {
        if (landingPageConfig) setCmsConfig(landingPageConfig);
        if (contactInfo) setLocalContactInfo(contactInfo);
    }, [landingPageConfig, contactInfo]);

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

    const handleUpdateRepairStatus = (repairId: string, newStatus: RepairJob['status']) => {
        setAllRepairs(prev => prev.map(r => r.id === repairId ? { ...r, status: newStatus } : r));
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

    // CMS Handlers
    const handleCmsChange = (section: keyof LandingPageConfig, field: string, value: any, index?: number, subfield?: string) => {
        setCmsConfig(prev => {
            const newConfig = { ...prev };
            if (index !== undefined && subfield) {
                // @ts-ignore
                newConfig[section][index][subfield] = value;
            } else if (index !== undefined) {
                 // @ts-ignore
                 newConfig[section][index] = value;
            } else {
                // @ts-ignore
                newConfig[section][field] = value;
            }
            return newConfig;
        });
    };

    const handleCmsImageUpload = (section: keyof LandingPageConfig, field: string, index?: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                handleCmsChange(section, field, reader.result as string, index, field === 'image' ? 'image' : undefined);
            };
            reader.readAsDataURL(file);
        }
    };

    const saveCms = () => {
        onUpdateLandingPage?.(cmsConfig);
        onUpdateContactInfo?.(localContactInfo);
        alert('Website & Contact Info Updated!');
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

    const Modal = ({ title, onClose, children }: { title: string, onClose: () => void, children?: React.ReactNode }) => (
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

    const ImageUploader = ({ label, value, onChange }: { label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-silver-700 dark:text-silver-300">{label}</label>
            <div className="flex gap-4 items-center">
                <div className="flex-1">
                    <div className="relative">
                        <Input 
                            value={value} 
                            readOnly
                            className="pr-24" 
                        />
                        <div className="absolute right-1 top-1 bottom-1">
                            <label className="flex items-center justify-center px-3 h-full bg-silver-100 dark:bg-silver-800 hover:bg-silver-200 dark:hover:bg-silver-700 rounded text-xs font-medium cursor-pointer transition-colors border-l border-silver-200 dark:border-silver-700 text-silver-700 dark:text-silver-300">
                                <Upload className="w-3 h-3 mr-1" /> Upload
                                <input type="file" className="hidden" accept="image/*" onChange={onChange} />
                            </label>
                        </div>
                    </div>
                </div>
                {value && (
                    <div className="w-12 h-12 rounded-lg border border-silver-200 dark:border-silver-700 overflow-hidden shrink-0 bg-silver-50">
                        <img src={value} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                )}
            </div>
        </div>
    );

    const renderTechnicianWorkspace = () => {
        // Find jobs assigned to this user (the admin)
        const myJobs = allRepairs.filter(r => r.fixerId === user.id);
        const activeChatRepair = allRepairs.find(r => r.id === activeTechChatJobId);

        return (
            <div className="space-y-6 animate-fade-in relative">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-silver-900 dark:text-white">Technician Workspace</h2>
                        <p className="text-silver-500 text-sm">Manage repairs assigned to you.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-silver-100 dark:bg-silver-800 p-1 rounded-full">
                        <span className="text-xs font-medium px-3 text-silver-500">Status:</span>
                        <button className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">ONLINE</button>
                    </div>
                </div>

                {myJobs.length === 0 ? (
                    <div className="text-center py-20 bg-silver-50 dark:bg-silver-900 rounded-xl border-dashed border-2 border-silver-200 dark:border-silver-700">
                        <Wrench className="w-12 h-12 text-silver-300 mx-auto mb-3" />
                        <p className="text-silver-500">No active repair jobs assigned to you.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myJobs.map(job => (
                            <Card key={job.id} className="p-6 border-l-4 border-l-blucell-500">
                                <div className="flex justify-between items-start mb-4">
                                    <Badge color={job.status === 'COMPLETED' ? 'green' : 'blue'}>{job.status}</Badge>
                                    <span className="text-xs text-silver-400">{job.dateBooked}</span>
                                </div>
                                <h3 className="font-bold text-lg mb-1 text-silver-900 dark:text-white">{job.deviceType}</h3>
                                <p className="text-sm text-silver-500 mb-4 line-clamp-2">{job.issueDescription}</p>
                                
                                {job.aiDiagnosis && (
                                    <div className="bg-silver-50 dark:bg-silver-800 p-3 rounded-lg text-xs mb-4 text-silver-600 dark:text-silver-300">
                                        <strong>AI Note:</strong> {job.aiDiagnosis}
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-silver-400 uppercase tracking-wider mb-1 block">Update Status</label>
                                        <select 
                                            className="w-full text-sm bg-white dark:bg-silver-950 border border-silver-200 dark:border-silver-700 rounded-lg p-2"
                                            value={job.status}
                                            onChange={(e) => handleUpdateRepairStatus(job.id, e.target.value as any)}
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="DIAGNOSING">Diagnosing</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="COMPLETED">Completed</option>
                                            <option value="DELIVERED">Delivered</option>
                                        </select>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="flex-1"
                                            onClick={() => setActiveTechChatJobId(job.id)}
                                        >
                                            <MessageCircle className="w-4 h-4 mr-1" /> Chat
                                        </Button>
                                        <Button size="sm" className="flex-1">
                                            Details
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Tech Chat Overlay */}
                <ChatWidget 
                    isOpen={!!activeTechChatJobId}
                    onClose={() => setActiveTechChatJobId(null)}
                    fixerName={user.name}
                    fixerStatus="ONLINE"
                    repairContext={activeChatRepair ? `${activeChatRepair.deviceType} (${activeChatRepair.id})` : ''}
                />
            </div>
        );
    };

    const renderFixers = () => {
        const fixers = users.filter(u => u.role === 'FIXER');
        const customers = users.filter(u => u.role === 'CUSTOMER');

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-silver-900 dark:text-white">Fixer Management</h2>
                        <p className="text-silver-500 text-sm">Manage technician access and assignments.</p>
                    </div>
                    <Button className="flex items-center gap-2" onClick={() => setIsRecruitModalOpen(true)}>
                        <Plus className="w-4 h-4" /> Recruit New Fixer
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {fixers.map(fixer => (
                        <Card key={fixer.id} className="p-6 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-lg transition-shadow">
                            <div className={`absolute top-0 left-0 w-full h-1 ${fixer.availabilityStatus === 'ONLINE' ? 'bg-green-500' : fixer.availabilityStatus === 'BUSY' ? 'bg-red-500' : 'bg-silver-300'}`}></div>
                            <div className="w-20 h-20 rounded-full bg-silver-100 dark:bg-silver-800 mb-4 p-1 border-2 border-silver-100 dark:border-silver-700 relative">
                                <img src={fixer.avatar} alt={fixer.name} className="w-full h-full rounded-full object-cover" />
                                <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-silver-900 ${fixer.availabilityStatus === 'ONLINE' ? 'bg-green-500' : fixer.availabilityStatus === 'BUSY' ? 'bg-red-500' : 'bg-silver-400'}`}></div>
                            </div>
                            <h3 className="font-bold text-lg text-silver-900 dark:text-white">{fixer.name}</h3>
                            <p className="text-silver-500 text-sm mb-4">{fixer.email}</p>
                            
                            <div className="flex items-center gap-2 mb-6 bg-silver-50 dark:bg-silver-800 px-3 py-1 rounded-full">
                                <span className="text-xs font-bold uppercase tracking-wider text-silver-600 dark:text-silver-400">
                                    {fixer.availabilityStatus || 'OFFLINE'}
                                </span>
                            </div>

                            <div className="w-full grid grid-cols-2 gap-2 mb-6 text-sm">
                                <div className="bg-silver-50 dark:bg-silver-800 p-2 rounded-lg">
                                    <p className="font-bold text-silver-900 dark:text-white">12</p>
                                    <p className="text-silver-500 text-xs">Jobs Done</p>
                                </div>
                                <div className="bg-silver-50 dark:bg-silver-800 p-2 rounded-lg">
                                    <p className="font-bold text-silver-900 dark:text-white">4.9</p>
                                    <p className="text-silver-500 text-xs">Rating</p>
                                </div>
                            </div>

                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:border-red-900/30"
                                onClick={() => handleUpdateUserRole(fixer.id, 'CUSTOMER')}
                            >
                                Revoke Fixer Access
                            </Button>
                        </Card>
                    ))}
                    
                    {fixers.length === 0 && (
                        <div className="col-span-full text-center py-12 text-silver-500 bg-silver-50 dark:bg-silver-800/50 rounded-xl border-dashed border-2 border-silver-200 dark:border-silver-700">
                            <Wrench className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="mb-4">No active fixers found.</p>
                            <Button variant="outline" onClick={() => setIsRecruitModalOpen(true)}>Recruit from Customers</Button>
                        </div>
                    )}
                </div>

                {isRecruitModalOpen && (
                    <Modal title="Grant Fixer Access" onClose={() => setIsRecruitModalOpen(false)}>
                        <div className="space-y-4">
                            <p className="text-sm text-silver-500">Select a customer to upgrade to a Technician/Fixer role. This will grant them access to the Fixer Dashboard.</p>
                            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                {customers.map(customer => (
                                    <div key={customer.id} className="flex items-center justify-between p-3 rounded-lg border border-silver-200 dark:border-silver-700 hover:bg-silver-50 dark:hover:bg-silver-800 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <img src={customer.avatar} className="w-10 h-10 rounded-full border border-silver-200 dark:border-silver-600" alt="" />
                                            <div>
                                                <p className="text-sm font-bold text-silver-900 dark:text-white">{customer.name}</p>
                                                <p className="text-xs text-silver-500">{customer.email}</p>
                                            </div>
                                        </div>
                                        <Button 
                                            size="sm" 
                                            className="bg-blucell-600 hover:bg-blucell-700 text-white"
                                            onClick={() => {
                                                handleUpdateUserRole(customer.id, 'FIXER');
                                                setIsRecruitModalOpen(false);
                                            }}
                                        >
                                            Turn On Fixer Page
                                        </Button>
                                    </div>
                                ))}
                                {customers.length === 0 && (
                                    <p className="text-center text-sm text-silver-400 py-8 bg-silver-50 dark:bg-silver-900 rounded-lg">No eligible customers found.</p>
                                )}
                            </div>
                        </div>
                    </Modal>
                )}
            </div>
        );
    };

    const renderCms = () => (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-10">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-silver-900 dark:text-white">Website Editor</h2>
                <Button onClick={saveCms} className="flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Changes
                </Button>
            </div>

            {/* Contact Info Section */}
            <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 text-silver-900 dark:text-white border-b border-silver-100 dark:border-silver-800 pb-2">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                        label="Phone Number" 
                        value={localContactInfo.phone} 
                        onChange={(e) => setLocalContactInfo({...localContactInfo, phone: e.target.value})} 
                    />
                    <Input 
                        label="Email Address" 
                        value={localContactInfo.email} 
                        onChange={(e) => setLocalContactInfo({...localContactInfo, email: e.target.value})} 
                    />
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-silver-700 dark:text-silver-300 mb-1">Address</label>
                        <textarea 
                            className="w-full rounded-lg border border-silver-300 dark:border-silver-700 bg-white dark:bg-silver-950 px-3 py-2 text-sm h-20 focus:outline-none focus:ring-2 focus:ring-blucell-500 text-silver-900 dark:text-silver-100"
                            value={localContactInfo.address} 
                            onChange={(e) => setLocalContactInfo({...localContactInfo, address: e.target.value})}
                        />
                    </div>
                </div>
            </Card>

            {/* Hero Section */}
            <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 text-silver-900 dark:text-white border-b border-silver-100 dark:border-silver-800 pb-2">Hero Section</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <Input label="Title Prefix" value={cmsConfig.hero.titlePrefix} onChange={(e) => handleCmsChange('hero', 'titlePrefix', e.target.value)} />
                        <Input label="Title Highlight (Gradient)" value={cmsConfig.hero.titleHighlight} onChange={(e) => handleCmsChange('hero', 'titleHighlight', e.target.value)} />
                        <Input label="Title Suffix" value={cmsConfig.hero.titleSuffix} onChange={(e) => handleCmsChange('hero', 'titleSuffix', e.target.value)} />
                    </div>
                    <Input label="Subtitle" value={cmsConfig.hero.subtitle} onChange={(e) => handleCmsChange('hero', 'subtitle', e.target.value)} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Primary CTA Text" value={cmsConfig.hero.ctaPrimary} onChange={(e) => handleCmsChange('hero', 'ctaPrimary', e.target.value)} />
                        <Input label="Secondary CTA Text" value={cmsConfig.hero.ctaSecondary} onChange={(e) => handleCmsChange('hero', 'ctaSecondary', e.target.value)} />
                    </div>
                    <ImageUploader label="Foreground Image (e.g. Phone)" value={cmsConfig.hero.imageForeground} onChange={handleCmsImageUpload('hero', 'imageForeground')} />
                    <ImageUploader label="Background Image (e.g. Console)" value={cmsConfig.hero.imageBackground} onChange={handleCmsImageUpload('hero', 'imageBackground')} />
                </div>
            </Card>

            {/* Features Section */}
            <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 text-silver-900 dark:text-white border-b border-silver-100 dark:border-silver-800 pb-2">Features Section</h3>
                <div className="space-y-6">
                    {cmsConfig.features.map((feature, idx) => (
                        <div key={idx} className="bg-silver-50 dark:bg-silver-900 p-4 rounded-lg">
                            <h4 className="text-sm font-bold mb-3 text-silver-500">Feature {idx + 1}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Title" value={feature.title} onChange={(e) => handleCmsChange('features', 'title', e.target.value, idx, 'title')} />
                                <Input label="Description" value={feature.description} onChange={(e) => handleCmsChange('features', 'description', e.target.value, idx, 'description')} />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Trending Section */}
            <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 text-silver-900 dark:text-white border-b border-silver-100 dark:border-silver-800 pb-2">Trending Section</h3>
                <div className="space-y-4 mb-6">
                    <Input label="Section Title" value={cmsConfig.trending.sectionTitle} onChange={(e) => handleCmsChange('trending', 'sectionTitle', e.target.value)} />
                    <Input label="Section Subtitle" value={cmsConfig.trending.sectionSubtitle} onChange={(e) => handleCmsChange('trending', 'sectionSubtitle', e.target.value)} />
                </div>
                <div className="space-y-6">
                    {cmsConfig.trending.items.map((item, idx) => (
                        <div key={idx} className="bg-silver-50 dark:bg-silver-900 p-4 rounded-lg border border-silver-200 dark:border-silver-800">
                            <h4 className="text-sm font-bold mb-3 text-silver-500">Item {idx + 1} {idx === 0 ? '(Hero Large)' : idx === 1 ? '(Wide Top)' : '(Small Box)'}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <Input label="Title" value={item.title} onChange={(e) => handleCmsChange('trending', 'items', e.target.value, idx, 'title')} />
                                <Input label="Badge (Optional)" value={item.badge || ''} onChange={(e) => handleCmsChange('trending', 'items', e.target.value, idx, 'badge')} />
                            </div>
                            <Input label="Description" value={item.description} onChange={(e) => handleCmsChange('trending', 'items', e.target.value, idx, 'description')} className="mb-4" />
                            <ImageUploader label="Item Image" value={item.image} onChange={handleCmsImageUpload('trending', 'image', idx)} />
                        </div>
                    ))}
                </div>
            </Card>

            {/* Bottom CTA */}
            <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 text-silver-900 dark:text-white border-b border-silver-100 dark:border-silver-800 pb-2">Bottom CTA</h3>
                <div className="space-y-4">
                    <Input label="Title" value={cmsConfig.ctaBottom.title} onChange={(e) => handleCmsChange('ctaBottom', 'title', e.target.value)} />
                    <div>
                        <label className="block text-sm font-medium text-silver-700 dark:text-silver-300 mb-1">Description</label>
                        <textarea 
                            className="w-full rounded-lg border border-silver-300 dark:border-silver-700 bg-white dark:bg-silver-950 px-3 py-2 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-blucell-500 text-silver-900 dark:text-silver-100"
                            value={cmsConfig.ctaBottom.description} 
                            onChange={(e) => handleCmsChange('ctaBottom', 'description', e.target.value)}
                        />
                    </div>
                    <Input label="Button Text" value={cmsConfig.ctaBottom.buttonText} onChange={(e) => handleCmsChange('ctaBottom', 'buttonText', e.target.value)} />
                </div>
            </Card>
        </div>
    );

    const renderInquiries = () => (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-silver-900 dark:text-white mb-6">Inquiries & Contact Form Messages</h2>
            
            {contactMessages.length === 0 ? (
                <Card className="p-12 text-center text-silver-500 border-dashed border-2">
                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No messages received yet.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {contactMessages.map((msg) => (
                        <Card key={msg.id} className="p-6 transition-all hover:shadow-md border-l-4 border-l-blucell-500">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-lg text-silver-900 dark:text-white">{msg.subject}</h3>
                                    <p className="text-sm text-silver-500">
                                        From: <span className="font-medium text-silver-700 dark:text-silver-300">{msg.name}</span> ({msg.email})
                                    </p>
                                </div>
                                <span className="text-xs text-silver-400 whitespace-nowrap">
                                    {msg.date.toLocaleDateString()} {msg.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                            <div className="bg-silver-50 dark:bg-silver-900 p-4 rounded-lg text-sm text-silver-700 dark:text-silver-300 leading-relaxed mt-4">
                                {msg.message}
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button size="sm" variant="outline" onClick={() => window.open(`mailto:${msg.email}?subject=Re: ${msg.subject}`)}>Reply via Email</Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
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

    const renderOrders = () => {
        const filteredOrders = orders.filter(o => 
            o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.items.some(i => i.productName.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        return (
            <div className="space-y-6 animate-fade-in">
                 <div className="flex flex-col sm:flex-row justify-between gap-4">
                     <div className="relative w-full max-w-md">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-400" />
                         <Input 
                            placeholder="Search orders..." 
                            className="pl-10" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </div>
                     <Button className="flex items-center gap-2" onClick={handleExportCSV}>
                         <Download className="w-4 h-4" /> Export CSV
                     </Button>
                 </div>
                 
                 <Card className="overflow-hidden">
                     <div className="overflow-x-auto">
                         <table className="w-full text-left text-sm">
                             <thead className="bg-silver-100 dark:bg-silver-800/50 text-silver-500 border-b border-silver-200 dark:border-silver-800">
                                 <tr>
                                     <th className="p-4 font-medium">Order ID</th>
                                     <th className="p-4 font-medium">Date</th>
                                     <th className="p-4 font-medium">Items</th>
                                     <th className="p-4 font-medium">Total</th>
                                     <th className="p-4 font-medium">Status</th>
                                     <th className="p-4 font-medium text-right">Actions</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-silver-100 dark:divide-silver-800">
                                 {filteredOrders.map(order => (
                                     <tr key={order.id} className="hover:bg-silver-50 dark:hover:bg-silver-800/50 transition-colors">
                                         <td className="p-4 font-medium text-silver-900 dark:text-white">#{order.id}</td>
                                         <td className="p-4 text-silver-500">{order.date}</td>
                                         <td className="p-4 text-silver-500">{order.items.length} Items</td>
                                         <td className="p-4 font-medium text-silver-900 dark:text-white">{formatPrice(order.total)}</td>
                                         <td className="p-4">
                                             <Badge color={order.status === 'DELIVERED' ? 'green' : order.status === 'SHIPPED' ? 'blue' : 'yellow'}>
                                                 {order.status}
                                             </Badge>
                                         </td>
                                         <td className="p-4 text-right">
                                             <Button size="sm" variant="ghost" onClick={() => setViewingOrder(order)}>
                                                 <Eye className="w-4 h-4" />
                                             </Button>
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                     </div>
                 </Card>

                {viewingOrder && (
                    <Modal title={`Order Details: #${viewingOrder.id}`} onClose={() => setViewingOrder(null)}>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-silver-100 dark:border-silver-800 pb-4">
                                <div>
                                    <p className="text-sm text-silver-500">Date placed</p>
                                    <p className="font-bold text-silver-900 dark:text-white">{viewingOrder.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-silver-500">Total Amount</p>
                                    <p className="font-bold text-xl text-blucell-600">{formatPrice(viewingOrder.total)}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold mb-3 text-silver-900 dark:text-white">Items Ordered</h4>
                                <div className="space-y-3">
                                    {viewingOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-3 items-center p-3 bg-silver-50 dark:bg-silver-800/50 rounded-lg">
                                            <img src={item.image} alt="" className="w-12 h-12 rounded bg-white object-cover" />
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
                                <div className="flex gap-2">
                                    {['PROCESSING', 'SHIPPED', 'DELIVERED'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => handleUpdateOrderStatus(viewingOrder.id, status as Order['status'])}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium border ${
                                                viewingOrder.status === status
                                                ? 'bg-blucell-600 text-white border-blucell-600'
                                                : 'border-silver-200 dark:border-silver-700 hover:bg-silver-50 dark:hover:bg-silver-800 text-silver-600 dark:text-silver-400'
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
    };

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
                                 <th className="p-4 font-medium">User</th>
                                 <th className="p-4 font-medium">Role</th>
                                 <th className="p-4 font-medium">Status</th>
                                 <th className="p-4 font-medium text-right">Actions</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-silver-100 dark:divide-silver-800">
                             {filteredUsers.map(u => (
                                 <tr key={u.id} className="hover:bg-silver-50 dark:hover:bg-silver-800/50 transition-colors">
                                     <td className="p-4 flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-full bg-silver-100 dark:bg-silver-800 flex items-center justify-center overflow-hidden">
                                             <img src={u.avatar} className="w-full h-full object-cover" alt="" />
                                         </div>
                                         <div className="flex flex-col">
                                            <span className="font-medium text-silver-900 dark:text-white">{u.name}</span>
                                            <span className="text-xs text-silver-500">{u.email}</span>
                                         </div>
                                     </td>
                                     <td className="p-4">
                                         <Badge color={u.role === 'ADMIN' ? 'red' : u.role === 'FIXER' ? 'blue' : 'green'}>
                                             {u.role}
                                         </Badge>
                                     </td>
                                     <td className="p-4">
                                         {u.availabilityStatus ? (
                                             <div className="flex items-center gap-2">
                                                 <StatusIndicator status={u.availabilityStatus} />
                                                 <span className="text-silver-600 dark:text-silver-400 capitalize">{u.availabilityStatus.toLowerCase()}</span>
                                             </div>
                                         ) : (
                                             <span className="text-silver-400">-</span>
                                         )}
                                     </td>
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

             {isAddUserModalOpen && (
                <Modal title="Add New User" onClose={() => setIsAddUserModalOpen(false)}>
                    <form onSubmit={handleAddUser} className="space-y-4">
                        <Input 
                            label="Full Name" 
                            value={newUserData.name} 
                            onChange={e => setNewUserData({...newUserData, name: e.target.value})}
                            required
                        />
                        <Input 
                            label="Email Address" 
                            type="email"
                            value={newUserData.email} 
                            onChange={e => setNewUserData({...newUserData, email: e.target.value})}
                            required
                        />
                        <div>
                            <label className="block text-sm font-medium text-silver-700 dark:text-silver-300 mb-1">Role</label>
                            <select 
                                className="w-full rounded-lg border border-silver-300 dark:border-silver-700 bg-white dark:bg-silver-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blucell-500 text-silver-900 dark:text-silver-100"
                                value={newUserData.role}
                                onChange={e => setNewUserData({...newUserData, role: e.target.value as UserRole})}
                            >
                                <option value="CUSTOMER">Customer</option>
                                <option value="FIXER">Fixer</option>
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
                <Modal title={`Edit User: ${editingUser.name}`} onClose={() => setEditingUser(null)}>
                    <div className="space-y-4">
                        <p className="text-sm text-silver-500">Change role for this user.</p>
                        <div className="grid grid-cols-3 gap-3">
                            {['CUSTOMER', 'FIXER', 'ADMIN'].map((role) => (
                                <button
                                    key={role}
                                    onClick={() => handleUpdateUserRole(editingUser.id, role as UserRole)}
                                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                                        editingUser.role === role 
                                        ? 'bg-blucell-600 text-white border-blucell-600' 
                                        : 'border-silver-200 dark:border-silver-700 hover:bg-silver-50 dark:hover:bg-silver-800'
                                    }`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>
                </Modal>
             )}
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
                <SidebarItem id="client_view" icon={Layout} label="My Dashboard" />
                <SidebarItem id="technician_view" icon={Wrench} label="Technician Workspace" />
                <SidebarItem id="fixers" icon={Briefcase} label="Manage Fixers" />
                <SidebarItem id="products" icon={Package} label="Products" />
                <SidebarItem id="users" icon={Users} label="Users" />
                <SidebarItem id="orders" icon={ShoppingBag} label="Orders" />
                <SidebarItem id="inquiries" icon={Mail} label="Inquiries" />
                <SidebarItem id="support" icon={MessageCircle} label="Support" />
                <SidebarItem id="cms" icon={Globe} label="Website Editor" />
                
                <div className="mt-auto pt-4 border-t border-silver-100 dark:border-silver-800">
                    <SidebarItem id="settings" icon={Settings} label="Settings" />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-transparent">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-silver-900 dark:text-white capitalize">
                            {activeTab === 'client_view' ? 'Client View' : activeTab === 'technician_view' ? 'Technician Workspace' : activeTab}
                        </h1>
                        <p className="text-silver-500">Welcome back, {user.name}. Here's what's happening today.</p>
                    </div>
                    
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'client_view' && <StandardDashboard user={user} onUpdateUser={onUpdateUser} formatPrice={formatPrice} />}
                    {activeTab === 'technician_view' && renderTechnicianWorkspace()}
                    {activeTab === 'fixers' && renderFixers()}
                    {activeTab === 'products' && renderProducts()}
                    {activeTab === 'users' && renderUsers()}
                    {activeTab === 'orders' && renderOrders()}
                    {activeTab === 'inquiries' && renderInquiries()}
                    {activeTab === 'support' && renderSupport()}
                    {activeTab === 'cms' && renderCms()}
                    {activeTab === 'settings' && renderSettings()}
                </div>
            </div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = (props) => {
    if (props.user.role === 'ADMIN') {
        return <AdminDashboard {...props} />;
    }
    return <StandardDashboard user={props.user} onUpdateUser={props.onUpdateUser} formatPrice={props.formatPrice} />;
};