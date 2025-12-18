import React, { useState, useMemo, useEffect } from 'react';
import { User, Product, Order, RepairJob, ChatSession, LandingPageConfig, ContactInfo, ContactMessage, UserRole, AvailabilityStatus, ChatMessage, TeamMember } from '../types';
import { Card, Button, Input, Badge, Modal, StatusIndicator, SectionTitle } from '../components/ui';
import { 
    Users, ShoppingBag, Wrench, MessageSquare, LayoutTemplate, 
    Plus, Package, DollarSign, Edit, Trash2, 
    Send, User as UserIcon, Image as ImageIcon,
    LogOut, Upload, Bell, Truck, Briefcase, Cpu, History,
    LayoutDashboard, FileText, ClipboardList, Smartphone, CreditCard, Menu, Check, X, MapPin, Globe, Mail, Phone, Save, Download, ExternalLink, Wallet, ArrowUpRight, Eye, Video, Star
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { storage, ref, uploadBytes, getDownloadURL } from '../services/firebase';

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
    user, products, onAddProduct, onUpdateProduct, onDeleteProduct,
    formatPrice, supportSessions, onAdminReply, allUsers, onAddUser, onUpdateUserAdmin,
    allOrders, onUpdateOrder, allRepairs, onUpdateRepair, repairChats, onSendRepairMessage,
    landingPageConfig, onUpdateLandingPage, contactMessages, onDeleteContactMessage,
    contactInfo, onUpdateContactInfo, team, onUpdateTeam
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get('tab') || 'overview';
    const chatRepairId = queryParams.get('chatRepairId');

    const [activeTab, setActiveTab] = useState(initialTab);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Admin / Management State
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [productImageFile, setProductImageFile] = useState<File | null>(null);
    const [productImagePreview, setProductImagePreview] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);

    // Support Chat State
    const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
    const [adminChatInput, setAdminChatInput] = useState('');

    // Repair State
    const [selectedRepair, setSelectedRepair] = useState<RepairJob | null>(null);
    const [repairChatInput, setRepairChatInput] = useState('');
    const [timelineNote, setTimelineNote] = useState('');
    const [repairRating, setRepairRating] = useState(0);
    const [repairReview, setRepairReview] = useState('');
    
    // Repair Price Editing State
    const [isEditingCost, setIsEditingCost] = useState(false);
    const [costInput, setCostInput] = useState('');

    // Logistics & Payment State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [selectedLogisticOrder, setSelectedLogisticOrder] = useState<Order | null>(null);
    const [selectedLogisticRepair, setSelectedLogisticRepair] = useState<RepairJob | null>(null);
    
    // Content Management State
    const [activeContentTab, setActiveContentTab] = useState<'landing' | 'contact' | 'about'>('landing');
    const [landingForm, setLandingForm] = useState<LandingPageConfig>(landingPageConfig);
    const [contactForm, setContactForm] = useState<ContactInfo>(contactInfo);
    const [teamForm, setTeamForm] = useState<TeamMember[]>(team);
    const [cmsUploading, setCmsUploading] = useState(false);

    useEffect(() => {
        if (chatRepairId) {
            const repair = allRepairs.find(r => r.id === chatRepairId);
            if (repair) {
                setSelectedRepair(repair);
                setActiveTab('repairs');
            }
        }
    }, [chatRepairId, allRepairs]);

    // Reset editing state when selected repair changes
    useEffect(() => {
        setIsEditingCost(false);
        setCostInput('');
        setRepairRating(0);
        setRepairReview('');
    }, [selectedRepair?.id]);

    // Role Logic
    const isSuperAdmin = user.role === 'SUPER_ADMIN';
    const isAdmin = user.role === 'ADMIN' || isSuperAdmin || user.role === 'ADMIN_JR';
    const canAccessCMS = user.role === 'ADMIN' || isSuperAdmin;
    const isFixer = user.role === 'FIXER';
    const isCustomer = user.role === 'CUSTOMER';

    const myOrders = isAdmin ? allOrders : allOrders.filter(o => true); // Placeholder logic

    const myRepairs = useMemo(() => {
        if (isAdmin) return allRepairs;
        if (isFixer) return allRepairs.filter(r => r.fixerId === user.id || r.status === 'PENDING');
        return allRepairs.filter(r => r.customerId === user.id);
    }, [allRepairs, isAdmin, isFixer, user.id]);

    // Added explicit type to stats array to fix inference errors when pushing mixed value/hide types
    const stats: { label: string; value: string | number; icon: any; color: string; hide?: boolean }[] = [
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

    // --- CMS Handlers ---

    const handleSaveLanding = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateLandingPage(landingForm);
        alert('Landing page content updated successfully!');
    };

    const handleSaveContact = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateContactInfo(contactForm);
        alert('Contact information updated successfully!');
    };

    const handleSaveTeam = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateTeam(teamForm);
        alert('Team members updated successfully!');
    };

    const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCmsUploading(true);
            try {
                const file = e.target.files[0];
                const storageRef = ref(storage, `cms/hero/${Date.now()}_${file.name}`);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                setLandingForm(prev => ({
                    ...prev,
                    hero: { ...prev.hero, images: [...(prev.hero.images || []), url] }
                }));
            } catch (err) {
                console.error("Hero image upload failed", err);
                alert("Failed to upload image");
            } finally {
                setCmsUploading(false);
            }
        }
    };

    const handleRemoveHeroImage = (index: number) => {
        setLandingForm(prev => {
            const newImages = [...(prev.hero.images || [])];
            newImages.splice(index, 1);
            return { ...prev, hero: { ...prev.hero, images: newImages } };
        });
    };

    const handleTeamImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, memberId: string) => {
        if (e.target.files && e.target.files[0]) {
            setCmsUploading(true);
            try {
                const file = e.target.files[0];
                const storageRef = ref(storage, `cms/team/${memberId}_${Date.now()}`);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                setTeamForm(prev => prev.map(m => m.id === memberId ? { ...m, image: url } : m));
            } catch (err) {
                console.error("Team image upload failed", err);
            } finally {
                setCmsUploading(false);
            }
        }
    };

    const handleAddTeamMember = () => {
        const newMember: TeamMember = {
            id: `t-${Date.now()}`,
            name: 'New Member',
            role: 'Role',
            image: 'https://ui-avatars.com/api/?name=New+Member&background=random'
        };
        setTeamForm([...teamForm, newMember]);
    };

    const handleRemoveTeamMember = (id: string) => {
        setTeamForm(prev => prev.filter(m => m.id !== id));
    };

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

    const handleSaveCost = () => {
        if (!selectedRepair) return;
        const newCost = parseFloat(costInput);
        if (isNaN(newCost) || newCost < 0) {
            alert('Please enter a valid price.');
            return;
        }

        const updatedRepair = {
            ...selectedRepair,
            estimatedCost: newCost,
            timeline: [
                { 
                    status: 'QUOTE_UPDATED', 
                    date: new Date().toISOString(), 
                    note: `Estimated cost updated to ${formatPrice(newCost)}` 
                },
                ...(selectedRepair.timeline || [])
            ]
        };
        onUpdateRepair(updatedRepair);
        setSelectedRepair(updatedRepair);
        setIsEditingCost(false);
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

    const handlePayment = () => {
        if (!selectedRepair || !selectedRepair.estimatedCost) return;
        
        const total = selectedRepair.estimatedCost;
        // 50/50 Split Calculation
        const splitAmount = total / 2;

        const updatedRepair = {
            ...selectedRepair,
            isPaid: true,
            status: 'IN_PROGRESS' as const, // Automatically move to in progress after payment
            timeline: [
                {
                    status: 'PAID',
                    date: new Date().toISOString(),
                    note: `Payment of ${formatPrice(total)} received. 50/50 Split: ${formatPrice(splitAmount)} to Fixer, ${formatPrice(splitAmount)} to Platform.`
                },
                ...(selectedRepair.timeline || [])
            ]
        };
        onUpdateRepair(updatedRepair);
        setIsPaymentModalOpen(false);
        setSelectedRepair(updatedRepair);
    };

    const handleSubmitRating = () => {
        if (!selectedRepair || repairRating === 0) return;
        
        const updatedRepair = {
            ...selectedRepair,
            rating: repairRating,
            review: repairReview,
            timeline: [
                {
                    status: 'RATED',
                    date: new Date().toISOString(),
                    note: `Customer rated service ${repairRating}/5 stars.`
                },
                ...(selectedRepair.timeline || [])
            ]
        };
        onUpdateRepair(updatedRepair);
        setSelectedRepair(updatedRepair);
    };

    const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProductImageFile(file);
            setProductImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSendAdminReply = () => {
        if (selectedSession && adminChatInput.trim()) {
            onAdminReply(selectedSession.id, adminChatInput);
            setAdminChatInput('');
        }
    };

    const handleWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Withdrawal request for ${formatPrice(parseFloat(withdrawAmount))} submitted. Funds will arrive in 2-3 business days.`);
        setIsWithdrawModalOpen(false);
        setWithdrawAmount('');
    };

    // --- Render Functions ---

    const renderSidebar = () => (
        <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out z-30 w-64 bg-white dark:bg-silver-900 border-r border-silver-200 dark:border-silver-800 flex flex-col h-full`}>
            <div className="p-6">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-silver-200 dark:border-silver-700">
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-silver-900 dark:text-white line-clamp-1">{user.name}</h3>
                        <Badge color={isSuperAdmin ? 'red' : isAdmin ? 'purple' : isFixer ? 'blue' : 'green'}>{user.role.replace('_', ' ')}</Badge>
                    </div>
                 </div>
                 <div className="space-y-1">
                    <button onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-blucell-50 text-blucell-700 dark:bg-blucell-900/20 dark:text-blucell-400' : 'text-silver-600 hover:bg-silver-50 dark:hover:bg-silver-800'}`}>
                        <LayoutDashboard className="w-4 h-4" /> Overview
                    </button>
                    <button onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-blucell-50 text-blucell-700 dark:bg-blucell-900/20 dark:text-blucell-400' : 'text-silver-600 hover:bg-silver-50 dark:hover:bg-silver-800'}`}>
                        <ShoppingBag className="w-4 h-4" /> Orders
                    </button>
                    <button onClick={() => { setActiveTab('repairs'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'repairs' ? 'bg-blucell-50 text-blucell-700 dark:bg-blucell-900/20 dark:text-blucell-400' : 'text-silver-600 hover:bg-silver-50 dark:hover:bg-silver-800'}`}>
                        <Wrench className="w-4 h-4" /> Repairs
                    </button>
                    {isFixer && (
                        <button onClick={() => { setActiveTab('wallet'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'wallet' ? 'bg-blucell-50 text-blucell-700 dark:bg-blucell-900/20 dark:text-blucell-400' : 'text-silver-600 hover:bg-silver-50 dark:hover:bg-silver-800'}`}>
                            <Wallet className="w-4 h-4" /> Wallet
                        </button>
                    )}
                    {isAdmin && (
                        <>
                            <div className="pt-4 pb-2 text-xs font-semibold text-silver-400 uppercase tracking-wider">Admin</div>
                            <button onClick={() => { setActiveTab('logistics'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'logistics' ? 'bg-blucell-50 text-blucell-700 dark:bg-blucell-900/20 dark:text-blucell-400' : 'text-silver-600 hover:bg-silver-50 dark:hover:bg-silver-800'}`}>
                                <Truck className="w-4 h-4" /> Logistics
                            </button>
                            <button onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-blucell-50 text-blucell-700 dark:bg-blucell-900/20 dark:text-blucell-400' : 'text-silver-600 hover:bg-silver-50 dark:hover:bg-silver-800'}`}>
                                <Users className="w-4 h-4" /> Users
                            </button>
                            <button onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'products' ? 'bg-blucell-50 text-blucell-700 dark:bg-blucell-900/20 dark:text-blucell-400' : 'text-silver-600 hover:bg-silver-50 dark:hover:bg-silver-800'}`}>
                                <Package className="w-4 h-4" /> Inventory
                            </button>
                            {canAccessCMS && (
                                <button onClick={() => { setActiveTab('content'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'content' ? 'bg-blucell-50 text-blucell-700 dark:bg-blucell-900/20 dark:text-blucell-400' : 'text-silver-600 hover:bg-silver-50 dark:hover:bg-silver-800'}`}>
                                    <LayoutTemplate className="w-4 h-4" /> Content (CMS)
                                </button>
                            )}
                            <button onClick={() => { setActiveTab('support'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'support' ? 'bg-blucell-50 text-blucell-700 dark:bg-blucell-900/20 dark:text-blucell-400' : 'text-silver-600 hover:bg-silver-50 dark:hover:bg-silver-800'}`}>
                                <MessageSquare className="w-4 h-4" /> Support Chats
                            </button>
                            <button onClick={() => { setActiveTab('messages'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'messages' ? 'bg-blucell-50 text-blucell-700 dark:bg-blucell-900/20 dark:text-blucell-400' : 'text-silver-600 hover:bg-silver-50 dark:hover:bg-silver-800'}`}>
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

    const renderWallet = () => {
        // Calculate earnings: 50% of completed & paid repairs
        const paidRepairs = myRepairs.filter(r => r.isPaid && r.estimatedCost);
        const totalEarnings = paidRepairs.reduce((acc, r) => acc + ((r.estimatedCost || 0) / 2), 0);
        
        return (
            <div className="space-y-6 animate-fade-in-up">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">My Wallet</h2>
                    <Button onClick={() => setIsWithdrawModalOpen(true)}>
                        <ArrowUpRight className="w-4 h-4 mr-2" /> Withdraw Funds
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 bg-gradient-to-br from-blucell-600 to-blucell-800 text-white border-none">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-sm font-medium text-blucell-100">Available Balance</span>
                        </div>
                        <h3 className="text-4xl font-bold mb-2">{formatPrice(totalEarnings)}</h3>
                        <p className="text-xs text-blucell-200">Total earnings from {paidRepairs.length} completed jobs (50% Split)</p>
                    </Card>
                    
                    <Card className="p-6">
                        <h4 className="text-sm font-bold text-silver-500 mb-2 uppercase tracking-wider">Pending Clearance</h4>
                        <h3 className="text-2xl font-bold text-silver-900 dark:text-white">{formatPrice(0)}</h3>
                        <p className="text-xs text-silver-400 mt-2">Funds are available immediately after customer payment.</p>
                    </Card>

                    <Card className="p-6">
                        <h4 className="text-sm font-bold text-silver-500 mb-2 uppercase tracking-wider">Total Withdrawn</h4>
                        <h3 className="text-2xl font-bold text-silver-900 dark:text-white">{formatPrice(0)}</h3>
                        <p className="text-xs text-silver-400 mt-2">Lifetime withdrawals</p>
                    </Card>
                </div>

                <Card className="overflow-hidden">
                    <div className="p-6 border-b border-silver-100 dark:border-silver-800">
                        <h3 className="font-bold text-lg">Transaction History</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-silver-50 dark:bg-silver-800 text-silver-500">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Repair ID</th>
                                    <th className="px-6 py-3">Device</th>
                                    <th className="px-6 py-3">Total Cost</th>
                                    <th className="px-6 py-3 text-right">Your Cut (50%)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-silver-100 dark:divide-silver-800">
                                {paidRepairs.map(repair => (
                                    <tr key={repair.id} className="hover:bg-silver-50 dark:hover:bg-silver-800/50">
                                        <td className="px-6 py-4 text-silver-600 dark:text-silver-400">
                                            {repair.timeline?.find(t => t.status === 'PAID')?.date 
                                                ? new Date(repair.timeline.find(t => t.status === 'PAID')!.date).toLocaleDateString()
                                                : new Date().toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-medium">{repair.id}</td>
                                        <td className="px-6 py-4">{repair.deviceType}</td>
                                        <td className="px-6 py-4 text-silver-500">{formatPrice(repair.estimatedCost || 0)}</td>
                                        <td className="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">
                                            +{formatPrice((repair.estimatedCost || 0) / 2)}
                                        </td>
                                    </tr>
                                ))}
                                {paidRepairs.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-silver-500">
                                            No earnings yet. Complete repair jobs to earn money.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        );
    };

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

                                {selectedRepair.attachments && selectedRepair.attachments.length > 0 && (
                                    <div className="mt-6">
                                        <h4 className="text-sm font-bold text-silver-500 mb-3 flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4" /> Customer Attachments
                                        </h4>
                                        <div className="flex gap-3 overflow-x-auto pb-2">
                                            {selectedRepair.attachments.map((file, idx) => (
                                                <div key={idx} className="relative group shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-silver-200 dark:border-silver-700 bg-black">
                                                    {file.type === 'video' ? (
                                                        <video src={file.url} className="w-full h-full object-cover opacity-80" />
                                                    ) : (
                                                        <img src={file.url} alt="Evidence" className="w-full h-full object-cover" />
                                                    )}
                                                    
                                                    {file.type === 'video' && (
                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                            <Video className="w-6 h-6 text-white drop-shadow-md" />
                                                        </div>
                                                    )}

                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        <a 
                                                            href={file.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className="text-white hover:text-blucell-400 p-1"
                                                            title="View"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </a>
                                                        <a 
                                                            href={file.url} 
                                                            download={`attachment-${idx}`}
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-white hover:text-blucell-400 p-1"
                                                            title="Download"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-silver-500">Method:</span> <span className="font-medium">{selectedRepair.deliveryMethod}</span>
                                    </div>
                                    <div>
                                        <span className="text-silver-500 block mb-1">Estimated Cost:</span>
                                        {(isAdmin || isFixer) ? (
                                            isEditingCost ? (
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="number" 
                                                        className="w-32 h-8 px-2 text-sm border rounded dark:bg-silver-800 dark:border-silver-700"
                                                        value={costInput}
                                                        onChange={(e) => setCostInput(e.target.value)}
                                                        placeholder="0.00"
                                                        autoFocus
                                                    />
                                                    <Button size="sm" onClick={handleSaveCost} className="h-8 w-8 p-0 flex items-center justify-center bg-green-600 hover:bg-green-700"><Check className="w-4 h-4" /></Button>
                                                    <Button size="sm" variant="ghost" onClick={() => setIsEditingCost(false)} className="h-8 w-8 p-0 flex items-center justify-center text-red-500 hover:bg-red-50"><X className="w-4 h-4" /></Button>
                                                </div>
                                            ) : (
                                                <div 
                                                    className="flex items-center gap-2 cursor-pointer hover:bg-silver-100 dark:hover:bg-silver-800 p-1 rounded transition-colors w-fit"
                                                    onClick={() => {
                                                        setCostInput(selectedRepair.estimatedCost?.toString() || '');
                                                        setIsEditingCost(true);
                                                    }}
                                                    title="Click to edit price"
                                                >
                                                    <span className="font-bold text-lg">
                                                        {selectedRepair.estimatedCost ? formatPrice(selectedRepair.estimatedCost) : 'Set Price'}
                                                    </span>
                                                    <Edit className="w-3 h-3 text-silver-400" />
                                                </div>
                                            )
                                        ) : (
                                            <span className="font-bold text-lg">
                                                {selectedRepair.estimatedCost ? formatPrice(selectedRepair.estimatedCost) : 'Pending Quote'}
                                            </span>
                                        )}
                                        {/* Fixer Earnings Display */}
                                        {isFixer && selectedRepair.estimatedCost && selectedRepair.estimatedCost > 0 && (
                                            <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800 flex items-center gap-2">
                                                <Wallet className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                <p className="text-xs text-green-700 dark:text-green-400 font-bold">
                                                    Your Payout (50%): {formatPrice(selectedRepair.estimatedCost / 2)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto bg-silver-50/50 dark:bg-silver-950/50 grid grid-cols-1 md:grid-cols-2">
                                <div className="p-6 border-r border-silver-100 dark:border-silver-800">
                                    <h4 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-silver-500">
                                        <History className="w-4 h-4" /> Repair Timeline
                                    </h4>
                                    
                                    {/* Rating Section for Customer (if Completed/Delivered) */}
                                    {isCustomer && (selectedRepair.status === 'COMPLETED' || selectedRepair.status === 'DELIVERED') && (
                                        <div className="mb-6 p-4 bg-white dark:bg-silver-900 rounded-lg border border-silver-200 dark:border-silver-700 shadow-sm animate-fade-in">
                                            <h5 className="font-bold text-sm mb-2 flex items-center gap-2">
                                                <Star className="w-4 h-4 text-amber-500" /> Rate Service
                                            </h5>
                                            {selectedRepair.rating ? (
                                                <div>
                                                    <div className="flex gap-1 mb-2">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star 
                                                                key={star} 
                                                                className={`w-5 h-5 ${star <= selectedRepair.rating! ? 'text-amber-500 fill-amber-500' : 'text-silver-300 dark:text-silver-700'}`} 
                                                            />
                                                        ))}
                                                    </div>
                                                    {selectedRepair.review && <p className="text-xs text-silver-600 dark:text-silver-400 italic">"{selectedRepair.review}"</p>}
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <button 
                                                                key={star}
                                                                onClick={() => setRepairRating(star)}
                                                                className="focus:outline-none transition-transform hover:scale-110"
                                                            >
                                                                <Star 
                                                                    className={`w-6 h-6 ${star <= repairRating ? 'text-amber-500 fill-amber-500' : 'text-silver-300 dark:text-silver-700 hover:text-amber-400'}`} 
                                                                />
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <textarea 
                                                        placeholder="Write a short review..." 
                                                        className="w-full text-xs p-2 border rounded bg-transparent dark:border-silver-700 h-16 resize-none"
                                                        value={repairReview}
                                                        onChange={(e) => setRepairReview(e.target.value)}
                                                    />
                                                    <Button size="sm" onClick={handleSubmitRating} disabled={repairRating === 0} className="w-full">
                                                        Submit Review
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Rating Display for Others */}
                                    {(!isCustomer && selectedRepair.rating) && (
                                         <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
                                            <div className="flex justify-between items-start">
                                                <h5 className="font-bold text-sm text-amber-800 dark:text-amber-200 mb-1">Customer Rating</h5>
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star 
                                                            key={star} 
                                                            className={`w-3 h-3 ${star <= selectedRepair.rating! ? 'text-amber-500 fill-amber-500' : 'text-silver-300 dark:text-silver-700'}`} 
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            {selectedRepair.review && <p className="text-xs text-amber-700 dark:text-amber-300 mt-2 italic">"{selectedRepair.review}"</p>}
                                        </div>
                                    )}

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
                                                    event.status === 'RATED' ? 'bg-amber-500' :
                                                    event.status === 'QUOTE_UPDATED' ? 'bg-blue-500' :
                                                    'bg-blucell-500'
                                                }`}></div>
                                                <div className="flex justify-between items-start">
                                                    <p className={`font-medium text-sm ${event.status === 'NOTE' ? 'text-silver-600 dark:text-silver-400' : 'text-silver-900 dark:text-white'}`}>
                                                        {event.status === 'NOTE' ? 'Note Added' : event.status === 'QUOTE_UPDATED' ? 'Price Updated' : event.status === 'RATED' ? 'Review Added' : event.status}
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
                                            </div>
                                        )}
                                    </div>
                                </div>
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
        </div>
    );

    const renderUsers = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">User Management</h2>
                <Button onClick={() => { setSelectedUser(null); setIsUserModalOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" /> Add User
                </Button>
            </div>
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-silver-500 uppercase bg-silver-50 dark:bg-silver-800 border-b border-silver-100 dark:border-silver-700">
                            <tr>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-silver-100 dark:divide-silver-800">
                            {allUsers.map(u => (
                                <tr key={u.id} className="hover:bg-silver-50 dark:hover:bg-silver-800/50">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full bg-silver-200" />
                                        <div>
                                            <div className="font-bold">{u.name}</div>
                                            <div className="text-xs text-silver-500">{u.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge color={u.role === 'ADMIN' ? 'red' : u.role === 'SUPER_ADMIN' ? 'purple' : u.role === 'ADMIN_JR' ? 'purple' : u.role === 'FIXER' ? 'blue' : 'green'}>{u.role.replace('_', ' ')}</Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        {u.role === 'FIXER' && u.availabilityStatus ? <StatusIndicator status={u.availabilityStatus} /> : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blucell-600 hover:text-blucell-700 font-medium" onClick={() => { setSelectedUser(u); setIsUserModalOpen(true); }}>
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );

    const renderLogistics = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Logistics & Dispatch</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Truck className="w-5 h-5" /> Active Shipments</h3>
                    <div className="space-y-4">
                        {allOrders.filter(o => o.status !== 'DELIVERED').map(order => (
                            <div key={order.id} className="flex items-center justify-between p-3 border border-silver-100 dark:border-silver-800 rounded-lg">
                                <div>
                                    <p className="font-bold">Order #{order.id}</p>
                                    <p className="text-xs text-silver-500">{order.items.length} items</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="ghost" onClick={() => setSelectedLogisticOrder(order)} className="text-xs bg-silver-100 dark:bg-silver-700/50">
                                        View Content
                                    </Button>
                                    <Badge color="yellow">{order.status}</Badge>
                                    <Button size="sm" variant="ghost" onClick={() => onUpdateOrder(order.id, 'DELIVERED')} title="Mark Delivered">
                                        <Check className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {allOrders.filter(o => o.status !== 'DELIVERED').length === 0 && <p className="text-silver-500 text-sm">No active shipments.</p>}
                    </div>
                </Card>
                <Card className="p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><MapPin className="w-5 h-5" /> Pending Pickups</h3>
                    <div className="space-y-4">
                        {allRepairs.filter(r => r.deliveryMethod === 'PICKUP' && r.status === 'PENDING').map(repair => (
                            <div key={repair.id} className="p-3 border border-silver-100 dark:border-silver-800 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="font-bold text-sm">{repair.deviceType}</p>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => setSelectedLogisticRepair(repair)}>
                                            <Eye className="w-3 h-3 mr-1" /> View Request
                                        </Button>
                                        <Badge color="blue">Pickup Req</Badge>
                                    </div>
                                </div>
                                <div className="text-xs text-silver-500 mb-2">
                                    <p>Address: {repair.pickupAddress}</p>
                                    <p>Contact: {repair.contactPhone}</p>
                                </div>
                                <Button size="sm" className="w-full" onClick={() => handleStatusChange(repair, 'PICKED_UP')}>Confirm Pickup Dispatch</Button>
                            </div>
                        ))}
                         {allRepairs.filter(r => r.deliveryMethod === 'PICKUP' && r.status === 'PENDING').length === 0 && <p className="text-silver-500 text-sm">No pending pickups.</p>}
                    </div>
                </Card>
            </div>
        </div>
    );

    const renderContent = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Content Management System</h2>
            </div>
            
            <div className="flex gap-4 border-b border-silver-200 dark:border-silver-800 mb-4">
                <button 
                    onClick={() => setActiveContentTab('landing')}
                    className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeContentTab === 'landing' ? 'border-blucell-500 text-blucell-600' : 'border-transparent text-silver-500 hover:text-silver-700'}`}
                >
                    Landing Page
                </button>
                <button 
                    onClick={() => setActiveContentTab('contact')}
                    className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeContentTab === 'contact' ? 'border-blucell-500 text-blucell-600' : 'border-transparent text-silver-500 hover:text-silver-700'}`}
                >
                    Contact Page
                </button>
                <button 
                    onClick={() => setActiveContentTab('about')}
                    className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeContentTab === 'about' ? 'border-blucell-500 text-blucell-600' : 'border-transparent text-silver-500 hover:text-silver-700'}`}
                >
                    Team & About Us
                </button>
            </div>

            {activeContentTab === 'landing' && (
                <Card className="p-8">
                    <form onSubmit={handleSaveLanding} className="space-y-8">
                        {/* Hero Section */}
                        <div>
                            <h3 className="font-bold text-lg border-b border-silver-100 dark:border-silver-800 pb-2 mb-4">Hero Section</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <Input label="Title Prefix" value={landingForm.hero.titlePrefix} onChange={e => setLandingForm({...landingForm, hero: {...landingForm.hero, titlePrefix: e.target.value}})} />
                                <Input label="Highlight" value={landingForm.hero.titleHighlight} onChange={e => setLandingForm({...landingForm, hero: {...landingForm.hero, titleHighlight: e.target.value}})} />
                                <Input label="Suffix" value={landingForm.hero.titleSuffix} onChange={e => setLandingForm({...landingForm, hero: {...landingForm.hero, titleSuffix: e.target.value}})} />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Subtitle</label>
                                <textarea className="w-full border rounded p-2 bg-transparent" rows={3} value={landingForm.hero.subtitle} onChange={e => setLandingForm({...landingForm, hero: {...landingForm.hero, subtitle: e.target.value}})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <Input label="Primary CTA" value={landingForm.hero.ctaPrimary} onChange={e => setLandingForm({...landingForm, hero: {...landingForm.hero, ctaPrimary: e.target.value}})} />
                                <Input label="Secondary CTA" value={landingForm.hero.ctaSecondary} onChange={e => setLandingForm({...landingForm, hero: {...landingForm.hero, ctaSecondary: e.target.value}})} />
                            </div>
                            
                            <label className="block text-sm font-medium mb-2">Hero Slideshow Images</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                {landingForm.hero.images.map((img, idx) => (
                                    <div key={idx} className="relative group rounded-lg overflow-hidden h-24 border border-silver-200">
                                        <img src={img} className="w-full h-full object-cover" alt="" />
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveHeroImage(idx)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                <label className="border-2 border-dashed border-silver-300 dark:border-silver-700 rounded-lg flex flex-col items-center justify-center p-2 cursor-pointer hover:bg-silver-50 h-24">
                                    <Plus className="w-6 h-6 text-silver-400 mb-1" />
                                    <span className="text-xs text-silver-500">{cmsUploading ? 'Uploading...' : 'Add Image'}</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleHeroImageUpload} disabled={cmsUploading} />
                                </label>
                            </div>
                        </div>

                        {/* Features Section */}
                        <div>
                            <h3 className="font-bold text-lg border-b border-silver-100 dark:border-silver-800 pb-2 mb-4">Features</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {landingForm.features.map((feature, idx) => (
                                    <div key={idx} className="p-4 border border-silver-100 rounded-lg bg-silver-50/50">
                                        <div className="mb-2 text-xs text-silver-400 font-bold uppercase">Feature {idx + 1}</div>
                                        <Input label="Title" value={feature.title} onChange={e => {
                                            const newFeatures = [...landingForm.features];
                                            newFeatures[idx].title = e.target.value;
                                            setLandingForm({...landingForm, features: newFeatures});
                                        }} className="mb-2" />
                                        <Input label="Description" value={feature.description} onChange={e => {
                                            const newFeatures = [...landingForm.features];
                                            newFeatures[idx].description = e.target.value;
                                            setLandingForm({...landingForm, features: newFeatures});
                                        }} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Trending Section */}
                        <div>
                            <h3 className="font-bold text-lg border-b border-silver-100 dark:border-silver-800 pb-2 mb-4">Trending Section</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <Input label="Section Title" value={landingForm.trending.sectionTitle} onChange={e => setLandingForm({...landingForm, trending: {...landingForm.trending, sectionTitle: e.target.value}})} />
                                <Input label="Section Subtitle" value={landingForm.trending.sectionSubtitle} onChange={e => setLandingForm({...landingForm, trending: {...landingForm.trending, sectionSubtitle: e.target.value}})} />
                            </div>
                            <div className="space-y-4">
                                {landingForm.trending.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 items-start p-4 border border-silver-100 rounded-lg">
                                        <div className="w-16 h-16 bg-silver-100 rounded overflow-hidden flex-shrink-0">
                                            <img src={item.image} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                                            <Input placeholder="Title" value={item.title} onChange={e => {
                                                const newItems = [...landingForm.trending.items];
                                                newItems[idx].title = e.target.value;
                                                setLandingForm({...landingForm, trending: {...landingForm.trending, items: newItems}});
                                            }} />
                                            <Input placeholder="Description" value={item.description} onChange={e => {
                                                const newItems = [...landingForm.trending.items];
                                                newItems[idx].description = e.target.value;
                                                setLandingForm({...landingForm, trending: {...landingForm.trending, items: newItems}});
                                            }} />
                                            <Input placeholder="Image URL" value={item.image} onChange={e => {
                                                const newItems = [...landingForm.trending.items];
                                                newItems[idx].image = e.target.value;
                                                setLandingForm({...landingForm, trending: {...landingForm.trending, items: newItems}});
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* CTA Bottom */}
                        <div>
                            <h3 className="font-bold text-lg border-b border-silver-100 dark:border-silver-800 pb-2 mb-4">Bottom Call to Action</h3>
                            <Input label="Title" value={landingForm.ctaBottom.title} onChange={e => setLandingForm({...landingForm, ctaBottom: {...landingForm.ctaBottom, title: e.target.value}})} />
                            <div className="mt-4">
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea className="w-full border rounded p-2 bg-transparent" rows={2} value={landingForm.ctaBottom.description} onChange={e => setLandingForm({...landingForm, ctaBottom: {...landingForm.ctaBottom, description: e.target.value}})} />
                            </div>
                            <div className="mt-4">
                                 <Input label="Button Text" value={landingForm.ctaBottom.buttonText} onChange={e => setLandingForm({...landingForm, ctaBottom: {...landingForm.ctaBottom, buttonText: e.target.value}})} />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit">Save Landing Page</Button>
                        </div>
                    </form>
                </Card>
            )}

            {activeContentTab === 'contact' && (
                <Card className="p-8 max-w-2xl">
                    <form onSubmit={handleSaveContact} className="space-y-6">
                        <h3 className="font-bold text-lg border-b border-silver-100 dark:border-silver-800 pb-2">Contact Information</h3>
                        <p className="text-sm text-silver-500 mb-4">This information will be displayed on the Contact Us page and footer.</p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium mb-1">
                                    <Phone className="w-4 h-4" /> Phone Number
                                </label>
                                <Input value={contactForm.phone} onChange={e => setContactForm({...contactForm, phone: e.target.value})} />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium mb-1">
                                    <Mail className="w-4 h-4" /> Email Address
                                </label>
                                <Input value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium mb-1">
                                    <MapPin className="w-4 h-4" /> Physical Address
                                </label>
                                <textarea 
                                    className="w-full border rounded p-2 bg-transparent" 
                                    rows={3} 
                                    value={contactForm.address} 
                                    onChange={e => setContactForm({...contactForm, address: e.target.value})} 
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit">Update Contact Info</Button>
                        </div>
                    </form>
                </Card>
            )}

            {activeContentTab === 'about' && (
                <div className="space-y-6">
                    <Card className="p-8">
                        <div className="flex justify-between items-center mb-6 border-b border-silver-100 pb-4">
                            <div>
                                <h3 className="font-bold text-lg">Team Members</h3>
                                <p className="text-sm text-silver-500">Manage the team displayed on the About Us page.</p>
                            </div>
                            <Button size="sm" onClick={handleAddTeamMember}>
                                <Plus className="w-4 h-4 mr-2" /> Add Member
                            </Button>
                        </div>

                        <form onSubmit={handleSaveTeam}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {teamForm.map((member, idx) => (
                                    <div key={member.id} className="p-4 border border-silver-200 dark:border-silver-800 rounded-lg flex gap-4 items-start bg-silver-50 dark:bg-silver-900/50">
                                        <div className="flex-shrink-0">
                                            <div className="w-20 h-20 rounded-full overflow-hidden mb-2 border border-silver-300">
                                                <img src={member.image} className="w-full h-full object-cover" alt={member.name} />
                                            </div>
                                            <label className="text-xs text-blucell-600 cursor-pointer hover:underline block text-center">
                                                {cmsUploading ? '...' : 'Change'}
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleTeamImageUpload(e, member.id)} disabled={cmsUploading} />
                                            </label>
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <Input 
                                                placeholder="Name" 
                                                value={member.name} 
                                                onChange={e => {
                                                    const newTeam = [...teamForm];
                                                    newTeam[idx].name = e.target.value;
                                                    setTeamForm(newTeam);
                                                }}
                                                className="text-sm"
                                            />
                                            <Input 
                                                placeholder="Role" 
                                                value={member.role} 
                                                onChange={e => {
                                                    const newTeam = [...teamForm];
                                                    newTeam[idx].role = e.target.value;
                                                    setTeamForm(newTeam);
                                                }}
                                                className="text-sm"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveTeamMember(member.id)}
                                                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mt-2"
                                            >
                                                <Trash2 className="w-3 h-3" /> Remove Member
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="flex justify-end pt-6 mt-6 border-t border-silver-100">
                                <Button type="submit" className="flex items-center gap-2">
                                    <Save className="w-4 h-4" /> Save Team Changes
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );

    const renderSupport = () => (
        <div className="h-full flex gap-4 overflow-hidden">
            <Card className="w-1/3 flex flex-col p-0">
                <div className="p-4 border-b border-silver-100 dark:border-silver-800">
                    <h3 className="font-bold">Active Sessions</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {supportSessions.map(session => (
                        <div 
                            key={session.id} 
                            onClick={() => setSelectedSession(session)}
                            className={`p-4 border-b border-silver-100 dark:border-silver-800 cursor-pointer hover:bg-silver-50 dark:hover:bg-silver-800 ${selectedSession?.id === session.id ? 'bg-blucell-50 dark:bg-blucell-900/20' : ''}`}
                        >
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-8 h-8 rounded-full bg-silver-200 overflow-hidden">
                                    <img src={session.userAvatar} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate">{session.userName}</p>
                                    <p className="text-xs text-silver-500 truncate">{session.lastMessage}</p>
                                </div>
                                {session.unreadCount > 0 && <Badge color="red">{session.unreadCount}</Badge>}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
            <Card className="flex-1 flex flex-col p-0">
                {selectedSession ? (
                    <>
                        <div className="p-4 border-b border-silver-100 dark:border-silver-800 flex justify-between items-center bg-silver-50 dark:bg-silver-800">
                            <div className="flex items-center gap-2">
                                <img src={selectedSession.userAvatar} className="w-8 h-8 rounded-full" />
                                <span className="font-bold">{selectedSession.userName}</span>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => setSelectedSession(null)}><X className="w-4 h-4" /></Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {selectedSession.messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.senderId === 'admin' || msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.senderId === 'admin' || msg.senderId === user.id ? 'bg-blucell-600 text-white' : 'bg-silver-100 dark:bg-silver-800'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-silver-100 dark:border-silver-800 flex gap-2">
                            <Input placeholder="Type a reply..." value={adminChatInput} onChange={e => setAdminChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendAdminReply()} />
                            <Button onClick={handleSendAdminReply}><Send className="w-4 h-4" /></Button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-silver-400">Select a chat to view</div>
                )}
            </Card>
        </div>
    );

    const renderMessages = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Contact Messages</h2>
            <Card className="overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-silver-50 dark:bg-silver-800 text-silver-500">
                        <tr>
                            <th className="px-6 py-3">From</th>
                            <th className="px-6 py-3">Subject</th>
                            <th className="px-6 py-3">Message</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-silver-100 dark:divide-silver-800">
                        {contactMessages.map(msg => (
                            <tr key={msg.id}>
                                <td className="px-6 py-4">
                                    <div className="font-bold">{msg.name}</div>
                                    <div className="text-xs text-silver-500">{msg.email}</div>
                                </td>
                                <td className="px-6 py-4 font-medium">{msg.subject}</td>
                                <td className="px-6 py-4 max-w-xs truncate">{msg.message}</td>
                                <td className="px-6 py-4 text-silver-500">{msg.date.toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-red-500 hover:text-red-600" onClick={() => onDeleteContactMessage(msg.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {contactMessages.length === 0 && (
                            <tr><td colSpan={5} className="text-center py-8 text-silver-500">No messages yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    );

    return (
        <div className="flex h-screen bg-silver-50 dark:bg-silver-950 transition-colors duration-300">
             {/* Mobile Sidebar Overlay */}
             {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-20 md:hidden" 
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
            {renderSidebar()}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                 <header className="h-16 bg-white dark:bg-silver-900 border-b border-silver-200 dark:border-silver-800 flex items-center justify-between px-6 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden p-2 -ml-2 text-silver-500" onClick={() => setIsSidebarOpen(true)}>
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold capitalize">{activeTab === 'content' ? 'CMS' : activeTab}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                         <Button variant="ghost" className="p-2 rounded-full relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                         </Button>
                    </div>
                 </header>
                 <main className="flex-1 overflow-auto p-6">
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'repairs' && renderRepairs()}
                    {activeTab === 'wallet' && isFixer && renderWallet()}
                    {activeTab === 'orders' && <div className="text-center py-12 text-silver-400">Orders Management (See Logistics Tab for Admin)</div>}
                    {activeTab === 'users' && renderUsers()}
                    {activeTab === 'logistics' && renderLogistics()}
                    {activeTab === 'content' && canAccessCMS && renderContent()}
                    {activeTab === 'support' && renderSupport()}
                    {activeTab === 'messages' && renderMessages()}
                    {activeTab === 'products' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold">Inventory</h2>
                                <Button onClick={() => { setSelectedProduct(null); setProductImageFile(null); setProductImagePreview(''); setIsProductModalOpen(true); }}>
                                    <Plus className="w-4 h-4 mr-2" /> Add Product
                                </Button>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map(product => (
                                    <Card key={product.id} className="overflow-hidden flex flex-col">
                                        <div className="h-48 bg-silver-100 dark:bg-silver-800 relative">
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                            {product.isBestSeller && <div className="absolute top-2 left-2"><Badge color="yellow">Best Seller</Badge></div>}
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold line-clamp-1">{product.name}</h3>
                                                <span className="font-bold text-blucell-600">{formatPrice(product.price)}</span>
                                            </div>
                                            <p className="text-sm text-silver-500 mb-4 line-clamp-2 flex-1">{product.description}</p>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" className="flex-1" onClick={() => { 
                                                    setSelectedProduct(product); 
                                                    setProductImageFile(null); 
                                                    setProductImagePreview(''); 
                                                    setIsProductModalOpen(true); 
                                                }}>
                                                    <Edit className="w-4 h-4 mr-2" /> Edit
                                                </Button>
                                                <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => onDeleteProduct(product.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                 </main>
            </div>

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

            {isWithdrawModalOpen && (
                <Modal title="Withdraw Funds" onClose={() => setIsWithdrawModalOpen(false)}>
                    <form className="space-y-4" onSubmit={handleWithdraw}>
                        <div className="p-4 bg-blucell-50 dark:bg-blucell-900/10 rounded-lg mb-4">
                            <p className="text-sm text-blucell-700 dark:text-blucell-300">Available Balance: {formatPrice(myRepairs.filter(r => r.isPaid && r.estimatedCost).reduce((acc, r) => acc + ((r.estimatedCost || 0) / 2), 0))}</p>
                        </div>
                        <Input 
                            label="Amount to Withdraw" 
                            type="number" 
                            placeholder="0.00" 
                            value={withdrawAmount} 
                            onChange={(e) => setWithdrawAmount(e.target.value)} 
                            required 
                        />
                        <Input label="Bank Account Number" placeholder="**** **** **** 1234" required />
                        <Input label="Routing Number" placeholder="123456789" required />
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsWithdrawModalOpen(false)}>Cancel</Button>
                            <Button type="submit">Submit Request</Button>
                        </div>
                    </form>
                </Modal>
            )}

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
                                {(isSuperAdmin || user.role === 'ADMIN') && <option value="ADMIN">Admin</option>}
                                {isSuperAdmin && <option value="ADMIN_JR">Admin JR</option>}
                            </select>
                        </div>
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

            {isProductModalOpen && (
                 <Modal title={selectedProduct ? "Edit Product" : "Add Product"} onClose={() => setIsProductModalOpen(false)}>
                    <form className="space-y-4" onSubmit={async (e) => {
                        e.preventDefault();
                        setIsUploading(true);
                        const formData = new FormData(e.target as HTMLFormElement);
                        let imageUrl = selectedProduct?.image || '';
                        
                        // ID consistency fix
                        const productId = selectedProduct?.id || `p-${Date.now()}`;

                        if (productImageFile) {
                            try {
                                const storageRef = ref(storage, `products/${productId}/${productImageFile.name}`);
                                await uploadBytes(storageRef, productImageFile);
                                imageUrl = await getDownloadURL(storageRef);
                            } catch (error) {
                                console.error("Image upload failed", error);
                                alert("Failed to upload image");
                                setIsUploading(false);
                                return;
                            }
                        }

                        const productData: any = {
                            id: productId,
                            name: formData.get('name') as string,
                            price: parseFloat(formData.get('price') as string),
                            category: formData.get('category') as any,
                            image: imageUrl,
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
                        setIsUploading(false);
                        setProductImageFile(null);
                        setProductImagePreview('');
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
                        <div>
                            <label className="block text-sm font-medium mb-1">Product Image</label>
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-silver-100 dark:bg-silver-800 rounded-lg overflow-hidden border border-silver-200 dark:border-silver-700 flex items-center justify-center relative">
                                    {productImagePreview || selectedProduct?.image ? (
                                        <img src={productImagePreview || selectedProduct?.image} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="w-8 h-8 text-silver-400" />
                                    )}
                                </div>
                                <label className="cursor-pointer bg-white dark:bg-silver-800 border border-silver-300 dark:border-silver-700 hover:bg-silver-50 dark:hover:bg-silver-700 text-silver-700 dark:text-silver-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                    <Upload className="w-4 h-4" />
                                    Upload Image
                                    <input type="file" accept="image/*" onChange={handleProductImageChange} className="hidden" />
                                </label>
                            </div>
                        </div>
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
                            <Button type="submit" isLoading={isUploading}>Save</Button>
                        </div>
                    </form>
                 </Modal>
            )}

            {selectedLogisticOrder && (
                <Modal title={`Order #${selectedLogisticOrder.id} Content`} onClose={() => setSelectedLogisticOrder(null)}>
                    <div className="space-y-4">
                        <div className="bg-silver-50 dark:bg-silver-800 p-4 rounded-lg flex justify-between items-center text-sm">
                            <div>
                                <p className="text-silver-500">Order Date</p>
                                <p className="font-bold">{new Date(selectedLogisticOrder.date).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-silver-500">Total Value</p>
                                <p className="font-bold text-blucell-600 dark:text-blucell-400">{formatPrice(selectedLogisticOrder.total)}</p>
                            </div>
                        </div>
                        
                        <div>
                            <h4 className="font-bold mb-2 text-sm text-silver-600 dark:text-silver-400">Items in Package</h4>
                            <div className="space-y-3">
                                {selectedLogisticOrder.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 items-center p-3 border border-silver-100 dark:border-silver-800 rounded-lg">
                                        <div className="w-12 h-12 bg-silver-100 dark:bg-silver-800 rounded overflow-hidden flex-shrink-0">
                                            <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm">{item.productName}</p>
                                            <p className="text-xs text-silver-500">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="pt-4 flex justify-end">
                            <Button variant="ghost" onClick={() => setSelectedLogisticOrder(null)}>Close</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {selectedLogisticRepair && (
                <Modal title={`Repair Request #${selectedLogisticRepair.id}`} onClose={() => setSelectedLogisticRepair(null)}>
                    <div className="space-y-4">
                        <div className="bg-silver-50 dark:bg-silver-800 p-4 rounded-lg space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-silver-500">Device</span>
                                <span className="font-bold">{selectedLogisticRepair.deviceType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-silver-500">Requested Pickup</span>
                                <span className="font-bold">{selectedLogisticRepair.dateBooked}</span>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold mb-2 text-sm">Issue Description</h4>
                            <div className="p-3 bg-silver-50 dark:bg-silver-800/50 border border-silver-100 dark:border-silver-800 rounded-lg text-sm">
                                {selectedLogisticRepair.issueDescription}
                            </div>
                        </div>

                        {selectedLogisticRepair.attachments && selectedLogisticRepair.attachments.length > 0 && (
                            <div>
                                <h4 className="font-bold mb-2 text-sm">Customer Attachments</h4>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {selectedLogisticRepair.attachments.map((file, idx) => (
                                        <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer" className="block w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-silver-200 dark:border-silver-700 bg-black relative">
                                            {file.type === 'video' ? (
                                                <>
                                                    <video src={file.url} className="w-full h-full object-cover opacity-80" />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <Video className="w-6 h-6 text-white" />
                                                    </div>
                                                </>
                                            ) : (
                                                <img src={file.url} alt="Damage" className="w-full h-full object-cover" />
                                            )}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-4 flex justify-between gap-4">
                            <Button variant="ghost" onClick={() => setSelectedLogisticRepair(null)}>Close</Button>
                            <Button onClick={() => {
                                setSelectedRepair(selectedLogisticRepair);
                                setSelectedLogisticRepair(null);
                                setActiveTab('repairs');
                            }}>
                                Open Full Manager
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};