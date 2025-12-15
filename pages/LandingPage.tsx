import React from 'react';
import { Button } from '../components/ui';
import { ChevronRight, Wrench, ShieldCheck, Truck, Cpu, Gamepad2, Smartphone, Camera, Watch, Headphones } from 'lucide-react';
import { LandingPageConfig } from '../types';
import { DEFAULT_LANDING_CONFIG } from '../constants';

interface LandingPageProps {
    config?: LandingPageConfig;
}

export const LandingPage: React.FC<LandingPageProps> = ({ config = DEFAULT_LANDING_CONFIG }) => {
  const { hero, features, trending, ctaBottom } = config;

  const FeatureIcons = [ShieldCheck, Truck, Cpu, Wrench];
  const CategoryIcons = [null, Headphones, Watch, Camera]; // Mapping for trending items if needed, or we just rely on images

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-slate-950 pt-20 pb-20">
        {/* Abstract Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blucell-900 via-slate-950 to-slate-950 opacity-80"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        
        <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight">
              {hero.titlePrefix} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blucell-400 to-blucell-600">{hero.titleHighlight}</span> <br />
              {hero.titleSuffix}
            </h1>
            <p className="text-xl text-slate-300 max-w-lg">
              {hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => window.location.hash = '#/shop'}
                className="text-lg px-8 py-4 rounded-full"
              >
                {hero.ctaPrimary}
              </Button>
              <Button 
                onClick={() => window.location.hash = '#/repair'}
                variant="outline" 
                className="text-lg px-8 py-4 rounded-full border-slate-600 text-white hover:bg-white/10"
              >
                {hero.ctaSecondary}
              </Button>
            </div>
          </div>
          
          <div className="relative hidden lg:block h-[600px] w-full">
             {/* Background Image (PS5 in mock) */}
             <div className="absolute top-16 right-0 w-80 h-[28rem] rounded-2xl overflow-hidden shadow-2xl border border-slate-700 transform rotate-6 hover:rotate-2 transition-all duration-500 z-10 group bg-slate-900">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 opacity-80"></div>
                <img 
                    src={hero.imageBackground} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                    alt="Background Device" 
                />
                <div className="absolute bottom-6 left-6 z-20">
                    <div className="flex items-center gap-2 mb-1 text-blucell-400">
                        <Gamepad2 className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Gaming</span>
                    </div>
                    <span className="text-white font-bold text-xl leading-tight block">Next-Gen <br/>Consoles</span>
                </div>
             </div>

             {/* Foreground Image (Phone in mock) */}
             <div className="absolute top-8 left-8 w-72 h-[30rem] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-900 transform -rotate-6 hover:-rotate-2 transition-all duration-500 z-20 group hover:shadow-blucell-500/20">
                 <img 
                    src={hero.imageForeground} 
                    className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity" 
                    alt="Foreground Device" 
                />
                {/* Simulated Notch/Dynamic Island */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-30"></div>
                
                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                    <div className="flex items-center gap-2 mb-1 text-blucell-400">
                        <Smartphone className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Mobile</span>
                    </div>
                    <p className="text-white font-bold text-2xl">Premium <br/>Devices</p>
                </div>
             </div>
             
             {/* Floating Repair Badge */}
             <div className="absolute bottom-24 right-20 bg-slate-900/90 backdrop-blur-md p-4 pr-6 rounded-2xl shadow-xl z-30 flex items-center gap-4 border border-slate-700 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-default">
                <div className="p-3 bg-blucell-600 rounded-xl shadow-lg shadow-blucell-600/20">
                    <Wrench className="w-6 h-6 text-white" />
                </div>
                <div>
                    <p className="font-bold text-base text-white">Expert Repair</p>
                    <p className="text-xs text-slate-400 mt-0.5">Diagnose & Fix Instantly</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900 relative z-10">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Why Choose BLUCELL?</h2>
                <p className="text-slate-500 dark:text-slate-400">The most trusted name in consumer electronics lifecycle.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, idx) => {
                    const Icon = FeatureIcons[idx] || ShieldCheck;
                    return (
                        <div key={idx} className="p-6 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-shadow">
                            <Icon className="w-10 h-10 text-blucell-600 mb-4" />
                            <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{feature.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
                        </div>
                    );
                })}
            </div>
        </div>
      </section>

      {/* Trending Gear Gallery */}
      <section className="py-24 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">{trending.sectionTitle}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg">{trending.sectionSubtitle}</p>
            </div>
            <Button variant="outline" onClick={() => window.location.hash = '#/shop'} className="hidden md:flex items-center">
              View All <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-[800px] md:h-[600px]">
              {/* Large Hero Item (Item 0) */}
              <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-3xl cursor-pointer shadow-lg">
                  <img 
                    src={trending.items[0]?.image} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt={trending.items[0]?.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-8 flex flex-col justify-end">
                      {trending.items[0]?.badge && (
                          <div className="bg-blucell-600 w-fit px-3 py-1 rounded-full text-xs font-bold text-white mb-2">{trending.items[0].badge}</div>
                      )}
                      <h3 className="text-white text-3xl font-bold mb-1">{trending.items[0]?.title}</h3>
                      <p className="text-slate-300">{trending.items[0]?.description}</p>
                  </div>
              </div>
              
              {/* Top Right Item (Item 1) */}
              <div className="md:col-span-2 relative group overflow-hidden rounded-3xl cursor-pointer shadow-lg bg-slate-100 dark:bg-slate-900">
                  <img 
                    src={trending.items[1]?.image} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={trending.items[1]?.title}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="flex items-center gap-2 text-white">
                        <Headphones className="w-5 h-5" />
                        <h3 className="font-bold text-xl">{trending.items[1]?.title}</h3>
                      </div>
                  </div>
              </div>

              {/* Bottom Left Small (Item 2) */}
              <div className="relative group overflow-hidden rounded-3xl cursor-pointer shadow-lg bg-slate-100 dark:bg-slate-900">
                  <img 
                    src={trending.items[2]?.image} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt={trending.items[2]?.title}
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0">
                        <Watch className="w-8 h-8 text-white mx-auto mb-2" />
                        <span className="text-white font-bold">{trending.items[2]?.title}</span>
                    </div>
                  </div>
              </div>

              {/* Bottom Right Small (Item 3) */}
              <div className="relative group overflow-hidden rounded-3xl cursor-pointer shadow-lg bg-slate-100 dark:bg-slate-900">
                  <img 
                    src={trending.items[3]?.image} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt={trending.items[3]?.title}
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0">
                        <Camera className="w-8 h-8 text-white mx-auto mb-2" />
                        <span className="text-white font-bold">{trending.items[3]?.title}</span>
                    </div>
                  </div>
              </div>
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" onClick={() => window.location.hash = '#/shop'} className="w-full">View All Categories</Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blucell-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blucell-500 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blucell-800 rounded-full blur-3xl opacity-50"></div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl font-bold text-white mb-6">{ctaBottom.title}</h2>
            <p className="text-blucell-100 text-lg mb-8 max-w-2xl mx-auto">{ctaBottom.description}</p>
            <Button className="bg-white text-blucell-700 hover:bg-blucell-50 px-8 py-3 text-lg rounded-full shadow-xl" onClick={() => window.location.hash = '#/auth'}>
                {ctaBottom.buttonText}
            </Button>
        </div>
      </section>
    </div>
  );
};
