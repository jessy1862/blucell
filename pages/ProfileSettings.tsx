
import React, { useState } from 'react';
import { User, AvailabilityStatus } from '../types';
import { Card, Button, Input, SectionTitle, Badge } from '../components/ui';
import { User as UserIcon, Mail, Phone, MapPin, Camera, Save, Bell, Shield, LogOut, Lock, Smartphone, Laptop, Briefcase } from 'lucide-react';

interface ProfileSettingsProps {
  user: User;
  onUpdate: (data: Partial<User>) => void;
  onLogout: () => void;
}

type SettingsTab = 'profile' | 'notifications' | 'security' | 'fixer';

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onUpdate, onLogout }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  
  // Profile Form State
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    address: user.address || '',
    bio: user.bio || '',
    availabilityStatus: user.availabilityStatus || 'OFFLINE'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [avatar, setAvatar] = useState(user.avatar);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    onUpdate({ ...formData, avatar });
    setIsSaving(false);
  };

  const handleAvatarChange = () => {
    const newAvatar = `https://ui-avatars.com/api/?name=${formData.name}&background=random&color=fff&size=256`;
    setAvatar(newAvatar);
  };

  const NavButton = ({ tab, icon: Icon, label, variant = 'default' }: { tab?: SettingsTab, icon: any, label: string, variant?: 'default' | 'danger' }) => {
    const isActive = activeTab === tab;
    const baseClass = "w-full px-6 py-4 flex items-center gap-3 text-left transition-colors font-medium";
    
    if (variant === 'danger') {
        return (
            <button onClick={onLogout} className={`${baseClass} hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600`}>
                <Icon className="w-5 h-5" />
                {label}
            </button>
        );
    }

    return (
        <button 
            onClick={() => tab && setActiveTab(tab)}
            className={`${baseClass} ${isActive 
                ? 'border-l-4 border-blucell-600 bg-slate-50 dark:bg-slate-800/50 text-blucell-700 dark:text-blucell-400' 
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-l-4 border-transparent'
            }`}
        >
            <Icon className={`w-5 h-5 ${isActive ? 'text-blucell-600' : ''}`} />
            {label}
        </button>
    );
  };

  const renderProfile = () => (
    <Card className="p-8 animate-fade-in-up">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            Personal Information
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="pl-10"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="pl-10"
                            type="email"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="pl-10"
                            placeholder="+1 (555) 000-0000"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="pl-10"
                            placeholder="City, Country"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bio</label>
                <textarea 
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm h-32 focus:outline-none focus:ring-2 focus:ring-blucell-500 placeholder:text-slate-400"
                    placeholder="Tell us a bit about yourself..."
                />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button type="submit" isLoading={isSaving} className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                </Button>
            </div>
        </form>
    </Card>
  );

  const renderFixerSettings = () => (
      <Card className="p-8 animate-fade-in-up">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blucell-600" /> Fixer Dashboard
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                  <h4 className="font-semibold mb-2">Availability Status</h4>
                  <p className="text-sm text-slate-500 mb-4">Control whether you appear in the "Find an Expert" list for new customers.</p>
                  
                  <div className="flex gap-4">
                      {['ONLINE', 'BUSY', 'OFFLINE'].map((status) => (
                          <button
                              type="button"
                              key={status}
                              onClick={() => setFormData({ ...formData, availabilityStatus: status as AvailabilityStatus })}
                              className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-bold transition-all ${
                                  formData.availabilityStatus === status 
                                  ? status === 'ONLINE' ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                                  : status === 'BUSY' ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                                  : 'border-slate-500 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                  : 'border-transparent bg-white dark:bg-slate-900 text-slate-500 hover:border-slate-200 dark:hover:border-slate-700'
                              }`}
                          >
                              {status}
                          </button>
                      ))}
                  </div>
              </div>

              <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Professional Bio</label>
                  <p className="text-xs text-slate-500 mb-2">This will be displayed to customers when booking.</p>
                  <textarea 
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-blucell-500 placeholder:text-slate-400"
                      placeholder="e.g. Certified Apple Technician with 5 years experience..."
                  />
              </div>

              <div className="flex justify-end pt-4">
                  <Button type="submit" isLoading={isSaving}>Update Status</Button>
              </div>
          </form>
      </Card>
  );

  const renderNotifications = () => (
    <Card className="p-8 animate-fade-in-up">
        <h3 className="text-xl font-bold mb-6">Notification Preferences</h3>
        
        <div className="space-y-8">
            <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Email Notifications</h4>
                <div className="space-y-4">
                    {[
                        { label: 'Order Confirmation & Updates', desc: 'Get notified when your order status changes.' },
                        { label: 'Repair Progress Alerts', desc: 'Real-time updates on your device repair.' },
                        { label: 'Promotional Offers', desc: 'Discounts and new product launches.' },
                        { label: 'Security Alerts', desc: 'Login attempts and password changes.' }
                    ].map((item, i) => (
                        <div key={i} className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
                                <p className="text-xs text-slate-500">{item.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked={i !== 2} />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blucell-300 dark:peer-focus:ring-blucell-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blucell-600"></div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Push Notifications</h4>
                <div className="space-y-4">
                     {[
                        { label: 'Chat Messages', desc: 'Messages from technicians or support.' },
                        { label: 'Delivery Updates', desc: 'When your courier is nearby.' }
                    ].map((item, i) => (
                        <div key={i} className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
                                <p className="text-xs text-slate-500">{item.desc}</p>
                            </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blucell-300 dark:peer-focus:ring-blucell-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blucell-600"></div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        
        <div className="flex justify-end pt-8">
             <Button>Save Preferences</Button>
        </div>
    </Card>
  );

  const renderSecurity = () => (
    <div className="space-y-6 animate-fade-in-up">
        <Card className="p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blucell-600" />
                Password & Security
            </h3>
            
            <div className="space-y-6">
                 <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Change Password</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input type="password" label="Current Password" />
                        <div className="hidden md:block"></div>
                        <Input type="password" label="New Password" />
                        <Input type="password" label="Confirm New Password" />
                    </div>
                    <div className="mt-4">
                        <Button variant="outline">Update Password</Button>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white">Two-Factor Authentication</h4>
                            <p className="text-sm text-slate-500">Secure your account with 2FA via SMS or Authenticator App.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blucell-300 dark:peer-focus:ring-blucell-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blucell-600"></div>
                        </label>
                    </div>
                 </div>
            </div>
        </Card>

        <Card className="p-8">
             <h3 className="text-xl font-bold mb-6">Active Sessions</h3>
             <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-4">
                        <Laptop className="w-6 h-6 text-slate-500" />
                        <div>
                            <p className="font-medium text-sm">MacBook Pro 16" - Chrome</p>
                            <p className="text-xs text-slate-500">San Francisco, CA • Active now</p>
                        </div>
                    </div>
                    <Badge color="green">Current</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-lg">
                    <div className="flex items-center gap-4">
                        <Smartphone className="w-6 h-6 text-slate-500" />
                        <div>
                            <p className="font-medium text-sm">iPhone 14 Pro - Safari</p>
                            <p className="text-xs text-slate-500">San Francisco, CA • 2 hours ago</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">Revoke</Button>
                </div>
             </div>
             
             <div className="mt-6 text-right">
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Log Out Of All Devices</Button>
             </div>
        </Card>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-fade-in-up">
      <SectionTitle title="Account Settings" subtitle="Manage your profile and preferences" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Sidebar */}
        <div className="md:col-span-4 lg:col-span-3 space-y-6">
          <Card className="p-6 text-center">
            <div className="relative inline-block mb-4 group cursor-pointer" onClick={handleAvatarChange}>
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 mx-auto">
                <img src={avatar} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="font-bold text-xl mb-1">{formData.name}</h3>
            <p className="text-slate-500 text-sm mb-4 capitalize">{user.role.toLowerCase()}</p>
            <div className="flex justify-center">
               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blucell-100 text-blucell-800 dark:bg-blucell-900 dark:text-blucell-200">
                 Member since 2023
               </span>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <NavButton tab="profile" icon={UserIcon} label="Profile" />
                {(user.role === 'FIXER' || user.role === 'ADMIN') && (
                    <NavButton tab="fixer" icon={Briefcase} label="Fixer Dashboard" />
                )}
                <NavButton tab="notifications" icon={Bell} label="Notifications" />
                <NavButton tab="security" icon={Shield} label="Security" />
                <NavButton icon={LogOut} label="Log Out" variant="danger" />
            </div>
          </Card>
        </div>

        {/* Right Content */}
        <div className="md:col-span-8 lg:col-span-9">
            {activeTab === 'profile' && renderProfile()}
            {activeTab === 'fixer' && renderFixerSettings()}
            {activeTab === 'notifications' && renderNotifications()}
            {activeTab === 'security' && renderSecurity()}
        </div>
      </div>
    </div>
  );
};
