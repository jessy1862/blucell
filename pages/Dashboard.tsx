import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, Product, Order, RepairJob, ChatSession, LandingPageConfig, ContactInfo, ContactMessage, UserRole, AvailabilityStatus, ChatMessage } from '../types';
import { Card, Button, Input, Badge, SectionTitle, Modal, StatusIndicator } from '../components/ui';
import { 
    Users, ShoppingBag, Wrench, MessageSquare, LayoutTemplate, 
    Search, Plus, Filter, MoreVertical, Check, X, 
    Package, DollarSign, Clock, AlertCircle, Edit, Trash2, 
    ChevronRight, Send, Save, User as UserIcon, Image as ImageIcon,
    LogOut, Settings, ExternalLink, BarChart as BarChartIcon, Layers, Type, MousePointer, Upload
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  user: User;
  onUpdateUser: (data: Partial<User>) => void;
  products: Product[];
  onAddProduct: (p: Product) => void;
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdatePlatformSettings: (settings: { logo?: string }) => void;
  formatPrice: (price: number) => string;
  supportSessions: ChatSession[];
  onAdminReply: (sessionId: string, text: string) => void;
  landingPageConfig: LandingPageConfig;
  onUpdateLandingPage: (config: LandingPageConfig) => void;
  contactInfo: ContactInfo;
  onUpdateContactInfo: (info: ContactInfo) => void;
  contactMessages: ContactMessage[];
  onDeleteContactMessage: (id: string) => void;
  allUsers: User[];
  onAddUser: (u: User) => void;
  onUpdateUserAdmin: (u: User) => void;
  allOrders: Order[];
  onUpdateOrder: (id: string, status: Order['status']) => void;
  allRepairs: RepairJob[];
  onUpdateRepair: (r: RepairJob) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
    user, 
    // User Props
    allUsers, onAddUser, onUpdateUserAdmin,
    // Order Props
    allOrders, onUpdateOrder, formatPrice,
    // Repair Props
    allRepairs, onUpdateRepair,
    // Product Props
    products, onAddProduct, onUpdateProduct, onDeleteProduct,
    // Support Props
    supportSessions, onAdminReply,
    // CMS Props
    landingPageConfig, onUpdateLandingPage, contactInfo, onUpdateContactInfo, onUpdatePlatformSettings,
    contactMessages, onDeleteContactMessage
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Initial Tab State
    const getInitialTab = () => {
        const params = new URLSearchParams(location.search);
        const chatRepairId = params.get('chatRepairId');
        if (chatRepairId) return 'support';
        return 'overview';
    };

    const [activeTab, setActiveTab] = useState(getInitialTab());
    const [searchTerm, setSearchTerm] = useState('');
    
    // --- User Management State ---
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [newUserData, setNewUserData] = useState<Partial<User>>({ name: '', email: '', role: 'CUSTOMER' });

    // --- Repair Management State ---
    const [viewingRepair, setViewingRepair] = useState<RepairJob | null>(null);
    const [repairForm, setRepairForm] = useState<{ status: RepairJob['status'], cost: string, notes: string }>({ status: 'PENDING', cost: '', notes: '' });

    // --- Order Management State ---
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

    // --- Product Management State ---
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});

    // --- Support Chat State ---
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [chatReply, setChatReply] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // --- CMS State ---
    const [cmsConfig, setCmsConfig] = useState<LandingPageConfig>(landingPageConfig);
    const [activeCmsTab, setActiveCmsTab] = useState<'hero' | 'features' | 'trending' | 'cta'>('hero');

    // --- Computed Lists & Filtering ---
    const filteredUsers = useMemo(() => {
        return allUsers.filter(u => 
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allUsers, searchTerm]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    const myOrders = useMemo(() => {
        if (user.role === 'ADMIN') return allOrders;
        // In a real app, filtering would be by userId. Here we show all for admin, or mock for customer.
        // Assuming customer view logic is handled in parent or we filter by ID if we had it stored in Order.
        return allOrders; 
    }, [allOrders, user]);

    const myRepairs = useMemo(() => {
        if (user.role === 'ADMIN') return allRepairs;
        if (user.role === 'FIXER') return allRepairs.filter(r => r.fixerId === user.id || !r.fixerId); 
        return allRepairs.filter(r => r.customerId === user.id);
    }, [allRepairs, user]);

    // Analytics Data (Mock generation based on orders)
    const revenueData = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        // Generate pseudo-random data seeded by order length to make it look dynamic but consistent
        return months.map(m => ({
            name: m,
            revenue: Math.floor(Math.random() * 5000) + 2000 + (allOrders.length * 100),
            orders: Math.floor(Math.random() * 50) + 10
        }));
    }, [allOrders]);

    // Scroll to bottom of chat when opening a session
    useEffect(() => {
        if (activeSessionId) {
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    }, [activeSessionId, supportSessions]);

    // --- Handlers ---

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        const newUser: User = {
            id: Date.now().toString(),
            name: newUserData.name || 'New User',
            email: newUserData.email || '',
            role: newUserData.role || 'CUSTOMER',
            avatar: `https://ui-avatars.com/api/?name=${newUserData.name}&background=random`
        };
        onAddUser(newUser);
        setIsAddUserModalOpen(false);
        setNewUserData({ name: '', email: '', role: 'CUSTOMER' });
    };

    const handleProductSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const productData: Product = {
            id: currentProduct.id || `p-${Date.now()}`,
            name: currentProduct.name || 'New Product',
            price: Number(currentProduct.price) || 0,
            category: currentProduct.category || 'Others',
            image: currentProduct.image || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=800',
            rating: currentProduct.rating || 0,
            reviews: currentProduct.reviews || 0,
            description: currentProduct.description || '',
            specs: currentProduct.specs || {},
            status: currentProduct.status || 'IN_STOCK',
            isBestSeller: currentProduct.isBestSeller || false
        };

        if (currentProduct.id) {
            onUpdateProduct(productData);
        } else {
            onAddProduct(productData);
        }
        setIsProductModalOpen(false);
        setCurrentProduct({});
    };

    const openProductModal = (product?: Product) => {
        setCurrentProduct(product || { status: 'IN_STOCK', category: 'Phone' });
        setIsProductModalOpen(true);
    };

    const openRepairModal = (repair: RepairJob) => {
        setViewingRepair(repair);
        setRepairForm({
            status: repair.status,
            cost: repair.estimatedCost ? repair.estimatedCost.toString() : '',
            notes: repair.aiDiagnosis || '' 
        });
    };

    const handleSaveRepair = (e: React.FormEvent) => {
        e.preventDefault();
        if (viewingRepair) {
            onUpdateRepair({
                ...viewingRepair,
                status: repairForm.status,
                estimatedCost: repairForm.cost ? parseFloat(repairForm.cost) : undefined,
            });
            setViewingRepair(null);
        }
    };

    const handleSendChat = () => {
        if (activeSessionId && chatReply.trim()) {
            onAdminReply(activeSessionId, chatReply);
            setChatReply('');
        }
    };
    
    const handleSaveCMS = () => {
        onUpdateLandingPage(cmsConfig);
        alert('Landing page configuration updated successfully!');
    };

    const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result as string;
                    setCmsConfig(prev => ({
                        ...prev,
                        hero: {
                            ...prev.hero,
                            images: [...(prev.hero.images || []), base64]
                        }
                    }));
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeHeroImage = (index: number) => {
        setCmsConfig(prev => ({
            ...prev,
            hero: {
                ...prev.hero,
                images: prev.hero.images.filter((_, i) => i !== index)
            }
        }));
    };

    // --- Render Functions ---

    const renderSidebar = () => {
        const tabs = [
            { id: 'overview', label: 'Overview', icon: LayoutTemplate, roles: ['ADMIN', 'FIXER', 'CUSTOMER'] },
            { id: 'users', label: 'Users', icon: Users, roles: ['ADMIN'] },
            { id: 'products', label: 'Products', icon: ShoppingBag, roles: ['ADMIN'] },
            { id: 'orders', label: 'Orders', icon: Package, roles: ['ADMIN', 'CUSTOMER'] },
            { id: 'repairs', label: 'Repairs', icon: Wrench, roles: ['ADMIN', 'FIXER', 'CUSTOMER'] },
            { id: 'cms', label: 'Content & Settings', icon: Settings, roles: ['ADMIN'] },
            { id: 'support', label: 'Support Chat', icon: MessageSquare, roles: ['ADMIN', 'FIXER'] },
        ];

        return (
            <Card className="md:w-64 h-fit p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible sticky top-24 z-30">
                {tabs.filter(t => t.roles.includes(user.role)).map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap text-sm font-medium ${
                            activeTab === tab.id 
                            ? 'bg-blucell-600 text-white shadow-lg shadow-blucell-500/20' 
                            : 'text-silver-600 dark:text-silver-400 hover:bg-silver-100 dark:hover:bg-silver-800'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </Card>
        );
    };

    const renderOverview = () => (
        <div className="space-y-6 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-silver-500 text-sm font-medium">Total Orders</p>
                            <h3 className="text-2xl font-bold mt-1 text-silver-900 dark:text-white">{allOrders.length}</h3>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                            <Package className="w-6 h-6" />
                        </div>
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-silver-500 text-sm font-medium">Active Repairs</p>
                            <h3 className="text-2xl font-bold mt-1 text-silver-900 dark:text-white">{allRepairs.filter(r => r.status !== 'COMPLETED' && r.status !== 'DELIVERED').length}</h3>
                        </div>
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg">
                            <Wrench className="w-6 h-6" />
                        </div>
                    </div>
                </Card>
                 {user.role === 'ADMIN' && (
                     <>
                        <Card className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-silver-500 text-sm font-medium">Total Users</p>
                                    <h3 className="text-2xl font-bold mt-1 text-silver-900 dark:text-white">{allUsers.length}</h3>
                                </div>
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                                    <Users className="w-6 h-6" />
                                </div>
                            </div>
                        </Card>
                        <Card className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-silver-500 text-sm font-medium">Revenue</p>
                                    <h3 className="text-2xl font-bold mt-1 text-silver-900 dark:text-white">{formatPrice(allOrders.reduce((sum, o) => sum + o.total, 0))}</h3>
                                </div>
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                            </div>
                        </Card>
                     </>
                 )}
            </div>

            {/* Analytics Chart */}
            {user.role === 'ADMIN' && (
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-silver-900 dark:text-white flex items-center gap-2">
                            <BarChartIcon className="w-5 h-5 text-blucell-600" /> Revenue Analytics
                        </h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.3} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} tickFormatter={(val) => `$${val}`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                />
                                <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-silver-900 dark:text-white">Recent Repairs</h3>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('repairs')}>View All</Button>
                    </div>
                    <div className="space-y-4">
                        {myRepairs.slice(0, 3).map(repair => (
                            <div key={repair.id} className="flex items-center justify-between p-3 border border-silver-100 dark:border-silver-800 rounded-lg hover:bg-silver-50 dark:hover:bg-silver-800/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-silver-100 dark:bg-silver-800 rounded-full">
                                        <Wrench className="w-4 h-4 text-silver-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-silver-900 dark:text-white">{repair.deviceType}</p>
                                        <p className="text-xs text-silver-500">{repair.issueDescription.substring(0, 30)}...</p>
                                    </div>
                                </div>
                                <Badge color={repair.status === 'COMPLETED' ? 'green' : 'blue'}>{repair.status}</Badge>
                            </div>
                        ))}
                         {myRepairs.length === 0 && <p className="text-sm text-silver-500 italic">No active repairs.</p>}
                    </div>
                </Card>
                 <Card className="p-6">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-silver-900 dark:text-white">Recent Orders</h3>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('orders')}>View All</Button>
                    </div>
                    <div className="space-y-4">
                        {myOrders.slice(0, 3).map(order => (
                            <div key={order.id} className="flex items-center justify-between p-3 border border-silver-100 dark:border-silver-800 rounded-lg hover:bg-silver-50 dark:hover:bg-silver-800/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-silver-100 dark:bg-silver-800 rounded-full">
                                        <Package className="w-4 h-4 text-silver-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-silver-900 dark:text-white">Order #{order.id}</p>
                                        <p className="text-xs text-silver-500">{order.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm text-silver-900 dark:text-white">{formatPrice(order.total)}</p>
                                    <span className="text-xs text-silver-500 capitalize">{order.status.toLowerCase()}</span>
                                </div>
                            </div>
                        ))}
                         {myOrders.length === 0 && <p className="text-sm text-silver-500 italic">No orders yet.</p>}
                    </div>
                </Card>
            </div>
        </div>
    );

    const renderCMS = () => {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                <div className="space-y-6">
                    <Card className="p-0 overflow-hidden">
                        <div className="flex border-b border-silver-200 dark:border-silver-800 bg-silver-50 dark:bg-silver-900">
                             <button 
                                onClick={() => setActiveCmsTab('hero')}
                                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeCmsTab === 'hero' ? 'text-blucell-600 border-b-2 border-blucell-600 bg-white dark:bg-silver-800' : 'text-silver-500 hover:text-silver-700'}`}
                             >
                                 <LayoutTemplate className="w-4 h-4" /> Hero
                             </button>
                             <button 
                                onClick={() => setActiveCmsTab('features')}
                                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeCmsTab === 'features' ? 'text-blucell-600 border-b-2 border-blucell-600 bg-white dark:bg-silver-800' : 'text-silver-500 hover:text-silver-700'}`}
                             >
                                 <Layers className="w-4 h-4" /> Features
                             </button>
                             <button 
                                onClick={() => setActiveCmsTab('trending')}
                                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeCmsTab === 'trending' ? 'text-blucell-600 border-b-2 border-blucell-600 bg-white dark:bg-silver-800' : 'text-silver-500 hover:text-silver-700'}`}
                             >
                                 <ShoppingBag className="w-4 h-4" /> Trending
                             </button>
                             <button 
                                onClick={() => setActiveCmsTab('cta')}
                                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeCmsTab === 'cta' ? 'text-blucell-600 border-b-2 border-blucell-600 bg-white dark:bg-silver-800' : 'text-silver-500 hover:text-silver-700'}`}
                             >
                                 <MousePointer className="w-4 h-4" /> CTA
                             </button>
                        </div>
                        
                        <div className="p-6">
                            {/* Hero Tab */}
                            {activeCmsTab === 'hero' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-silver-900 dark:text-white">Hero Section Content</h4>
                                        <Button size="sm" variant="ghost" className="text-blucell-600" onClick={() => window.open('/', '_blank')}>
                                            Preview <ExternalLink className="w-3 h-3 ml-1" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <Input 
                                            label="Prefix" 
                                            value={cmsConfig.hero.titlePrefix} 
                                            onChange={e => setCmsConfig({...cmsConfig, hero: {...cmsConfig.hero, titlePrefix: e.target.value}})}
                                        />
                                        <Input 
                                            label="Highlight" 
                                            value={cmsConfig.hero.titleHighlight} 
                                            onChange={e => setCmsConfig({...cmsConfig, hero: {...cmsConfig.hero, titleHighlight: e.target.value}})}
                                        />
                                        <Input 
                                            label="Suffix" 
                                            value={cmsConfig.hero.titleSuffix} 
                                            onChange={e => setCmsConfig({...cmsConfig, hero: {...cmsConfig.hero, titleSuffix: e.target.value}})}
                                        />
                                    </div>
                                    <Input 
                                        label="Subtitle" 
                                        value={cmsConfig.hero.subtitle} 
                                        onChange={e => setCmsConfig({...cmsConfig, hero: {...cmsConfig.hero, subtitle: e.target.value}})}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input 
                                            label="Primary CTA" 
                                            value={cmsConfig.hero.ctaPrimary} 
                                            onChange={e => setCmsConfig({...cmsConfig, hero: {...cmsConfig.hero, ctaPrimary: e.target.value}})}
                                        />
                                        <Input 
                                            label="Secondary CTA" 
                                            value={cmsConfig.hero.ctaSecondary} 
                                            onChange={e => setCmsConfig({...cmsConfig, hero: {...cmsConfig.hero, ctaSecondary: e.target.value}})}
                                        />
                                    </div>

                                    {/* Hero Slideshow Management */}
                                    <div className="pt-4 mt-4 border-t border-silver-100 dark:border-silver-800">
                                        <h4 className="font-bold text-sm text-silver-900 dark:text-white mb-3">Hero Slideshow Images</h4>
                                        <div className="grid grid-cols-3 gap-4">
                                            {cmsConfig.hero.images?.map((img, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-silver-200 dark:border-silver-700 group">
                                                    <img src={img} className="w-full h-full object-cover" alt={`Slide ${idx + 1}`} />
                                                    <button 
                                                        onClick={() => removeHeroImage(idx)}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            <label className="border-2 border-dashed border-silver-300 dark:border-silver-700 rounded-lg flex flex-col items-center justify-center aspect-square cursor-pointer hover:bg-silver-50 dark:hover:bg-silver-800 transition-colors">
                                                <Upload className="w-6 h-6 text-silver-400 mb-2" />
                                                <span className="text-xs text-silver-500">Upload Image</span>
                                                <input type="file" className="hidden" accept="image/*" multiple onChange={handleHeroImageUpload} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Features Tab */}
                            {activeCmsTab === 'features' && (
                                <div className="space-y-6">
                                    <h4 className="font-bold text-silver-900 dark:text-white">Features Grid</h4>
                                    {cmsConfig.features.map((feature, idx) => (
                                        <div key={idx} className="p-4 bg-silver-50 dark:bg-silver-800/50 rounded-lg border border-silver-100 dark:border-silver-800">
                                            <p className="text-xs font-bold text-silver-400 mb-2 uppercase">Feature {idx + 1}</p>
                                            <div className="space-y-2">
                                                <Input 
                                                    placeholder="Title"
                                                    value={feature.title}
                                                    onChange={(e) => {
                                                        const newFeatures = [...cmsConfig.features];
                                                        newFeatures[idx] = { ...feature, title: e.target.value };
                                                        setCmsConfig({ ...cmsConfig, features: newFeatures });
                                                    }}
                                                />
                                                <Input 
                                                    placeholder="Description"
                                                    value={feature.description}
                                                    onChange={(e) => {
                                                        const newFeatures = [...cmsConfig.features];
                                                        newFeatures[idx] = { ...feature, description: e.target.value };
                                                        setCmsConfig({ ...cmsConfig, features: newFeatures });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Trending Tab */}
                            {activeCmsTab === 'trending' && (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <Input 
                                            label="Section Title"
                                            value={cmsConfig.trending.sectionTitle}
                                            onChange={(e) => setCmsConfig({...cmsConfig, trending: {...cmsConfig.trending, sectionTitle: e.target.value}})}
                                        />
                                        <Input 
                                            label="Section Subtitle"
                                            value={cmsConfig.trending.sectionSubtitle}
                                            onChange={(e) => setCmsConfig({...cmsConfig, trending: {...cmsConfig.trending, sectionSubtitle: e.target.value}})}
                                        />
                                    </div>
                                    <h5 className="font-bold text-sm text-silver-900 dark:text-white pt-4 border-t border-silver-100 dark:border-silver-800">Featured Items</h5>
                                    {cmsConfig.trending.items.map((item, idx) => (
                                        <div key={idx} className="p-3 border border-silver-100 dark:border-silver-800 rounded-lg flex gap-3">
                                            <img src={item.image} className="w-12 h-12 rounded bg-silver-100 object-cover" alt="" />
                                            <div className="flex-1 space-y-2">
                                                 <Input 
                                                    className="text-xs py-1 h-8"
                                                    placeholder="Title"
                                                    value={item.title}
                                                    onChange={(e) => {
                                                        const newItems = [...cmsConfig.trending.items];
                                                        newItems[idx] = { ...item, title: e.target.value };
                                                        setCmsConfig({ ...cmsConfig, trending: { ...cmsConfig.trending, items: newItems } });
                                                    }}
                                                />
                                                <Input 
                                                    className="text-xs py-1 h-8"
                                                    placeholder="Image URL"
                                                    value={item.image}
                                                    onChange={(e) => {
                                                        const newItems = [...cmsConfig.trending.items];
                                                        newItems[idx] = { ...item, image: e.target.value };
                                                        setCmsConfig({ ...cmsConfig, trending: { ...cmsConfig.trending, items: newItems } });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* CTA Tab */}
                            {activeCmsTab === 'cta' && (
                                <div className="space-y-4">
                                    <h4 className="font-bold text-silver-900 dark:text-white">Bottom Call to Action</h4>
                                    <Input 
                                        label="Title" 
                                        value={cmsConfig.ctaBottom.title} 
                                        onChange={e => setCmsConfig({...cmsConfig, ctaBottom: {...cmsConfig.ctaBottom, title: e.target.value}})}
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-silver-700 dark:text-silver-300 mb-1">Description</label>
                                        <textarea 
                                            className="w-full rounded-lg border border-silver-300 dark:border-silver-700 bg-white dark:bg-silver-950 px-3 py-2 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-blucell-500 text-silver-900 dark:text-silver-100"
                                            value={cmsConfig.ctaBottom.description}
                                            onChange={e => setCmsConfig({...cmsConfig, ctaBottom: {...cmsConfig.ctaBottom, description: e.target.value}})}
                                        />
                                    </div>
                                    <Input 
                                        label="Button Text" 
                                        value={cmsConfig.ctaBottom.buttonText} 
                                        onChange={e => setCmsConfig({...cmsConfig, ctaBottom: {...cmsConfig.ctaBottom, buttonText: e.target.value}})}
                                    />
                                </div>
                            )}

                            <div className="mt-6 pt-6 border-t border-silver-100 dark:border-silver-800 flex justify-end">
                                <Button onClick={handleSaveCMS}>Save Changes</Button>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Settings className="w-5 h-5 text-blucell-600" />
                            <h3 className="font-bold text-lg text-silver-900 dark:text-white">Platform Settings</h3>
                        </div>
                        <div className="space-y-4">
                            <Input 
                                label="Logo URL" 
                                placeholder="https://..." 
                                onChange={(e) => onUpdatePlatformSettings({ logo: e.target.value })}
                            />
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                     <Card className="p-6">
                         <h3 className="font-bold text-lg text-silver-900 dark:text-white mb-6">Contact Messages</h3>
                         <div className="space-y-4 max-h-[500px] overflow-y-auto">
                            {contactMessages.length === 0 && <p className="text-sm text-silver-500 italic">No messages received.</p>}
                            {contactMessages.map(msg => (
                                <div key={msg.id} className="p-4 border border-silver-100 dark:border-silver-800 rounded-lg relative group">
                                    <button 
                                        onClick={() => onDeleteContactMessage(msg.id)}
                                        className="absolute top-2 right-2 p-1 text-silver-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-sm text-silver-900 dark:text-white">{msg.subject}</h4>
                                        <span className="text-xs text-silver-400">{new Date(msg.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-xs text-blucell-600 font-medium mb-2">{msg.name} &lt;{msg.email}&gt;</p>
                                    <p className="text-sm text-silver-600 dark:text-silver-300 bg-silver-50 dark:bg-silver-800/50 p-3 rounded-md">
                                        {msg.message}
                                    </p>
                                </div>
                            ))}
                         </div>
                     </Card>
                </div>
            </div>
        );
    };

    const renderUsers = () => (
        <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-400" />
                    <Input placeholder="Search users..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <Button onClick={() => setIsAddUserModalOpen(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add User
                </Button>
            </div>
            
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-silver-50 dark:bg-silver-800 text-silver-500 font-medium border-b border-silver-100 dark:border-silver-800">
                            <tr>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-silver-100 dark:divide-silver-800">
                            {filteredUsers.map(u => (
                                <tr key={u.id} className="hover:bg-silver-50 dark:hover:bg-silver-800/50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <img src={u.avatar} alt="" className="w-8 h-8 rounded-full bg-silver-200 object-cover" />
                                            <div>
                                                <p className="font-bold text-silver-900 dark:text-white">{u.name}</p>
                                                <p className="text-xs text-silver-500">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3"><Badge>{u.role}</Badge></td>
                                    <td className="px-4 py-3">
                                        {u.availabilityStatus && <StatusIndicator status={u.availabilityStatus} />}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="text-silver-400 hover:text-blucell-600 transition-colors mr-2"><Edit className="w-4 h-4" /></button>
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
                        <Input label="Name" value={newUserData.name} onChange={e => setNewUserData({...newUserData, name: e.target.value})} required />
                        <Input label="Email" type="email" value={newUserData.email} onChange={e => setNewUserData({...newUserData, email: e.target.value})} required />
                        <div>
                            <label className="block text-sm font-medium text-silver-700 dark:text-silver-300 mb-1">Role</label>
                            <select 
                                className="w-full rounded-lg border border-silver-300 dark:border-silver-700 bg-white dark:bg-silver-950 px-3 py-2 text-sm"
                                value={newUserData.role}
                                onChange={e => setNewUserData({...newUserData, role: e.target.value as UserRole})}
                            >
                                <option value="CUSTOMER">Customer</option>
                                <option value="FIXER">Fixer</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button type="submit">Create User</Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );

    const renderProducts = () => (
        <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-400" />
                    <Input placeholder="Search products..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <Button onClick={() => openProductModal()} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Product
                </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(p => (
                    <Card key={p.id} className="group overflow-hidden flex flex-col">
                        <div className="relative h-40 bg-silver-100 dark:bg-silver-800">
                             <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                             <button 
                                onClick={() => onDeleteProduct(p.id)}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                                 <Trash2 className="w-4 h-4" />
                             </button>
                             <button 
                                onClick={() => openProductModal(p)}
                                className="absolute top-2 right-10 p-1.5 bg-blucell-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                                 <Edit className="w-4 h-4" />
                             </button>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h4 className="font-bold text-silver-900 dark:text-white line-clamp-1">{p.name}</h4>
                            <div className="flex justify-between items-center mt-2 mb-4">
                                <span className="text-sm font-medium text-silver-500">{p.category}</span>
                                <span className="font-bold text-blucell-600">{formatPrice(p.price)}</span>
                            </div>
                            <div className="flex gap-2 mt-auto">
                                <Badge color={p.status === 'IN_STOCK' ? 'green' : 'red'}>{p.status.replace('_', ' ')}</Badge>
                                {p.isBestSeller && <Badge color="yellow">Best Seller</Badge>}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {isProductModalOpen && (
                <Modal title={currentProduct.id ? 'Edit Product' : 'Add Product'} onClose={() => setIsProductModalOpen(false)}>
                    <form onSubmit={handleProductSubmit} className="space-y-4">
                        <Input label="Name" value={currentProduct.name || ''} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} required />
                        <div className="grid grid-cols-2 gap-4">
                             <Input label="Price" type="number" value={currentProduct.price || ''} onChange={e => setCurrentProduct({...currentProduct, price: Number(e.target.value)})} required />
                             <div>
                                <label className="block text-sm font-medium text-silver-700 dark:text-silver-300 mb-1">Category</label>
                                <select 
                                    className="w-full rounded-lg border border-silver-300 dark:border-silver-700 bg-white dark:bg-silver-950 px-3 py-2 text-sm"
                                    value={currentProduct.category}
                                    onChange={e => setCurrentProduct({...currentProduct, category: e.target.value as any})}
                                >
                                    {['Phone', 'Laptop', 'Audio', 'Camera', 'Gaming', 'Drone', 'Others'].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                             </div>
                        </div>
                        <Input label="Image URL" value={currentProduct.image || ''} onChange={e => setCurrentProduct({...currentProduct, image: e.target.value})} />
                         <div>
                            <label className="block text-sm font-medium text-silver-700 dark:text-silver-300 mb-1">Description</label>
                            <textarea 
                                className="w-full rounded-lg border border-silver-300 dark:border-silver-700 bg-white dark:bg-silver-950 px-3 py-2 text-sm h-24"
                                value={currentProduct.description || ''}
                                onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})}
                            />
                        </div>
                         <div className="flex gap-4 items-center">
                             <label className="flex items-center gap-2 text-sm">
                                 <input 
                                    type="checkbox" 
                                    checked={currentProduct.status === 'IN_STOCK'} 
                                    onChange={e => setCurrentProduct({...currentProduct, status: e.target.checked ? 'IN_STOCK' : 'OUT_OF_STOCK'})}
                                 /> In Stock
                             </label>
                             <label className="flex items-center gap-2 text-sm">
                                 <input 
                                    type="checkbox" 
                                    checked={currentProduct.isBestSeller || false} 
                                    onChange={e => setCurrentProduct({...currentProduct, isBestSeller: e.target.checked})}
                                 /> Best Seller
                             </label>
                         </div>
                        <div className="flex justify-end pt-4">
                            <Button type="submit">Save Product</Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );

    const renderOrders = () => (
         <div className="space-y-6 animate-fade-in">
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-silver-50 dark:bg-silver-800 text-silver-500 font-medium border-b border-silver-100 dark:border-silver-800">
                            <tr>
                                <th className="px-4 py-3">Order ID</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Items</th>
                                <th className="px-4 py-3">Total</th>
                                <th className="px-4 py-3">Status</th>
                                {user.role === 'ADMIN' && <th className="px-4 py-3 text-right">Action</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-silver-100 dark:divide-silver-800">
                            {myOrders.map(order => (
                                <tr key={order.id} className="hover:bg-silver-50 dark:hover:bg-silver-800/50">
                                    <td className="px-4 py-3 font-medium text-blucell-600">#{order.id}</td>
                                    <td className="px-4 py-3 text-silver-500">{order.date}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex -space-x-2">
                                            {order.items.map((item, i) => (
                                                <img key={i} src={item.image} className="w-8 h-8 rounded-full border-2 border-white dark:border-silver-900 object-cover" title={item.productName} alt="" />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-bold">{formatPrice(order.total)}</td>
                                    <td className="px-4 py-3">
                                        <Badge color={order.status === 'DELIVERED' ? 'green' : order.status === 'SHIPPED' ? 'blue' : 'yellow'}>{order.status}</Badge>
                                    </td>
                                    {user.role === 'ADMIN' && (
                                        <td className="px-4 py-3 text-right">
                                            <select 
                                                className="text-xs border rounded p-1 bg-transparent"
                                                value={order.status}
                                                onChange={(e) => onUpdateOrder(order.id, e.target.value as any)}
                                            >
                                                <option value="PROCESSING">Processing</option>
                                                <option value="SHIPPED">Shipped</option>
                                                <option value="DELIVERED">Delivered</option>
                                            </select>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );

    const renderRepairs = () => (
        <div className="space-y-6 animate-fade-in">
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-silver-50 dark:bg-silver-800 text-silver-500 font-medium border-b border-silver-100 dark:border-silver-800">
                            <tr>
                                <th className="px-4 py-3">Job ID</th>
                                <th className="px-4 py-3">Device</th>
                                <th className="px-4 py-3">Issue</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-silver-100 dark:divide-silver-800">
                            {myRepairs.map(repair => (
                                <tr key={repair.id} className="hover:bg-silver-50 dark:hover:bg-silver-800/50">
                                    <td className="px-4 py-3 font-medium text-blucell-600">{repair.id}</td>
                                    <td className="px-4 py-3">{repair.deviceType}</td>
                                    <td className="px-4 py-3 max-w-xs truncate text-silver-500">{repair.issueDescription}</td>
                                    <td className="px-4 py-3 text-silver-500">{repair.dateBooked}</td>
                                    <td className="px-4 py-3">
                                         <Badge color={
                                            repair.status === 'COMPLETED' ? 'green' : 
                                            repair.status === 'IN_PROGRESS' ? 'blue' : 
                                            repair.status === 'DIAGNOSING' ? 'yellow' : 'yellow'
                                        }>{repair.status}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button size="sm" variant="ghost" onClick={() => openRepairModal(repair)}>Details</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {viewingRepair && (
                <Modal title={`Repair Details: ${viewingRepair.id}`} onClose={() => setViewingRepair(null)}>
                     <div className="space-y-4">
                         <div className="bg-silver-50 dark:bg-silver-800 p-4 rounded-lg">
                            <p className="font-bold">{viewingRepair.deviceType}</p>
                            <p className="text-sm text-silver-600 dark:text-silver-400 mt-1">{viewingRepair.issueDescription}</p>
                         </div>
                         
                         {user.role !== 'CUSTOMER' && (
                             <>
                                <div>
                                    <label className="block text-sm font-medium text-silver-700 dark:text-silver-300 mb-1">Diagnosis Notes</label>
                                    <textarea 
                                        className="w-full rounded-lg border border-silver-300 dark:border-silver-700 bg-white dark:bg-silver-950 px-3 py-2 text-sm h-20"
                                        value={repairForm.notes}
                                        onChange={e => setRepairForm({...repairForm, notes: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <label className="block text-sm font-medium text-silver-700 dark:text-silver-300 mb-1">Status</label>
                                        <select 
                                            className="w-full rounded-lg border border-silver-300 dark:border-silver-700 bg-white dark:bg-silver-950 px-3 py-2 text-sm"
                                            value={repairForm.status}
                                            onChange={e => setRepairForm({...repairForm, status: e.target.value as any})}
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="DIAGNOSING">Diagnosing</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="COMPLETED">Completed</option>
                                            <option value="DELIVERED">Delivered</option>
                                        </select>
                                    </div>
                                    <Input label="Est. Cost" type="number" value={repairForm.cost} onChange={e => setRepairForm({...repairForm, cost: e.target.value})} />
                                </div>
                                <div className="flex justify-end pt-4 gap-2">
                                     <Button variant="ghost" onClick={() => navigate(`/dashboard?chatRepairId=${viewingRepair.id}`)}>Chat Customer</Button>
                                     <Button onClick={handleSaveRepair}>Update Repair</Button>
                                </div>
                             </>
                         )}
                         {user.role === 'CUSTOMER' && (
                             <div className="space-y-4">
                                 {viewingRepair.aiDiagnosis && (
                                     <div className="p-3 bg-blucell-50 dark:bg-blucell-900/20 border border-blucell-100 dark:border-blucell-800 rounded-lg">
                                        <h5 className="text-xs font-bold text-blucell-600 mb-1 uppercase">Technician Notes</h5>
                                        <p className="text-sm">{viewingRepair.aiDiagnosis}</p>
                                     </div>
                                 )}
                                 <div className="flex justify-between items-center p-4 bg-silver-50 dark:bg-silver-800 rounded-lg">
                                     <span className="font-medium">Estimated Cost</span>
                                     <span className="font-bold text-lg">{formatPrice(viewingRepair.estimatedCost || 0)}</span>
                                 </div>
                             </div>
                         )}
                     </div>
                </Modal>
            )}
        </div>
    );

    const renderSupport = () => {
        const activeSession = supportSessions.find(s => s.id === activeSessionId);
        
        return (
            <div className="h-[600px] flex gap-6 animate-fade-in">
                <Card className="w-1/3 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-silver-100 dark:border-silver-800 bg-silver-50 dark:bg-silver-900">
                        <h3 className="font-bold">Active Sessions</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {supportSessions.map(session => (
                            <div 
                                key={session.id}
                                onClick={() => setActiveSessionId(session.id)}
                                className={`p-4 border-b border-silver-100 dark:border-silver-800 cursor-pointer hover:bg-silver-50 dark:hover:bg-silver-800/50 transition-colors ${activeSessionId === session.id ? 'bg-blucell-50 dark:bg-blucell-900/10 border-l-4 border-l-blucell-600' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <img src={session.userAvatar} className="w-6 h-6 rounded-full" alt="" />
                                        <span className="font-bold text-sm">{session.userName}</span>
                                    </div>
                                    {session.unreadCount > 0 && <span className="bg-red-500 text-white text-xs px-1.5 rounded-full">{session.unreadCount}</span>}
                                </div>
                                <p className="text-xs text-silver-500 truncate">{session.lastMessage}</p>
                            </div>
                        ))}
                    </div>
                </Card>
                
                <Card className="flex-1 flex flex-col overflow-hidden">
                    {activeSession ? (
                        <>
                             <div className="p-4 border-b border-silver-100 dark:border-silver-800 flex justify-between items-center bg-silver-50 dark:bg-silver-900">
                                <div className="flex items-center gap-3">
                                    <img src={activeSession.userAvatar} className="w-10 h-10 rounded-full" alt="" />
                                    <div>
                                        <h3 className="font-bold">{activeSession.userName}</h3>
                                        <p className="text-xs text-silver-500">Customer</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">Close Ticket</Button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-silver-50/50 dark:bg-silver-900/50">
                                {activeSession.messages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.senderId === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
                                            msg.senderId === 'admin' 
                                            ? 'bg-blucell-600 text-white rounded-br-none' 
                                            : 'bg-white dark:bg-silver-800 shadow-sm rounded-bl-none'
                                        }`}>
                                            <p>{msg.text}</p>
                                            <p className={`text-[10px] mt-1 text-right ${msg.senderId === 'admin' ? 'text-blucell-200' : 'text-silver-400'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>
                            <div className="p-4 border-t border-silver-100 dark:border-silver-800 flex gap-2">
                                <Input 
                                    placeholder="Type your reply..." 
                                    value={chatReply}
                                    onChange={e => setChatReply(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                                />
                                <Button onClick={handleSendChat}><Send className="w-4 h-4" /></Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-silver-400">
                            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                            <p>Select a conversation to start chatting.</p>
                        </div>
                    )}
                </Card>
            </div>
        );
    };

    return (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] pt-6 gap-6 container mx-auto px-4 pb-12">
            {renderSidebar()}
            <main className="flex-1 min-w-0">
                <SectionTitle title={activeTab === 'overview' ? `Welcome back, ${user.name}` : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} />
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'users' && renderUsers()}
                {activeTab === 'orders' && renderOrders()}
                {activeTab === 'products' && renderProducts()}
                {activeTab === 'repairs' && renderRepairs()}
                {activeTab === 'cms' && renderCMS()}
                {activeTab === 'support' && renderSupport()}
            </main>
        </div>
    );
};