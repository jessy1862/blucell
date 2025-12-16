
import React from 'react';
import { Card, SectionTitle } from '../components/ui';
import { Users, Target, ShieldCheck, Zap } from 'lucide-react';
import { TeamMember } from '../types';
import { DEFAULT_TEAM } from '../constants';

interface AboutUsProps {
    team?: TeamMember[];
}

export const AboutUs: React.FC<AboutUsProps> = ({ team = DEFAULT_TEAM }) => {
  const stats = [
    { label: 'Repairs Completed', value: '10,000+' },
    { label: 'Happy Customers', value: '50,000+' },
    { label: 'Certified Fixers', value: '150+' },
    { label: 'Years in Business', value: '5' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">Revolutionizing the <br/><span className="text-blucell-500">Tech Lifecycle</span></h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                BLUCELL bridges the gap between premium retail and expert repair, creating a sustainable ecosystem for your devices.
            </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-12 -mt-16 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {stats.map((stat, idx) => (
                <Card key={idx} className="p-6 text-center shadow-xl border-t-4 border-t-blucell-500">
                    <h3 className="text-3xl font-bold text-silver-900 dark:text-white mb-1">{stat.value}</h3>
                    <p className="text-sm text-silver-500 uppercase tracking-wider">{stat.label}</p>
                </Card>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
            <div>
                <SectionTitle title="Our Mission" subtitle="Why we do what we do" />
                <p className="text-silver-600 dark:text-silver-300 text-lg leading-relaxed mb-6">
                    Technology moves fast, but that doesn't mean your devices should be disposable. At BLUCELL, we believe in extending the life of electronics through accessible, high-quality repair services while offering the latest innovations for those ready to upgrade.
                </p>
                <p className="text-silver-600 dark:text-silver-300 text-lg leading-relaxed">
                    Our hybrid model ensures you have support at every stage of your device's journey—from unboxing to fixing cracks, and eventually responsibly recycling.
                </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-silver-100 dark:bg-silver-800 p-6 rounded-2xl">
                    <Target className="w-10 h-10 text-blucell-600 mb-4" />
                    <h4 className="font-bold text-lg mb-2 dark:text-white">Precision</h4>
                    <p className="text-sm text-silver-500">Diagnostics powered by AI and hands skilled by experience.</p>
                </div>
                <div className="bg-silver-100 dark:bg-silver-800 p-6 rounded-2xl">
                    <ShieldCheck className="w-10 h-10 text-blucell-600 mb-4" />
                    <h4 className="font-bold text-lg mb-2 dark:text-white">Trust</h4>
                    <p className="text-sm text-silver-500">Transparent pricing, genuine parts, and solid warranties.</p>
                </div>
                <div className="bg-silver-100 dark:bg-silver-800 p-6 rounded-2xl">
                    <Zap className="w-10 h-10 text-blucell-600 mb-4" />
                    <h4 className="font-bold text-lg mb-2 dark:text-white">Speed</h4>
                    <p className="text-sm text-silver-500">Same-day repairs and fast delivery logistics.</p>
                </div>
                <div className="bg-silver-100 dark:bg-silver-800 p-6 rounded-2xl">
                    <Users className="w-10 h-10 text-blucell-600 mb-4" />
                    <h4 className="font-bold text-lg mb-2 dark:text-white">Community</h4>
                    <p className="text-sm text-silver-500">Connecting local experts with global tech needs.</p>
                </div>
            </div>
        </div>

        <SectionTitle title="Meet the Team" subtitle="The people behind the platform" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {team.map((member, idx) => (
                <div key={idx} className="group text-center">
                    <div className="relative mb-4 overflow-hidden rounded-2xl mx-auto max-w-[250px]">
                        <img 
                            src={member.image} 
                            alt={member.name} 
                            className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500 grayscale group-hover:grayscale-0" 
                        />
                    </div>
                    <h4 className="font-bold text-lg text-silver-900 dark:text-white">{member.name}</h4>
                    <p className="text-blucell-600 text-sm">{member.role}</p>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
