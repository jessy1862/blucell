
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, Product, Order, RepairJob, ChatSession, LandingPageConfig, ContactInfo, ContactMessage, UserRole, AvailabilityStatus, ChatMessage, TeamMember } from '../types';
import { Card, Button, Input, Badge, SectionTitle, Modal, StatusIndicator } from '../components/ui';
import { 
    Users, ShoppingBag, Wrench, MessageSquare, LayoutTemplate, 
    Search, Plus, Filter, MoreVertical, Check, X, 
    Package, DollarSign, Clock, AlertCircle, Edit, Trash2, 
    ChevronRight, Send, Save, User as UserIcon, Image as ImageIcon,
    LogOut, Settings, ExternalLink, BarChart as BarChartIcon, Layers, Type, MousePointer, Upload, Eye, ShieldAlert, Database, Lock, RefreshCw, Terminal, Briefcase, Cpu, Truck, MapPin, Phone, Printer, PackageCheck, History,
    LayoutDashboard, UserPlus, FileText, ClipboardList, Smartphone, Barcode, CreditCard
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface DashboardProps {
  user: User;
  onUpdateUser: (data: Partial<User>) => void;
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
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
  onAddUser: (user: User) => void;
  onUpdateUserAdmin: (user: User) => void;
  allOrders: Order[];
  onUpdateOrder: (orderId: string, status: Order['status']) => void;
  allRepairs: RepairJob[];
  onUpdateRepair: (repair: RepairJob) => void;
  platformLogo: string;
  team: TeamMember[];
  onUpdateTeam: (team: TeamMember[]) => void;
  repairChats: Record<string, ChatMessage[]>;
  onSendRepairMessage: (repairId: string, text: string, senderId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
    user, onUpdateUser, products, onAddProduct, onUpdateProduct, onDeleteProduct,
    onUpdatePlatformSettings, formatPrice, supportSessions, onAdminReply, onCreateSession,
    landingPageConfig, onUpdateLandingPage, contactInfo, onUpdateContactInfo,
    contactMessages, onDeleteContactMessage, allUsers, onAddUser, onUpdateUserAdmin,
    allOrders, onUpdateOrder, allRepairs, onUpdateRepair, platformLogo, team, onUpdateTeam,
    repairChats, onSendRepairMessage
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Determine default tab based on role or URL params
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get('tab') || 'overview';
    const chatRepairId = queryParams.get('chatRepairId');

    const [activeTab, setActiveTab] = useState(initialTab);
    
    // Admin / Management State
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    // Repair State
    const [selectedRepair, setSelectedRepair] = useState<RepairJob | null>(null);
    const [repairChatInput, setRepairChatInput] = useState('');
    const [timelineNote, setTimelineNote] = useState('');

    // Logistics & Payment State
    const [isCourierModalOpen, setIsCourierModalOpen] = useState(false);
    const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [courierForm, setCourierForm] = useState({ courier: '', tracking: '' });

    useEffect(() => {
        if (chatRepairId) {
            const repair = allRepairs.find(r => r.id === chatRepairId);
            if (repair) {
                setSelectedRepair(repair);
                setActiveTab('repairs');
            }
        }
    }, [chatRepairId, allRepairs]);

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    const isFixer = user.role === 'FIXER';
    const isCustomer = user.role === 'CUSTOMER';

    // Filter Data based on Role
    const myOrders = isAdmin ? allOrders : allOrders.filter(o => {
        // Assuming user filtering would happen here in a real app or backend
        return true; 
    });

    const myRepairs = useMemo(() => {
        if (isAdmin) return allRepairs;
        if (isFixer) return allRepairs.filter(r => r.fixerId === user.id || r.status === 'PENDING'); // Fixers see assigned + pending
        return allRepairs.filter(r => r.customerId === user.id);
    }, [allRepairs, isAdmin, isFixer, user.id]);

    const stats = [
        { label: 'Total Orders', value: myOrders.length, icon: ShoppingBag, color: 'bg-blue-500' },
        { label: 'Active Repairs', value: myRepairs.filter(r => r.status !== 'COMPLETED' && r.status !== 'DELIVERED').length, icon: Wrench, color: 'bg-orange-500' },
        { label: 'Total Spent', value: formatPrice(myOrders.reduce((acc, o) => acc + o.total, 0)), icon: DollarSign, color: 'bg-green-500', hide: isFixer },
    ];

    if (isAdmin) {
        stats.push(
            { label: 'Total Users', value: allUsers.length, icon: Users, color: 'bg-purple-500', hide: false },
            { label: 'Open Support', value: supportSessions.filter(s => s.status === 'OPEN').length, icon: MessageSquare, color: 'bg-red-500', hide: false }
        );
    }

    // --- Repair Handlers ---

    const handleStatusChange = (repair: RepairJob, newStatus: RepairJob['status']) => {
        const updatedRepair = {
            ...repair,
            status: newStatus,
            timeline: [
                { status: newStatus, date: new Date().toISOString(), note: `Status updated to ${newStatus}` },
                ...(repair.timeline || [])
            ]
        };
        onUpdateRepair(updatedRepair);
        setSelectedRepair(updatedRepair);
    };

    const handleAddTimelineNote = () => {
        if (!selectedRepair || !timelineNote.trim()) return;
        const updatedRepair = {
            ...selectedRepair,
            timeline: [
                { status: 'NOTE', date: new Date().toISOString(), note: timelineNote },
                ...(selectedRepair.timeline || [])
            ]
        };
        onUpdateRepair(updatedRepair);
        setSelectedRepair(updatedRepair);
        setTimelineNote('');
    };

    const handleClaimRepair = (repair: RepairJob) => {
        const updatedRepair = {
            ...repair,
            fixerId: user.id,
            status: 'DIAGNOSING' as const,
            timeline: [
                { status: 'CLAIMED', date: new Date().toISOString(), note: `Technician ${user.name} assigned` },
                ...(repair.timeline || [])
            ]
        };
        onUpdateRepair(updatedRepair);
        setSelectedRepair(updatedRepair);
    };

    const handleAssignCourier = () => {
        if (!selectedRepair || !courierForm.courier) return;
        
        const updatedRepair = {
            ...selectedRepair,
            status: 'PICKED_UP' as const, // In Transit
            courier: courierForm.courier,
            trackingNumber: courierForm.tracking,
            timeline: [
                { 
                    status: 'LOGISTICS', 
                    date: new Date().toISOString(), 
                    note: `Courier ${courierForm.courier} assigned. Tracking: ${courierForm.tracking}` 
                },
                ...(selectedRepair.timeline || [])
            ]
        };
        
        onUpdateRepair(updatedRepair);
        setIsCourierModalOpen(false);
        setSelectedRepair(null); // Clear selection or keep it
        setCourierForm({ courier: '', tracking: '' });
    };

    const handlePayment = () => {
        if (!selectedRepair) return;

        // Simulate successful payment
        const updatedRepair = {
            ...selectedRepair,
            isPaid: true,
            timeline: [
                {
                    status: 'PAID',
                    date: new Date().toISOString(),
                    note: `Payment of ${formatPrice(selectedRepair.estimatedCost || 0)} received.`
                },
                ...(selectedRepair.timeline || [])
            ]
        };
        onUpdateRepair(updatedRepair);
        setIsPaymentModalOpen(false);
        setSelectedRepair(updatedRepair);
    };

    // --- Render Functions ---

    const renderSidebar = () => (
        <div className="w-full md:w-64 bg-white dark:bg-silver-900 border-r border-silver-200 dark:border-silver-800 flex-shrink-0 flex flex-col h-full min-h-[calc(100vh-4rem)]">
            <div className="p-6">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-silver-200 dark:border-silver-700">
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-silver-900 dark:text-white line-clamp-1">{user.name}</h3>
                        <Badge color={isAdmin ? 'red' : isFixer ? 'blue' : 'green'}>{user.role}</Badge>
                    </div>
                 </div>
                 <div className="space-y-1">
                    <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-blucell-50 text-blucell-700 dark:bg-blucell-900/20 dark:text-blucell-400' : 'text-silver-600 hover:bg-silver-50 dark:hover:bg-silver-800'}`}>
                        <LayoutDashboard className="w-4 h-4" /> Overview
                    </button>
                    <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-blucell-50 text-blucell-700 dark:bg-blucell-900/20 dark:text-blucell-400' : 'text-silver-600 hover:bg-silver-50 dark:hover:bg-silver-800'}`}>
                        <ShoppingBag className="w-4 h-4" /> Orders
                    </button>
                    <button onClick={() => setActiveTab('repairs')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'repairs' ? 'bg-blucell-50 text-blucell-700 dark:bg-blucell-900/20 dark:text-blucell-400' : 'text-silver-600 hover:bg-silver-50 dark:hover:bg-silver-800'}`}>
                        <Wrench className="w-4 h-4" /> Repairs
                    </button>
                    {isAdmin && (
                        <>
                            <div className="pt-4 pb-2 text-xs font-semibold text-silver-400 uppercase tracking-wider">Admin</div>
                            <button onClick={() => setActiveTab('logistics')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'logistics' ? 'bg-blucell-50 text-blucell-700 dark:bg-blucell-900/20 dark:text-blucell-400' : 'text-silver-600 hover:bg-silver-50 dark:hover:bg-silver-800'}`}>
                                <Truck className="w-4 h-4" /> Logistics
                            </button>
                            <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-blucell-50 text-blucell-700 dark:bg-blucell-900/20 dark:text-blucell-400' : 'text-silver-600 hover:bg-silver-50 dark:hover:bg-silver-800'}`}>
                                <Users className="w-4 h-4" /> Users
                            </button>
                            <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'products' ? 'bg-blucell-50 text-blucell-700 dark:bg-blucell-900/20 dark:text-blucell-400' : 'text-silver-600 hover:bg-silver-50 dark:hover:bg-silver-800'}`}>
                                <Package className="w-4 h-4" /> Inventory
                            </button>
                             <button onClick={() => setActiveTab('content')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'content' ? 'bg-blucell-50 text-blucell-700 dark:bg-blucell-900/20 dark:text-blucell-400' : 'text-silver-600 hover:bg-silver-50 dark:hover:bg-silver-800'}`}>
                                <LayoutTemplate className="w-4 h-4" /> Content
                            </button>
                            <button onClick={() => setActiveTab('support')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'support' ? 'bg-blucell-50 text-blucell-700 dark:bg-blucell-900/20 dark:text-blucell-400' : 'text-silver-600 hover:bg-silver-50 dark:hover:bg-silver-800'}`}>
                                <MessageSquare className="w-4 h-4" /> Support Chats
                            </button>
                            <button onClick={() => setActiveTab('messages')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'messages' ? 'bg-blucell-50 text-blucell-700 dark:bg-blucell-900/20 dark:text-blucell-400' : 'text-silver-600 hover:bg-silver-50 dark:hover:bg-silver-800'}`}>
                                <FileText className="w-4 h-4" /> Contact Msgs
                            </button>
                        </>
                    )}
                 </div>
            </div>
            <div className="mt-auto p-4 border-t border-silver-200 dark:border-silver-800">
                <Button variant="ghost" className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => navigate('/auth')}>
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </Button>
            </div>
        </div>
    );

    const renderOverview = () => (
        <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-2xl font-bold">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.filter(s => !s.hide).map((stat, idx) => (
                    <Card key={idx} className="p-6 flex items-center gap-4">
                        <div className={`p-4 rounded-full text-white ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-silver-500">{stat.label}</p>
                            <h4 className="text-2xl font-bold">{stat.value}</h4>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="font-bold text-lg mb-4">Recent Repairs</h3>
                    {myRepairs.length > 0 ? (
                        <div className="space-y-4">
                            {myRepairs.slice(0, 3).map(repair => (
                                <div key={repair.id} className="flex items-center justify-between p-3 border border-silver-100 dark:border-silver-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-silver-100 dark:bg-silver-800 rounded-lg">
                                            {repair.deviceType.toLowerCase().includes('phone') ? <Smartphone className="w-5 h-5" /> : 
                                             repair.deviceType.toLowerCase().includes('laptop') ? <Briefcase className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{repair.deviceType}</p>
                                            <p className="text-xs text-silver-500">{repair.issueDescription}</p>
                                        </div>
                                    </div>
                                    <Badge color={repair.status === 'COMPLETED' ? 'green' : 'blue'}>{repair.status}</Badge>
                                </div>
                            ))}
                            <Button variant="ghost" size="sm" onClick={() => setActiveTab('repairs')}>View All</Button>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-silver-400">
                            <Wrench className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>No active repairs</p>
                            <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/repair')}>Book Repair</Button>
                        </div>
                    )}
                </Card>

                 <Card className="p-6">
                    <h3 className="font-bold text-lg mb-4">Recent Orders</h3>
                    {myOrders.length > 0 ? (
                         <div className="space-y-4">
                            {myOrders.slice(0, 3).map(order => (
                                <div key={order.id} className="flex items-center justify-between p-3 border border-silver-100 dark:border-silver-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-silver-100 dark:bg-silver-800 rounded-lg">
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">Order #{order.id}</p>
                                            <p className="text-xs text-silver-500">{order.items.length} items • {formatPrice(order.total)}</p>
                                        </div>
                                    </div>
                                    <Badge color={order.status === 'DELIVERED' ? 'green' : 'yellow'}>{order.status}</Badge>
                                </div>
                            ))}
                            <Button variant="ghost" size="sm" onClick={() => setActiveTab('orders')}>View All</Button>
                        </div>
                    ) : (
                         <div className="text-center py-8 text-silver-400">
                            <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>No orders yet</p>
                            <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/shop')}>Shop Now</Button>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );

    const renderRepairs = () => (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Repairs</h2>
                {!isFixer && <Button onClick={() => navigate('/repair')}><Plus className="w-4 h-4 mr-2" /> Book New Repair</Button>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* List */}
                <Card className="lg:col-span-1 overflow-y-auto max-h-[calc(100vh-12rem)]">
                     {myRepairs.length === 0 ? (
                        <div className="p-8 text-center text-silver-500">No repairs found.</div>
                    ) : (
                        <div className="divide-y divide-silver-100 dark:divide-silver-800">
                            {myRepairs.map(repair => (
                                <div 
                                    key={repair.id} 
                                    className={`p-4 cursor-pointer hover:bg-silver-50 dark:hover:bg-silver-800 transition-colors ${selectedRepair?.id === repair.id ? 'bg-blucell-50 dark:bg-blucell-900/10' : ''}`}
                                    onClick={() => setSelectedRepair(repair)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-sm">{repair.deviceType}</h4>
                                        <Badge color={repair.status === 'COMPLETED' ? 'green' : 'blue'}>{repair.status}</Badge>
                                    </div>
                                    <p className="text-xs text-silver-500 line-clamp-2 mb-2">{repair.issueDescription}</p>
                                    <div className="flex justify-between items-center text-xs text-silver-400">
                                        <span>ID: {repair.id}</span>
                                        <span>{repair.dateBooked}</span>
                                    </div>
                                    {isFixer && !repair.fixerId && (
                                        <div className="mt-2 text-xs text-orange-500 font-bold">Unclaimed</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Details & Chat */}
                <Card className="lg:col-span-2 p-0 flex flex-col overflow-hidden max-h-[calc(100vh-12rem)]">
                    {selectedRepair ? (
                        <div className="flex flex-col h-full">
                            <div className="p-6 border-b border-silver-100 dark:border-silver-800 bg-silver-50 dark:bg-silver-900">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-bold">{selectedRepair.deviceType} Repair</h3>
                                            {selectedRepair.isPaid && <Badge color="green">Paid</Badge>}
                                            {selectedRepair.estimatedCost && selectedRepair.estimatedCost > 0 && !selectedRepair.isPaid && <Badge color="yellow">Unpaid</Badge>}
                                        </div>
                                        <p className="text-sm text-silver-500">Ticket ID: {selectedRepair.id}</p>
                                    </div>
                                    {(isAdmin || isFixer) && (
                                        <select 
                                            value={selectedRepair.status}
                                            onChange={(e) => handleStatusChange(selectedRepair, e.target.value as any)}
                                            className="bg-white dark:bg-silver-800 border border-silver-300 dark:border-silver-700 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blucell-500 outline-none"
                                        >
                                            {['PENDING', 'PICKED_UP', 'RECEIVED', 'DIAGNOSING', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED'].map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    )}
                                    {isCustomer && selectedRepair.estimatedCost && selectedRepair.estimatedCost > 0 && !selectedRepair.isPaid && (
                                        <Button size="sm" onClick={() => setIsPaymentModalOpen(true)}>Pay Invoice</Button>
                                    )}
                                </div>
                                
                                <div className="mt-4 flex flex-wrap gap-4">
                                    {selectedRepair.aiDiagnosis && (
                                        <div className="p-3 bg-blucell-50 dark:bg-blucell-900/10 border border-blucell-100 dark:border-blucell-800 rounded-lg flex-1 min-w-[200px]">
                                            <div className="flex items-center gap-2 mb-1 text-blucell-700 dark:text-blucell-300 font-bold text-xs uppercase tracking-wide">
                                                <Cpu className="w-3 h-3" /> AI Diagnosis
                                            </div>
                                            <p className="text-sm text-silver-700 dark:text-silver-300">{selectedRepair.aiDiagnosis}</p>
                                        </div>
                                    )}
                                    {isFixer && !selectedRepair.fixerId && (
                                        <div className="flex items-center justify-center p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                            <Button size="sm" className="w-full" onClick={() => handleClaimRepair(selectedRepair)}>
                                                Claim Ticket
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-silver-500">Method:</span> <span className="font-medium">{selectedRepair.deliveryMethod}</span>
                                    </div>
                                    {selectedRepair.estimatedCost && (
                                        <div>
                                            <span className="text-silver-500">Est. Cost:</span> <span className="font-medium">{formatPrice(selectedRepair.estimatedCost)}</span>
                                        </div>
                                    )}
                                    {selectedRepair.courier && (
                                        <div className="col-span-2">
                                            <span className="text-silver-500">Courier:</span> <span className="font-medium">{selectedRepair.courier} (Tracking: {selectedRepair.trackingNumber})</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Main Content Area - Split between Timeline and Chat */}
                            <div className="flex-1 overflow-y-auto bg-silver-50/50 dark:bg-silver-950/50 grid grid-cols-1 md:grid-cols-2">
                                {/* Left: Timeline */}
                                <div className="p-6 border-r border-silver-100 dark:border-silver-800">
                                    <h4 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-silver-500">
                                        <History className="w-4 h-4" /> Repair Timeline
                                    </h4>
                                    
                                    {(isAdmin || isFixer) && (
                                        <div className="mb-6 flex gap-2">
                                            <Input 
                                                placeholder="Add a progress note..." 
                                                value={timelineNote} 
                                                onChange={(e) => setTimelineNote(e.target.value)} 
                                                className="text-sm"
                                            />
                                            <Button size="sm" onClick={handleAddTimelineNote} disabled={!timelineNote.trim()}>
                                                Add
                                            </Button>
                                        </div>
                                    )}

                                    <div className="relative pl-4 border-l-2 border-silver-200 dark:border-silver-800 space-y-6">
                                        {(selectedRepair.timeline && selectedRepair.timeline.length > 0) ? selectedRepair.timeline.map((event, i) => (
                                            <div key={i} className="relative animate-fade-in">
                                                <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white dark:border-silver-900 ${
                                                    event.status === 'NOTE' ? 'bg-silver-400' : 
                                                    event.status === 'PAID' ? 'bg-green-500' :
                                                    'bg-blucell-500'
                                                }`}></div>
                                                <div className="flex justify-between items-start">
                                                    <p className={`font-medium text-sm ${event.status === 'NOTE' ? 'text-silver-600 dark:text-silver-400' : 'text-silver-900 dark:text-white'}`}>
                                                        {event.status === 'NOTE' ? 'Note Added' : event.status}
                                                    </p>
                                                    <span className="text-[10px] text-silver-400">{new Date(event.date).toLocaleDateString()}</span>
                                                </div>
                                                {event.note && (
                                                    <p className="text-xs text-silver-500 mt-1 bg-white dark:bg-silver-800 p-2 rounded border border-silver-100 dark:border-silver-700">
                                                        {event.note}
                                                    </p>
                                                )}
                                            </div>
                                        )) : (
                                            <div className="relative">
                                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blucell-500 border-2 border-white dark:border-silver-900"></div>
                                                <p className="font-medium text-sm">Ticket Created</p>
                                                <p className="text-xs text-silver-500">{new Date(selectedRepair.dateBooked).toLocaleDateString()}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Chat */}
                                <div className="p-4 flex flex-col h-full max-h-[500px] md:max-h-none">
                                    <h4 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-silver-500">
                                        <MessageSquare className="w-4 h-4" /> Technician Chat
                                    </h4>
                                    <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                                        {(repairChats[selectedRepair.id] || []).map((msg, idx) => {
                                            const isMe = msg.senderId === user.id;
                                            return (
                                                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[90%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                                                        isMe ? 'bg-blucell-600 text-white rounded-br-none' 
                                                        : 'bg-white dark:bg-silver-800 dark:text-silver-100 rounded-bl-none border border-silver-200 dark:border-silver-700'
                                                    }`}>
                                                        <p>{msg.text}</p>
                                                        <span className={`text-[10px] block mt-1 text-right ${isMe ? 'text-blucell-100' : 'text-silver-400'}`}>
                                                            {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {(repairChats[selectedRepair.id] || []).length === 0 && (
                                            <div className="text-center text-silver-400 text-sm mt-8">
                                                <p>Start a conversation about this repair.</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            className="flex-1 bg-white dark:bg-silver-800 border border-silver-200 dark:border-silver-700 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blucell-500 outline-none"
                                            placeholder="Type a message..."
                                            value={repairChatInput}
                                            onChange={(e) => setRepairChatInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (onSendRepairMessage(selectedRepair.id, repairChatInput, user.id), setRepairChatInput(''))}
                                        />
                                        <Button 
                                            size="sm" 
                                            className="rounded-full w-9 h-9 p-0 flex items-center justify-center"
                                            onClick={() => {
                                                if (repairChatInput.trim()) {
                                                    onSendRepairMessage(selectedRepair.id, repairChatInput, user.id);
                                                    setRepairChatInput('');
                                                }
                                            }}
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-silver-400">
                            <ClipboardList className="w-16 h-16 mb-4 opacity-20" />
                            <p>Select a repair ticket to view timeline & details</p>
                        </div>
                    )}
                </Card>
            </div>

            {/* Payment Modal */}
            {isPaymentModalOpen && selectedRepair && (
                <Modal title="Pay Repair Invoice" onClose={() => setIsPaymentModalOpen(false)}>
                    <div className="space-y-6">
                        <div className="text-center p-6 bg-silver-50 dark:bg-silver-800 rounded-lg">
                            <p className="text-sm text-silver-500 mb-1">Total Due for Repair #{selectedRepair.id}</p>
                            <h2 className="text-3xl font-bold text-blucell-600 dark:text-blucell-400">{formatPrice(selectedRepair.estimatedCost || 0)}</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <h4 className="font-bold text-sm">Payment Method</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <button className="p-4 border border-blucell-600 bg-blucell-50 dark:bg-blucell-900/20 text-blucell-700 dark:text-blucell-300 rounded-lg flex flex-col items-center justify-center font-bold">
                                    <CreditCard className="w-6 h-6 mb-2" />
                                    Credit Card
                                </button>
                                <button className="p-4 border border-silver-200 dark:border-silver-700 hover:bg-silver-50 dark:hover:bg-silver-800 text-silver-500 rounded-lg flex flex-col items-center justify-center font-bold opacity-50 cursor-not-allowed">
                                    <Smartphone className="w-6 h-6 mb-2" />
                                    Apple Pay
                                </button>
                            </div>
                        </div>

                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handlePayment(); }}>
                             <Input label="Card Number" placeholder="0000 0000 0000 0000" />
                             <div className="grid grid-cols-2 gap-4">
                                <Input label="Expiry" placeholder="MM/YY" />
                                <Input label="CVC" placeholder="123" />
                             </div>
                             <Button type="submit" className="w-full">Pay Now</Button>
                        </form>
                    </div>
                </Modal>
            )}
        </div>
    );

    const renderLogistics = () => {
        // Filter repairs that need logistics (Pickup type + not yet delivered back)
        const dispatchRepairs = allRepairs.filter(r => r.deliveryMethod === 'PICKUP');

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Logistics & Dispatch</h2>
                </div>
                <Card className="overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-silver-50 dark:bg-silver-900 border-b border-silver-200 dark:border-silver-800">
                            <tr>
                                <th className="p-4 font-medium">Ticket ID</th>
                                <th className="p-4 font-medium">Customer Address</th>
                                <th className="p-4 font-medium">Contact</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-silver-100 dark:divide-silver-800">
                            {dispatchRepairs.map(repair => (
                                <tr key={repair.id}>
                                    <td className="p-4">
                                        <div className="font-bold">{repair.id}</div>
                                        <div className="text-xs text-silver-500">{repair.deviceType}</div>
                                    </td>
                                    <td className="p-4 max-w-xs truncate" title={repair.pickupAddress}>
                                        {repair.pickupAddress || 'N/A'}
                                    </td>
                                    <td className="p-4">{repair.contactPhone || 'N/A'}</td>
                                    <td className="p-4"><Badge color={repair.status === 'PENDING' ? 'yellow' : repair.status === 'PICKED_UP' ? 'blue' : 'green'}>{repair.status}</Badge></td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => { setSelectedRepair(repair); setIsCourierModalOpen(true); }}>
                                                <Truck className="w-4 h-4 mr-2" /> Assign Courier
                                            </Button>
                                            {repair.courier && (
                                                <Button size="sm" variant="secondary" onClick={() => { setSelectedRepair(repair); setIsLabelModalOpen(true); }}>
                                                    <Printer className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {dispatchRepairs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-silver-500">No dispatch requests found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </Card>
            </div>
        );
    };

    return (
        <div className="flex min-h-screen bg-silver-50 dark:bg-silver-950">
            {/* Mobile Sidebar Toggle could go here */}
            <div className="hidden md:block">
                {renderSidebar()}
            </div>
            
            <div className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'repairs' && renderRepairs()}
                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Orders</h2>
                        <div className="grid grid-cols-1 gap-4">
                            {myOrders.map(order => (
                                <Card key={order.id} className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg">Order #{order.id}</h3>
                                            <p className="text-sm text-silver-500">{order.date}</p>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2 md:mt-0">
                                            <span className="font-bold text-xl">{formatPrice(order.total)}</span>
                                            {isAdmin ? (
                                                <select 
                                                    value={order.status} 
                                                    onChange={(e) => onUpdateOrder(order.id, e.target.value as any)}
                                                    className="bg-silver-100 dark:bg-silver-800 border-none rounded px-3 py-1 text-sm font-medium"
                                                >
                                                    <option value="PROCESSING">PROCESSING</option>
                                                    <option value="SHIPPED">SHIPPED</option>
                                                    <option value="DELIVERED">DELIVERED</option>
                                                </select>
                                            ) : (
                                                <Badge color={order.status === 'DELIVERED' ? 'green' : 'yellow'}>{order.status}</Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {order.items.map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 py-2 border-b border-silver-50 dark:border-silver-800 last:border-0">
                                                <img src={item.image} alt="" className="w-10 h-10 rounded object-cover bg-silver-100" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{item.productName}</p>
                                                    <p className="text-xs text-silver-500">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            ))}
                            {myOrders.length === 0 && <p className="text-center text-silver-500 py-8">No orders found.</p>}
                        </div>
                    </div>
                )}
                {/* Admin Tabs */}
                {isAdmin && activeTab === 'users' && (
                    <div className="space-y-6">
                         <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">User Management</h2>
                            {/* Simple Add User Modal Trigger could go here */}
                        </div>
                        <Card className="overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-silver-50 dark:bg-silver-900 border-b border-silver-200 dark:border-silver-800">
                                    <tr>
                                        <th className="p-4 font-medium">User</th>
                                        <th className="p-4 font-medium">Role</th>
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-silver-100 dark:divide-silver-800">
                                    {allUsers.map(u => (
                                        <tr key={u.id}>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={u.avatar} className="w-8 h-8 rounded-full" />
                                                    <div>
                                                        <div className="font-bold">{u.name}</div>
                                                        <div className="text-xs text-silver-500">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4"><Badge color="blue">{u.role}</Badge></td>
                                            <td className="p-4"><StatusIndicator status={u.availabilityStatus || 'OFFLINE'} /></td>
                                            <td className="p-4">
                                                <Button size="sm" variant="outline" onClick={() => { setSelectedUser(u); setIsUserModalOpen(true); }}>Edit</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card>
                    </div>
                )}
                {/* Logistics Tab */}
                {isAdmin && activeTab === 'logistics' && renderLogistics()}

                {/* Placeholder for other tabs to prevent crash if clicked */}
                {activeTab === 'products' && isAdmin && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Inventory</h2>
                             <Button onClick={() => { setSelectedProduct(null); setIsProductModalOpen(true); }}><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {products.map(p => (
                                <Card key={p.id} className="p-4 flex gap-4">
                                    <img src={p.image} className="w-20 h-20 object-cover rounded bg-silver-100" />
                                    <div className="flex-1">
                                        <h4 className="font-bold line-clamp-1">{p.name}</h4>
                                        <p className="text-sm text-silver-500">{formatPrice(p.price)}</p>
                                        <div className="flex gap-2 mt-2">
                                            <Button size="sm" variant="outline" onClick={() => { setSelectedProduct(p); setIsProductModalOpen(true); }}>Edit</Button>
                                            <Button size="sm" variant="danger" onClick={() => onDeleteProduct(p.id)}><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
                 {activeTab === 'support' && isAdmin && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Support Messages</h2>
                        <div className="grid grid-cols-1 gap-4">
                            {supportSessions.map(session => (
                                <Card key={session.id} className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <img src={session.userAvatar} className="w-8 h-8 rounded-full" />
                                            <span className="font-bold">{session.userName}</span>
                                        </div>
                                        <span className="text-xs text-silver-500">{session.lastMessageTime.toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm bg-silver-50 dark:bg-silver-900 p-2 rounded mb-2 line-clamp-2">
                                        {session.lastMessage}
                                    </p>
                                    <div className="flex gap-2">
                                        <input 
                                            className="flex-1 border rounded px-2 py-1 text-sm bg-transparent"
                                            placeholder="Reply..."
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    onAdminReply(session.id, (e.target as HTMLInputElement).value);
                                                    (e.target as HTMLInputElement).value = '';
                                                }
                                            }}
                                        />
                                        <Button size="sm">Reply</Button>
                                    </div>
                                </Card>
                            ))}
                            {supportSessions.length === 0 && <p className="text-silver-500">No active support sessions.</p>}
                        </div>
                    </div>
                )}
                {activeTab === 'content' && isAdmin && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Content Management</h2>
                        <Card className="p-6">
                            <h3 className="font-bold mb-4">Platform Settings</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <Input label="Logo URL" value={platformLogo} onChange={(e) => onUpdatePlatformSettings({ logo: e.target.value })} />
                            </div>
                        </Card>
                         <Card className="p-6">
                            <h3 className="font-bold mb-4">Hero Section</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Title Prefix" value={landingPageConfig.hero.titlePrefix} onChange={(e) => onUpdateLandingPage({ ...landingPageConfig, hero: { ...landingPageConfig.hero, titlePrefix: e.target.value } })} />
                                <Input label="Highlight" value={landingPageConfig.hero.titleHighlight} onChange={(e) => onUpdateLandingPage({ ...landingPageConfig, hero: { ...landingPageConfig.hero, titleHighlight: e.target.value } })} />
                                <Input label="Subtitle" className="md:col-span-2" value={landingPageConfig.hero.subtitle} onChange={(e) => onUpdateLandingPage({ ...landingPageConfig, hero: { ...landingPageConfig.hero, subtitle: e.target.value } })} />
                            </div>
                        </Card>
                    </div>
                )}
                {activeTab === 'messages' && isAdmin && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Contact Messages</h2>
                        <div className="grid grid-cols-1 gap-4">
                            {contactMessages.map(msg => (
                                <Card key={msg.id} className="p-4">
                                    <div className="flex justify-between">
                                        <h4 className="font-bold">{msg.subject}</h4>
                                        <Button size="sm" variant="ghost" onClick={() => onDeleteContactMessage(msg.id)}><X className="w-4 h-4" /></Button>
                                    </div>
                                    <p className="text-xs text-silver-500 mb-2">From: {msg.name} ({msg.email})</p>
                                    <p className="text-sm">{msg.message}</p>
                                </Card>
                            ))}
                             {contactMessages.length === 0 && <p className="text-silver-500">No messages.</p>}
                        </div>
                    </div>
                )}
            </div>

            {/* Courier Assignment Modal */}
            {isCourierModalOpen && (
                <Modal title="Assign Courier" onClose={() => setIsCourierModalOpen(false)}>
                    <div className="space-y-4">
                        <p className="text-sm text-silver-500">Assign a courier service for Pickup of <strong>{selectedRepair?.id}</strong></p>
                        <Input 
                            label="Courier Service" 
                            placeholder="e.g. FedEx, UPS, Local Bike" 
                            value={courierForm.courier}
                            onChange={(e) => setCourierForm({ ...courierForm, courier: e.target.value })}
                        />
                        <Input 
                            label="Tracking Number" 
                            placeholder="e.g. 1Z9999999999" 
                            value={courierForm.tracking}
                            onChange={(e) => setCourierForm({ ...courierForm, tracking: e.target.value })}
                        />
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="ghost" onClick={() => setIsCourierModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleAssignCourier} disabled={!courierForm.courier}>Confirm Assignment</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Simulated Label Modal */}
            {isLabelModalOpen && selectedRepair && (
                <Modal title="Shipping Label" onClose={() => setIsLabelModalOpen(false)}>
                    <div className="space-y-6 text-center">
                        <div className="border-4 border-black p-6 bg-white text-black mx-auto max-w-sm rounded-lg">
                            <div className="flex justify-between items-start mb-8">
                                <h2 className="font-bold text-2xl tracking-tighter">BLUCELL</h2>
                                <div className="text-right">
                                    <p className="text-xs font-bold">PRIORITY OVERNIGHT</p>
                                    <p className="text-xs">TRK: {selectedRepair.trackingNumber || 'PENDING'}</p>
                                </div>
                            </div>
                            <div className="text-left mb-8">
                                <p className="text-xs text-gray-500 uppercase">From:</p>
                                <p className="font-bold">{selectedRepair.pickupAddress || 'Customer Address'}</p>
                                <p className="text-sm">{selectedRepair.contactPhone}</p>
                            </div>
                            <div className="text-left mb-8 border-t-2 border-black pt-4">
                                <p className="text-xs text-gray-500 uppercase">To:</p>
                                <p className="font-bold text-xl">BLUCELL REPAIR CENTER</p>
                                <p>123 Tech Blvd, San Francisco, CA 94107</p>
                            </div>
                            <div className="flex justify-center py-4">
                                <Barcode className="w-48 h-12" />
                            </div>
                            <p className="text-xs font-mono">{selectedRepair.id}</p>
                        </div>
                        <Button onClick={() => { alert('Printing...'); setIsLabelModalOpen(false); }}>
                            <Printer className="w-4 h-4 mr-2" /> Print Label
                        </Button>
                    </div>
                </Modal>
            )}

            {/* Payment Modal */}
            {isPaymentModalOpen && selectedRepair && (
                <Modal title="Pay Repair Invoice" onClose={() => setIsPaymentModalOpen(false)}>
                    <div className="space-y-6">
                        <div className="text-center p-6 bg-silver-50 dark:bg-silver-800 rounded-lg">
                            <p className="text-sm text-silver-500 mb-1">Total Due for Repair #{selectedRepair.id}</p>
                            <h2 className="text-3xl font-bold text-blucell-600 dark:text-blucell-400">{formatPrice(selectedRepair.estimatedCost || 0)}</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <h4 className="font-bold text-sm">Payment Method</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <button className="p-4 border border-blucell-600 bg-blucell-50 dark:bg-blucell-900/20 text-blucell-700 dark:text-blucell-300 rounded-lg flex flex-col items-center justify-center font-bold">
                                    <CreditCard className="w-6 h-6 mb-2" />
                                    Credit Card
                                </button>
                                <button className="p-4 border border-silver-200 dark:border-silver-700 hover:bg-silver-50 dark:hover:bg-silver-800 text-silver-500 rounded-lg flex flex-col items-center justify-center font-bold opacity-50 cursor-not-allowed">
                                    <Smartphone className="w-6 h-6 mb-2" />
                                    Apple Pay
                                </button>
                            </div>
                        </div>

                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handlePayment(); }}>
                             <Input label="Card Number" placeholder="0000 0000 0000 0000" />
                             <div className="grid grid-cols-2 gap-4">
                                <Input label="Expiry" placeholder="MM/YY" />
                                <Input label="CVC" placeholder="123" />
                             </div>
                             <Button type="submit" className="w-full">Pay Now</Button>
                        </form>
                    </div>
                </Modal>
            )}

            {/* User Modal */}
            {isUserModalOpen && (
                <Modal title={selectedUser ? "Edit User" : "Add User"} onClose={() => setIsUserModalOpen(false)}>
                    <form className="space-y-4" onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target as HTMLFormElement);
                        const userData: any = {
                            id: selectedUser?.id || `u-${Date.now()}`,
                            name: formData.get('name') as string,
                            email: formData.get('email') as string,
                            role: formData.get('role') as UserRole,
                            avatar: selectedUser?.avatar || 'https://ui-avatars.com/api/?background=random',
                            availabilityStatus: formData.get('availabilityStatus') as AvailabilityStatus,
                            bio: formData.get('bio') as string,
                            phone: formData.get('phone') as string,
                            address: formData.get('address') as string,
                        };
                        
                        if (selectedUser) {
                            onUpdateUserAdmin(userData);
                        } else {
                            onAddUser(userData);
                        }
                        setIsUserModalOpen(false);
                    }}>
                        <Input name="name" label="Name" defaultValue={selectedUser?.name} required />
                        <Input name="email" label="Email" defaultValue={selectedUser?.email} required />
                        <div>
                            <label className="block text-sm font-medium mb-1">Role</label>
                            <select name="role" defaultValue={selectedUser?.role || 'CUSTOMER'} className="w-full border rounded p-2 bg-transparent">
                                <option value="CUSTOMER">Customer</option>
                                <option value="FIXER">Fixer</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                         {/* Fixer Specifics */}
                        <div>
                             <label className="block text-sm font-medium mb-1">Availability</label>
                             <select name="availabilityStatus" defaultValue={selectedUser?.availabilityStatus || 'OFFLINE'} className="w-full border rounded p-2 bg-transparent">
                                <option value="ONLINE">Online</option>
                                <option value="OFFLINE">Offline</option>
                                <option value="BUSY">Busy</option>
                            </select>
                        </div>
                        <Input name="phone" label="Phone" defaultValue={selectedUser?.phone} />
                        <Input name="address" label="Address" defaultValue={selectedUser?.address} />
                        <div>
                             <label className="block text-sm font-medium mb-1">Bio</label>
                             <textarea name="bio" defaultValue={selectedUser?.bio} className="w-full border rounded p-2 bg-transparent h-20"></textarea>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Product Modal */}
            {isProductModalOpen && (
                 <Modal title={selectedProduct ? "Edit Product" : "Add Product"} onClose={() => setIsProductModalOpen(false)}>
                    <form className="space-y-4" onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target as HTMLFormElement);
                        const productData: any = {
                            id: selectedProduct?.id || `p-${Date.now()}`,
                            name: formData.get('name') as string,
                            price: parseFloat(formData.get('price') as string),
                            category: formData.get('category') as any,
                            image: formData.get('image') as string,
                            description: formData.get('description') as string,
                            status: formData.get('status') as any,
                            isBestSeller: formData.get('isBestSeller') === 'on',
                            rating: selectedProduct?.rating || 0,
                            reviews: selectedProduct?.reviews || 0,
                            specs: selectedProduct?.specs || {}
                        };
                         if (selectedProduct) {
                            onUpdateProduct(productData);
                        } else {
                            onAddProduct(productData);
                        }
                        setIsProductModalOpen(false);
                    }}>
                        <Input name="name" label="Product Name" defaultValue={selectedProduct?.name} required />
                        <div className="grid grid-cols-2 gap-4">
                            <Input name="price" label="Price" type="number" step="0.01" defaultValue={selectedProduct?.price} required />
                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <select name="category" defaultValue={selectedProduct?.category || 'Phone'} className="w-full border rounded p-2 bg-transparent">
                                    {['Phone', 'Laptop', 'Audio', 'Camera', 'Gaming', 'Drone', 'Others'].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <Input name="image" label="Image URL" defaultValue={selectedProduct?.image} />
                         <div>
                             <label className="block text-sm font-medium mb-1">Description</label>
                             <textarea name="description" defaultValue={selectedProduct?.description} className="w-full border rounded p-2 bg-transparent h-20"></textarea>
                        </div>
                         <div className="flex items-center gap-4">
                             <div>
                                <label className="block text-sm font-medium mb-1">Status</label>
                                <select name="status" defaultValue={selectedProduct?.status || 'IN_STOCK'} className="w-full border rounded p-2 bg-transparent">
                                    <option value="IN_STOCK">In Stock</option>
                                    <option value="OUT_OF_STOCK">Out of Stock</option>
                                </select>
                            </div>
                            <label className="flex items-center gap-2 mt-6 cursor-pointer">
                                <input type="checkbox" name="isBestSeller" defaultChecked={selectedProduct?.isBestSeller} />
                                <span className="text-sm font-medium">Best Seller</span>
                            </label>
                         </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsProductModalOpen(false)}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </div>
                    </form>
                 </Modal>
            )}
        </div>
    );
};
