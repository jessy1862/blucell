
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, Product, Order, RepairJob, ChatSession, LandingPageConfig, ContactInfo, ContactMessage, UserRole, AvailabilityStatus, ChatMessage, TeamMember } from '../types';
import { Card, Button, Input, Badge, SectionTitle, Modal, StatusIndicator } from '../components/ui';
import { 
    Users, ShoppingBag, Wrench, MessageSquare, LayoutTemplate, 
    Search, Plus, Filter, MoreVertical, Check, X, 
    Package, DollarSign, Clock, AlertCircle, Edit, Trash2, 
    ChevronRight, Send, Save, User as UserIcon, Image as ImageIcon,
    LogOut, Settings, ExternalLink, BarChart as BarChartIcon, Layers, Type, MousePointer, Upload, Eye, ShieldAlert, Database, Lock, RefreshCw, Terminal, Briefcase, Cpu, Truck
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SEED_PRODUCTS } from '../constants';

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
  onCreateSession: (userId: string) => string;
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
  platformLogo?: string;
  team: TeamMember[];
  onUpdateTeam: (team: TeamMember[]) => void;
  repairChats: Record<string, ChatMessage[]>;
  onSendRepairMessage: (repairId: string, text: string, senderId: string) => void;
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
    supportSessions, onAdminReply, onCreateSession,
    // CMS Props
    landingPageConfig, onUpdateLandingPage, contactInfo, onUpdateContactInfo, onUpdatePlatformSettings,
    contactMessages, onDeleteContactMessage, platformLogo,
    team, onUpdateTeam,
    // Repair Chat Props
    repairChats, onSendRepairMessage
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Initial Tab State
    const getInitialTab = () => {
        const params = new URLSearchParams(location.search);
        const chatRepairId = params.get('chatRepairId');
        if (chatRepairId) return 'support'; // Actually this might redirect to repairs now if support is admin only
        if (user.role === 'FIXER') return 'repairs';
        return 'overview';
    };

    const [activeTab, setActiveTab] = useState(getInitialTab());
    const [searchTerm, setSearchTerm] = useState('');
    
    // --- User Management State ---
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [viewingUser, setViewingUser] = useState<User | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [newUserData, setNewUserData] = useState<Partial<User>>({ name: '', email: '', role: 'CUSTOMER' });

    // --- Repair Management State ---
    const [viewingRepair, setViewingRepair] = useState<RepairJob | null>(null);
    const [repairForm, setRepairForm] = useState<{ status: RepairJob['status'], cost: string, notes: string }>({ status: 'PENDING', cost: '', notes: '' });
    const [repairChatInput, setRepairChatInput] = useState('');
    const repairChatEndRef = useRef<HTMLDivElement>(null);

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
    const [activeCmsTab, setActiveCmsTab] = useState<'hero' | 'features' | 'trending' | 'cta' | 'contact' | 'messages' | 'settings' | 'team'>('hero');
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [currentTeamMember, setCurrentTeamMember] = useState<Partial<TeamMember>>({});
    
    // --- System State ---
    const [isResetting, setIsResetting] = useState(false);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [systemLogs, setSystemLogs] = useState<{timestamp: string, level: string, message: string}[]>([
        { timestamp: new Date().toISOString(), level: 'INFO', message: 'System initialized' },
        { timestamp: new Date().toISOString(), level: 'INFO', message: 'Dashboard loaded successfully' },
        { timestamp: new Date().toISOString(), level: 'INFO', message: 'Database connection verified (Neon)' },
    ]);

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
        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return allOrders;
        // In a real app, filtering would be by userId. Here we show all for admin, or mock for customer.
        return allOrders; 
    }, [allOrders, user]);

    const myRepairs = useMemo(() => {
        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return allRepairs;
        if (user.role === 'FIXER') {
            // Fixers see jobs assigned to them OR jobs that are unassigned
            return allRepairs.filter(r => r.fixerId === user.id || !r.fixerId);
        }
        return allRepairs.filter(r => r.customerId === user.id);
    }, [allRepairs, user]);

    // Analytics Data (Real Calculation from allOrders)
    const revenueData = useMemo(() => {
        const data: Record<string, { revenue: number, orders: number }> = {};
        
        allOrders.forEach(order => {
            if (!order.date) return;
            const date = new Date(order.date);
            const key = date.toLocaleString('default', { month: 'short' }); // e.g., "Oct"
            
            if (!data[key]) {
                data[key] = { revenue: 0, orders: 0 };
            }
            data[key].revenue += order.total;
            data[key].orders += 1;
        });

        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const sortedData = Object.entries(data).sort((a, b) => {
            return monthOrder.indexOf(a[0]) - monthOrder.indexOf(b[0]);
        });

        if (sortedData.length === 0) {
             return monthOrder.slice(0, 6).map(m => ({ name: m, revenue: 0, orders: 0 }));
        }

        return sortedData.map(([name, stats]) => ({
            name,
            revenue: stats.revenue,
            orders: stats.orders
        }));
    }, [allOrders]);

    // Scroll to bottom of chat when opening a session
    useEffect(() => {
        if (activeSessionId) {
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    }, [activeSessionId, supportSessions]);

    // Scroll to bottom of repair chat
    useEffect(() => {
        if (viewingRepair) {
            setTimeout(() => repairChatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    }, [viewingRepair, repairChats]);

    // Handle Chat Navigation from URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const chatRepairId = params.get('chatRepairId');
        
        if (chatRepairId && allRepairs.length > 0) {
            const repair = allRepairs.find(r => r.id === chatRepairId);
            if (repair && repair.customerId) {
                // Determine if we should go to repairs tab or support tab based on role
                // Since support tab is now restricted, customer might need redirection logic if we had unified chat
                // But for now, we assume this link is mostly for repair chat context
                if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
                     // Admins might want to see the repair details directly
                     setViewingRepair(repair);
                     setActiveTab('repairs');
                } else if (user.role === 'CUSTOMER' || user.role === 'FIXER') {
                     setViewingRepair(repair);
                     setActiveTab('repairs');
                }
            }
        }
    }, [location.search, allRepairs, user.role]);

    // --- Handlers ---

    const addLog = (level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS', message: string) => {
        setSystemLogs(prev => [{
            timestamp: new Date().toISOString(),
            level,
            message
        }, ...prev]);
    };

    const handleClaimRepair = (repair: RepairJob) => {
        onUpdateRepair({
            ...repair,
            fixerId: user.id,
            status: 'DIAGNOSING'
        });
        addLog('INFO', `Repair ${repair.id} claimed by ${user.name}`);
    };

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

    const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setCurrentProduct(prev => ({ ...prev, image: base64 }));
            };
            reader.readAsDataURL(file);
        }
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
                aiDiagnosis: repairForm.notes || viewingRepair.aiDiagnosis
            });
            setViewingRepair(null);
        }
    };

    const handleSendRepairChat = () => {
        if (!viewingRepair || !repairChatInput.trim()) return;
        onSendRepairMessage(viewingRepair.id, repairChatInput, user.id);
        setRepairChatInput('');
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
                reader.readAsDataURL(file as Blob);
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

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                onUpdatePlatformSettings({ logo: base64 });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTeamMemberImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setCurrentTeamMember(prev => ({ ...prev, image: base64 }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTeamMemberSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newMember: TeamMember = {
            id: currentTeamMember.id || `t-${Date.now()}`,
            name: currentTeamMember.name || 'New Member',
            role: currentTeamMember.role || 'Role',
            image: currentTeamMember.image || 'https://ui-avatars.com/api/?name=New+Member&background=random'
        };

        if (currentTeamMember.id) {
            onUpdateTeam(team.map(m => m.id === newMember.id ? newMember : m));
        } else {
            onUpdateTeam([...team, newMember]);
        }
        setIsTeamModalOpen(false);
        setCurrentTeamMember({});
    };

    const handleDeleteTeamMember = (id: string) => {
        if (window.confirm("Are you sure you want to remove this team member?")) {
            onUpdateTeam(team.filter(m => m.id !== id));
        }
    };

    const handleResetDemoData = async () => {
        if (!confirm("Are you sure you want to reinstall the product catalog? This will add seed products to the database if they don't exist.")) return;
        
        setIsResetting(true);
        addLog('INFO', 'Starting product catalog seeding...');
        try {
            for (const p of SEED_PRODUCTS) {
               // Check if exists to avoid duplicates in local state logic
               const exists = products.some(ex => ex.id === p.id);
               if (!exists) {
                   onAddProduct(p);
                   addLog('INFO', `Added product: ${p.name}`);
               } else {
                   // Optional: Force update to match seed data
                   onUpdateProduct(p);
                   addLog('INFO', `Updated existing product: ${p.name}`);
               }
               // Small delay to prevent UI freezing and API rate limits
               await new Promise(r => setTimeout(r, 50)); 
            }
            addLog('SUCCESS', 'Product catalog successfully reinstalled and updated.');
            alert("Product catalog has been successfully reinstalled and updated.");
        } catch (e: any) {
            console.error(e);
            addLog('ERROR', `Failed to seed data: ${e.message}`);
            alert("Failed to seed data. Check console for details.");
        } finally {
            setIsResetting(false);
        }
    };

    const handleClearCache = () => {
        if (window.confirm("Are you sure you want to clear the local system cache? This will reset local settings, CMS drafts, and the cart.")) {
            localStorage.removeItem('blucell_cart');
            localStorage.removeItem('blucell_landing_config');
            localStorage.removeItem('blucell_contact_info');
            localStorage.removeItem('blucell_team');
            // We keep branding (logo) intentionally for continuity
            addLog('WARN', 'System cache cleared manually by Super Admin.');
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    };

    // --- Render Functions ---

    const renderSidebar = () => {
        const tabs = [
            { id: 'overview', label: 'Overview', icon: LayoutTemplate, roles: ['ADMIN', 'FIXER', 'CUSTOMER', 'SUPER_ADMIN'] },
            { id: 'users', label: 'Users', icon: Users, roles: ['ADMIN', 'SUPER_ADMIN'] },
            { id: 'products', label: 'Products', icon: ShoppingBag, roles: ['ADMIN', 'SUPER_ADMIN'] },
            { id: 'orders', label: 'Orders', icon: Package, roles: ['ADMIN', 'CUSTOMER', 'SUPER_ADMIN'] },
            { id: 'repairs', label: 'Repairs', icon: Wrench, roles: ['ADMIN', 'FIXER', 'CUSTOMER', 'SUPER_ADMIN'] },
            { id: 'cms', label: 'Content & Settings', icon: Settings, roles: ['ADMIN', 'SUPER_ADMIN'] },
            { id: 'support', label: 'Support Chat', icon: MessageSquare, roles: ['ADMIN', 'SUPER_ADMIN'] }, // Removed FIXER
            { id: 'system', label: 'Super Admin', icon: ShieldAlert, roles: ['SUPER_ADMIN'] },
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
                 {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
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
            {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
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
                                <div className="text-right">
                                    <Badge color={repair.status === 'COMPLETED' ? 'green' : 'blue'}>{repair.status}</Badge>
                                    {!repair.fixerId && (
                                        <span className="block text-[10px] text-orange-500 mt-1">Unassigned</span>
                                    )}
                                </div>
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

    const renderUsers = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-400" />
                    <Input 
                        placeholder="Search users..." 
                        className="pl-10" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={() => setIsAddUserModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add User
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
                                <tr key={u.id} className="hover:bg-silver-50 dark:hover:bg-silver-800/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <img src={u.avatar} alt="" className="w-8 h-8 rounded-full bg-silver-200 object-cover" />
                                            <div>
                                                <p className="font-medium text-silver-900 dark:text-white">{u.name}</p>
                                                <p className="text-xs text-silver-500">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge color={u.role === 'ADMIN' ? 'red' : u.role === 'FIXER' ? 'yellow' : 'blue'}>{u.role}</Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        {u.role === 'FIXER' ? (
                                            <StatusIndicator status={u.availabilityStatus || 'OFFLINE'} />
                                        ) : (
                                            <span className="text-silver-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button 
                                            className="text-silver-400 hover:text-blucell-600 transition-colors p-1"
                                            onClick={() => setEditingUser(u)}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
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
                        <Input label="Full Name" value={newUserData.name} onChange={e => setNewUserData({...newUserData, name: e.target.value})} required />
                        <Input label="Email" type="email" value={newUserData.email} onChange={e => setNewUserData({...newUserData, email: e.target.value})} required />
                        <div>
                            <label className="block text-sm font-medium text-silver-700 dark:text-silver-300 mb-1">Role</label>
                            <select 
                                className="w-full rounded-lg border border-silver-300 dark:border-silver-700 bg-white dark:bg-silver-950 px-3 py-2 text-sm"
                                value={newUserData.role}
                                onChange={(e) => setNewUserData({...newUserData, role: e.target.value as UserRole})}
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

            {editingUser && (
                <Modal title="Edit User" onClose={() => setEditingUser(null)}>
                     <div className="space-y-4">
                        <Input label="Full Name" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} />
                        <Input label="Email" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} />
                         <div>
                            <label className="block text-sm font-medium text-silver-700 dark:text-silver-300 mb-1">Role</label>
                            <select 
                                className="w-full rounded-lg border border-silver-300 dark:border-silver-700 bg-white dark:bg-silver-950 px-3 py-2 text-sm"
                                value={editingUser.role}
                                onChange={(e) => setEditingUser({...editingUser, role: e.target.value as UserRole})}
                            >
                                <option value="CUSTOMER">Customer</option>
                                <option value="FIXER">Fixer</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button onClick={() => { onUpdateUserAdmin(editingUser); setEditingUser(null); }}>Save Changes</Button>
                        </div>
                     </div>
                </Modal>
            )}
        </div>
    );

    const renderProducts = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                 <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-400" />
                    <Input 
                        placeholder="Search products..." 
                        className="pl-10" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={() => openProductModal()}>
                    <Plus className="w-4 h-4 mr-2" /> Add Product
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                    <Card key={product.id} className="group overflow-hidden flex flex-col h-full border-silver-200 dark:border-silver-800">
                        <div className="relative aspect-square bg-silver-100 dark:bg-silver-800">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openProductModal(product)} className="p-1.5 bg-white dark:bg-silver-800 rounded-md shadow-sm hover:text-blucell-600">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => onDeleteProduct(product.id)} className="p-1.5 bg-white dark:bg-silver-800 rounded-md shadow-sm hover:text-red-600">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                            <h3 className="font-bold text-silver-900 dark:text-white line-clamp-1">{product.name}</h3>
                            <p className="text-sm text-silver-500 mb-2">{product.category}</p>
                            <div className="mt-auto flex justify-between items-center">
                                <span className="font-bold">{formatPrice(product.price)}</span>
                                <Badge color={product.status === 'IN_STOCK' ? 'green' : 'red'}>{product.status === 'IN_STOCK' ? 'In Stock' : 'Out'}</Badge>
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
                        
                        <div>
                            <label className="block text-sm font-medium text-silver-700 dark:text-silver-300 mb-1">Product Image</label>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-20 h-20 bg-silver-100 dark:bg-silver-800 rounded-lg overflow-hidden border border-silver-200 dark:border-silver-700 flex items-center justify-center">
                                    {currentProduct.image ? (
                                        <img src={currentProduct.image} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="w-8 h-8 text-silver-400" />
                                    )}
                                </div>
                                <label className="cursor-pointer bg-silver-50 dark:bg-silver-800 hover:bg-silver-100 dark:hover:bg-silver-700 border border-silver-300 dark:border-silver-600 px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2">
                                    <Upload className="w-4 h-4" />
                                    <span>Upload Image</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleProductImageUpload} />
                                </label>
                            </div>
                            <Input label="Or Image URL" value={currentProduct.image || ''} onChange={e => setCurrentProduct({...currentProduct, image: e.target.value})} placeholder="https://..." />
                        </div>

                        <div>
                             <label className="block text-sm font-medium text-silver-700 dark:text-silver-300 mb-1">Description</label>
                             <textarea 
                                className="w-full rounded-lg border border-silver-300 dark:border-silver-700 bg-white dark:bg-silver-950 px-3 py-2 text-sm"
                                value={currentProduct.description || ''}
                                onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})}
                             />
                        </div>
                        <div className="flex items-center gap-2">
                             <input 
                                type="checkbox" 
                                id="bestSeller" 
                                checked={currentProduct.isBestSeller || false} 
                                onChange={e => setCurrentProduct({...currentProduct, isBestSeller: e.target.checked})} 
                             />
                             <label htmlFor="bestSeller" className="text-sm font-medium">Mark as Best Seller</label>
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
             <div className="flex justify-between items-center">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-400" />
                    <Input 
                        placeholder="Search orders..." 
                        className="pl-10" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            
            <div className="space-y-4">
                {myOrders.filter(o => o.id.includes(searchTerm)).map(order => (
                    <Card key={order.id} className="p-0 overflow-hidden">
                        <div className="p-4 border-b border-silver-100 dark:border-silver-800 bg-silver-50 dark:bg-silver-800/50 flex flex-wrap justify-between items-center gap-4">
                            <div>
                                <p className="font-bold text-silver-900 dark:text-white">Order #{order.id}</p>
                                <p className="text-xs text-silver-500">{new Date(order.date).toLocaleDateString()}</p>
                            </div>
                            
                            {order.status === 'SHIPPED' && (
                                <div className="hidden sm:block text-right">
                                    <p className="text-xs text-silver-500 uppercase font-bold flex items-center gap-1 justify-end">
                                        <Truck className="w-3 h-3" /> Tracking
                                    </p>
                                    <a href="#" onClick={(e) => { e.preventDefault(); alert(`Tracking TN${order.id.replace(/\D/g, '').padEnd(9, '0')}: Package is in transit.`); }} className="text-sm font-mono text-blucell-600 hover:text-blucell-500 flex items-center gap-1">
                                        TN{order.id.replace(/\D/g, '').padEnd(9, '0')} <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <span className="font-bold text-silver-900 dark:text-white">{formatPrice(order.total)}</span>
                                <Badge color={order.status === 'DELIVERED' ? 'green' : 'blue'}>{order.status}</Badge>
                                {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                                    <button 
                                        onClick={() => setViewingOrder(order)} 
                                        className="p-1 hover:bg-silver-200 dark:hover:bg-silver-700 rounded transition-colors"
                                    >
                                        <MoreVertical className="w-4 h-4 text-silver-500" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="p-4">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex items-center gap-4 mb-2 last:mb-0">
                                    <div className="w-12 h-12 bg-silver-100 rounded overflow-hidden shrink-0">
                                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{item.productName}</p>
                                        <p className="text-xs text-silver-500">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>

            {viewingOrder && (
                <Modal title={`Manage Order #${viewingOrder.id}`} onClose={() => setViewingOrder(null)}>
                    <div className="space-y-4">
                        <p className="text-sm text-silver-500">Update order status:</p>
                        <div className="flex flex-col gap-2">
                            {['PROCESSING', 'SHIPPED', 'DELIVERED'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => { onUpdateOrder(viewingOrder.id, status as any); setViewingOrder(null); }}
                                    className={`p-3 rounded-lg text-left text-sm font-medium border ${
                                        viewingOrder.status === status 
                                        ? 'border-blucell-500 bg-blucell-50 text-blucell-700' 
                                        : 'border-silver-200 dark:border-silver-700 hover:bg-silver-50 dark:hover:bg-silver-800'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );

    const renderRepairs = () => (
        <div className="space-y-6 animate-fade-in">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Left List */}
                 <div className="lg:col-span-1 space-y-4 h-[calc(100vh-200px)] overflow-y-auto pr-2">
                     <Input 
                        placeholder="Search repairs..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-4"
                     />
                     {myRepairs.map(repair => (
                         <div 
                            key={repair.id} 
                            onClick={() => openRepairModal(repair)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                                viewingRepair?.id === repair.id 
                                ? 'border-blucell-500 bg-blucell-50 dark:bg-blucell-900/20 shadow-md' 
                                : 'border-silver-200 dark:border-silver-800 bg-white dark:bg-silver-900 hover:border-blucell-300'
                            }`}
                         >
                             <div className="flex justify-between items-start mb-2">
                                 <span className="font-bold text-sm">{repair.deviceType}</span>
                                 <Badge color={
                                     repair.status === 'COMPLETED' ? 'green' : 
                                     repair.status === 'DIAGNOSING' ? 'yellow' : 'blue'
                                 }>{repair.status}</Badge>
                             </div>
                             <p className="text-xs text-silver-500 line-clamp-2 mb-2">{repair.issueDescription}</p>
                             <div className="flex justify-between items-center text-xs text-silver-400">
                                 <span>{new Date(repair.dateBooked).toLocaleDateString()}</span>
                                 {repair.fixerId ? (
                                     <div className="flex items-center gap-1">
                                         <UserIcon className="w-3 h-3" />
                                         <span>{repair.fixerId === user.id ? 'You' : 'Assigned'}</span>
                                     </div>
                                 ) : (
                                     <span className="text-orange-500 font-bold flex items-center gap-1">
                                         <AlertCircle className="w-3 h-3" /> Unassigned
                                     </span>
                                 )}
                             </div>
                         </div>
                     ))}
                 </div>

                 {/* Right Detail */}
                 <div className="lg:col-span-2">
                     {viewingRepair ? (
                         <Card className="h-full p-6 flex flex-col">
                             <div className="flex justify-between items-start mb-6 pb-6 border-b border-silver-100 dark:border-silver-800">
                                 <div>
                                     <h3 className="text-xl font-bold mb-1">{viewingRepair.deviceType}</h3>
                                     <p className="text-sm text-silver-500">ID: {viewingRepair.id}</p>
                                 </div>
                                 <div className="text-right">
                                     <Badge color="blue">{viewingRepair.status}</Badge>
                                     {viewingRepair.estimatedCost && (
                                         <p className="font-bold text-lg mt-2">{formatPrice(viewingRepair.estimatedCost)}</p>
                                     )}
                                 </div>
                             </div>

                             <div className="space-y-6 flex-1 overflow-y-auto">
                                 <div>
                                     <h4 className="font-semibold text-sm text-silver-500 mb-2 uppercase">Issue Description</h4>
                                     <p className="text-silver-800 dark:text-silver-200 bg-silver-50 dark:bg-silver-800 p-4 rounded-lg">
                                         {viewingRepair.issueDescription}
                                     </p>
                                 </div>

                                 {viewingRepair.aiDiagnosis && (
                                     <div>
                                         <h4 className="font-semibold text-sm text-blucell-600 mb-2 uppercase flex items-center gap-2">
                                             <Cpu className="w-4 h-4" /> AI Diagnosis
                                         </h4>
                                         <div className="bg-blucell-50 dark:bg-blucell-900/20 border border-blucell-100 dark:border-blucell-900 p-4 rounded-lg text-sm text-silver-800 dark:text-silver-200">
                                             {viewingRepair.aiDiagnosis}
                                         </div>
                                     </div>
                                 )}

                                 {/* --- Repair Chat Section --- */}
                                 {(viewingRepair.customerId === user.id || viewingRepair.fixerId === user.id || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                                     <div className="pt-6 border-t border-silver-100 dark:border-silver-800">
                                         <h4 className="font-bold mb-4 flex items-center gap-2">
                                             <MessageSquare className="w-4 h-4 text-blucell-600" />
                                             Repair Communication
                                         </h4>
                                         <div className="bg-silver-50 dark:bg-silver-900/50 border border-silver-200 dark:border-silver-800 rounded-xl overflow-hidden flex flex-col h-64 mb-6">
                                             <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                                 {repairChats[viewingRepair.id]?.length > 0 ? (
                                                     repairChats[viewingRepair.id].map((msg) => (
                                                         <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                                                             <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                                                                 msg.senderId === user.id 
                                                                 ? 'bg-blucell-600 text-white rounded-br-none' 
                                                                 : 'bg-white dark:bg-silver-800 border border-silver-200 dark:border-silver-700 rounded-bl-none'
                                                             }`}>
                                                                 <p>{msg.text}</p>
                                                                 <p className={`text-[10px] mt-1 text-right ${msg.senderId === user.id ? 'text-blucell-100' : 'text-silver-400'}`}>
                                                                     {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                                 </p>
                                                             </div>
                                                         </div>
                                                     ))
                                                 ) : (
                                                     <div className="h-full flex items-center justify-center text-silver-400 text-sm">
                                                         <p>No messages yet. Start the conversation!</p>
                                                     </div>
                                                 )}
                                                 <div ref={repairChatEndRef} />
                                             </div>
                                             <div className="p-2 border-t border-silver-200 dark:border-silver-800 bg-white dark:bg-silver-900 flex gap-2">
                                                 <input 
                                                     className="flex-1 bg-silver-100 dark:bg-silver-800 border-0 rounded-full px-4 text-sm focus:ring-1 focus:ring-blucell-500 outline-none"
                                                     placeholder="Type a message to the technician..."
                                                     value={repairChatInput}
                                                     onChange={(e) => setRepairChatInput(e.target.value)}
                                                     onKeyDown={(e) => e.key === 'Enter' && handleSendRepairChat()}
                                                 />
                                                 <button 
                                                     onClick={handleSendRepairChat}
                                                     className="p-2 bg-blucell-600 text-white rounded-full hover:bg-blucell-700 transition-colors"
                                                 >
                                                     <Send className="w-4 h-4" />
                                                 </button>
                                             </div>
                                         </div>
                                     </div>
                                 )}

                                 {(user.role === 'ADMIN' || user.role === 'FIXER' || user.role === 'SUPER_ADMIN') && (
                                     <div className="pt-6 border-t border-silver-100 dark:border-silver-800">
                                         <h4 className="font-bold mb-4">Technician Controls</h4>
                                         
                                         {!viewingRepair.fixerId && (
                                             <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/50 p-4 rounded-lg mb-6">
                                                 <p className="text-sm text-orange-800 dark:text-orange-200 mb-3 font-medium">This job is currently unassigned.</p>
                                                 <Button className="w-full" onClick={() => handleClaimRepair(viewingRepair)}>
                                                     Claim This Job
                                                 </Button>
                                             </div>
                                         )}

                                         {(viewingRepair.fixerId === user.id || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                                             <form onSubmit={handleSaveRepair} className="space-y-4">
                                                 <div className="grid grid-cols-2 gap-4">
                                                     <div>
                                                         <label className="block text-sm font-medium mb-1">Status</label>
                                                         <select 
                                                            className="w-full rounded-lg border border-silver-300 dark:border-silver-700 bg-white dark:bg-silver-950 px-3 py-2 text-sm"
                                                            value={repairForm.status}
                                                            onChange={(e) => setRepairForm({...repairForm, status: e.target.value as any})}
                                                         >
                                                             <option value="PENDING">Pending</option>
                                                             <option value="DIAGNOSING">Diagnosing</option>
                                                             <option value="IN_PROGRESS">In Progress</option>
                                                             <option value="COMPLETED">Completed</option>
                                                             <option value="DELIVERED">Delivered</option>
                                                         </select>
                                                     </div>
                                                     <Input 
                                                        label="Est. Cost" 
                                                        type="number" 
                                                        value={repairForm.cost} 
                                                        onChange={(e) => setRepairForm({...repairForm, cost: e.target.value})} 
                                                     />
                                                 </div>
                                                 <div>
                                                     <label className="block text-sm font-medium mb-1">Tech Notes</label>
                                                     <textarea 
                                                        className="w-full rounded-lg border border-silver-300 dark:border-silver-700 bg-white dark:bg-silver-950 px-3 py-2 text-sm h-24"
                                                        value={repairForm.notes}
                                                        onChange={(e) => setRepairForm({...repairForm, notes: e.target.value})}
                                                     />
                                                 </div>
                                                 <div className="flex justify-end gap-3">
                                                     <Button type="submit">Update Ticket</Button>
                                                 </div>
                                             </form>
                                         )}
                                     </div>
                                 )}
                             </div>
                         </Card>
                     ) : (
                         <div className="h-full flex flex-col items-center justify-center text-silver-400 border-2 border-dashed border-silver-200 dark:border-silver-800 rounded-xl bg-silver-50 dark:bg-silver-900/50">
                             <Wrench className="w-12 h-12 mb-4 opacity-50" />
                             <p>Select a repair ticket to view details</p>
                         </div>
                     )}
                 </div>
             </div>
        </div>
    );

    // ... rest of component
