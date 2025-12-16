
import React, { useState } from 'react';
import { Card, Button, Input, SectionTitle, Badge, StatusIndicator } from '../components/ui';
import { analyzeRepairRequest } from '../services/geminiService';
import { Loader2, Upload, Smartphone, Battery, Cpu, Wifi, X, MessageSquare, Check, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RepairJob, User as UserType } from '../types';

interface RepairBookingProps {
  formatPrice?: (price: number) => string;
  user?: UserType;
  onBookRepair?: (repair: RepairJob) => void;
  fixers?: UserType[];
}

export const RepairBooking: React.FC<RepairBookingProps> = ({ formatPrice = (p) => `$${p}`, user, onBookRepair, fixers = [] }) => {
  const [step, setStep] = useState(1);
  const [device, setDevice] = useState('');
  const [issue, setIssue] = useState('');
  const [images, setImages] = useState<{file: File, preview: string}[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState<string | null>(null);
  const [selectedFixer, setSelectedFixer] = useState<UserType | null>(null);
  const [newRepairId, setNewRepairId] = useState('');
  const navigate = useNavigate();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files) as File[];
      const newImages = newFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
        const newImages = [...prev];
        URL.revokeObjectURL(newImages[index].preview); // Cleanup
        newImages.splice(index, 1);
        return newImages;
    });
  };

  const handleAnalyze = async () => {
    if (!device || !issue) return;
    setIsAnalyzing(true);

    try {
        // Convert images to base64 for the API
        const imageParts = await Promise.all(images.map(async (img) => {
            return new Promise<any>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = (reader.result as string).split(',')[1];
                    resolve({
                        inlineData: {
                            data: base64String,
                            mimeType: img.file.type
                        }
                    });
                };
                reader.onerror = reject;
                reader.readAsDataURL(img.file);
            });
        }));

        const result = await analyzeRepairRequest(device, issue, imageParts);
        setAiDiagnosis(result);
        setStep(2);
    } catch (error) {
        console.error("Analysis failed", error);
        setAiDiagnosis("Could not complete diagnosis. Please proceed with booking.");
        setStep(2);
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleBook = () => {
      const id = `repair-${Date.now()}`;
      setNewRepairId(id);
      
      const newRepair: RepairJob = {
          id: id,
          deviceId: `dev-${Date.now()}`,
          deviceType: device,
          issueDescription: issue,
          status: selectedFixer ? 'DIAGNOSING' : 'PENDING',
          customerId: user ? user.id : 'guest', // In a real app we'd force login
          fixerId: selectedFixer ? selectedFixer.id : undefined,
          dateBooked: new Date().toISOString().split('T')[0],
          aiDiagnosis: aiDiagnosis || undefined,
          estimatedCost: 0 // Placeholder
      };

      if (onBookRepair) {
          onBookRepair(newRepair);
      }

      setStep(4);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-12">
      <SectionTitle 
        title="Fix My Gadget" 
        subtitle="Expert repair service with AI-powered diagnostics" 
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className={`text-center p-3 rounded-lg border transition-all ${step >= 1 ? 'border-blucell-500 bg-blucell-50 dark:bg-blucell-900/20 text-blucell-600' : 'border-slate-200 dark:border-slate-800 text-slate-400'}`}>
            <div className="font-bold text-lg mb-1">01</div>
            <div className="text-xs uppercase tracking-wide">Issue</div>
        </div>
        <div className={`text-center p-3 rounded-lg border transition-all ${step >= 2 ? 'border-blucell-500 bg-blucell-50 dark:bg-blucell-900/20 text-blucell-600' : 'border-slate-200 dark:border-slate-800 text-slate-400'}`}>
            <div className="font-bold text-lg mb-1">02</div>
            <div className="text-xs uppercase tracking-wide">Diagnosis</div>
        </div>
        <div className={`text-center p-3 rounded-lg border transition-all ${step >= 3 ? 'border-blucell-500 bg-blucell-50 dark:bg-blucell-900/20 text-blucell-600' : 'border-slate-200 dark:border-slate-800 text-slate-400'}`}>
            <div className="font-bold text-lg mb-1">03</div>
            <div className="text-xs uppercase tracking-wide">Expert</div>
        </div>
        <div className={`text-center p-3 rounded-lg border transition-all ${step >= 4 ? 'border-blucell-500 bg-blucell-50 dark:bg-blucell-900/20 text-blucell-600' : 'border-slate-200 dark:border-slate-800 text-slate-400'}`}>
            <div className="font-bold text-lg mb-1">04</div>
            <div className="text-xs uppercase tracking-wide">Done</div>
        </div>
      </div>

      {step === 1 && (
        <Card className="p-8 animate-fade-in-up">
          <h3 className="text-xl font-bold mb-6">Describe the Problem</h3>
          <div className="space-y-6">
            <Input 
              label="Device Model" 
              placeholder="e.g. iPhone 14 Pro, MacBook Air M2..." 
              value={device}
              onChange={(e) => setDevice(e.target.value)}
            />
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Issue Description</label>
              <textarea 
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm h-32 focus:outline-none focus:ring-2 focus:ring-blucell-500 text-slate-900 dark:text-white"
                placeholder="Describe what's wrong. e.g. Dropped in water, screen flickering, not charging..."
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Device Images (Optional)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors h-32 text-center">
                    <Upload className="w-6 h-6 text-slate-400 mb-2" />
                    <span className="text-xs text-slate-500 font-medium">Add Photo</span>
                    <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        multiple 
                        onChange={handleImageUpload}
                    />
                </label>
                
                {images.map((img, idx) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 h-32 group bg-slate-100 dark:bg-slate-800">
                        <img src={img.preview} alt="Upload preview" className="w-full h-full object-cover" />
                        <button 
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:opacity-100"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">Upload clear photos of the damage to help our AI diagnose the issue more accurately.</p>
            </div>

            <Button 
                className="w-full" 
                onClick={handleAnalyze} 
                disabled={!device || !issue}
                isLoading={isAnalyzing}
            >
                {isAnalyzing ? 'Analyzing Device & Images...' : 'Run Diagnostics'}
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-fade-in-up">
            <Card className="p-6 border-blucell-500 border-2 bg-blucell-50 dark:bg-blucell-900/20">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blucell-100 dark:bg-blucell-800 rounded-full shrink-0">
                        <Cpu className="w-6 h-6 text-blucell-600 dark:text-blucell-300" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-blucell-900 dark:text-blucell-100 mb-2">AI Diagnosis Report</h4>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {aiDiagnosis}
                        </p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-6 cursor-pointer hover:border-blucell-500 transition-colors" onClick={() => setStep(3)}>
                    <h4 className="font-bold text-lg mb-2">Standard Repair</h4>
                    <p className="text-slate-500 text-sm mb-4">Original parts, 3-5 days turnaround.</p>
                    <div className="flex justify-between items-center mt-4">
                        <span className="font-bold text-xl">{formatPrice(120)} - {formatPrice(150)}</span>
                        <Button size="sm">Select</Button>
                    </div>
                </Card>
                 <Card className="p-6 cursor-pointer hover:border-blucell-500 transition-colors border-2 border-transparent" onClick={() => setStep(3)}>
                    <div className="flex justify-between items-start">
                        <h4 className="font-bold text-lg mb-2">Premium Express</h4>
                        <Badge color="blue">Recommended</Badge>
                    </div>
                    <p className="text-slate-500 text-sm mb-4">Priority handling, 24hr turnaround, extended warranty.</p>
                    <div className="flex justify-between items-center mt-4">
                        <span className="font-bold text-xl">{formatPrice(180)} - {formatPrice(210)}</span>
                        <Button size="sm">Select</Button>
                    </div>
                </Card>
            </div>
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
        </div>
      )}

      {step === 3 && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="flex flex-col md:flex-row justify-between items-end mb-6">
                  <div>
                      <h3 className="text-2xl font-bold">Choose Your Expert</h3>
                      <p className="text-slate-500">Select a verified technician to handle your {device}.</p>
                  </div>
                  <Button variant="ghost" onClick={() => { setSelectedFixer(null); handleBook(); }} className="text-sm">
                      Skip & Assign Randomly
                  </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {fixers.length > 0 ? fixers.map((fixer) => {
                      const isUnavailable = fixer.availabilityStatus === 'OFFLINE' || fixer.availabilityStatus === 'BUSY';
                      return (
                      <Card 
                        key={fixer.id} 
                        className={`p-6 transition-all hover:shadow-lg ${
                            selectedFixer?.id === fixer.id 
                            ? 'border-2 border-blucell-500 bg-blucell-50 dark:bg-blucell-900/10' 
                            : 'border border-slate-200 dark:border-slate-800'
                        } ${isUnavailable ? 'opacity-70 grayscale-[0.5]' : 'cursor-pointer'}`}
                        onClick={() => !isUnavailable && setSelectedFixer(fixer)}
                      >
                          <div className="flex items-center gap-4 mb-4">
                              <img src={fixer.avatar} alt={fixer.name} className="w-14 h-14 rounded-full object-cover bg-slate-200" />
                              <div>
                                  <h4 className="font-bold text-lg">{fixer.name}</h4>
                                  <div className="flex items-center gap-2">
                                      <StatusIndicator status={fixer.availabilityStatus || 'ONLINE'} />
                                  </div>
                              </div>
                          </div>
                          
                          {fixer.bio && (
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 italic">"{fixer.bio}"</p>
                          )}
                          
                          <div className="flex gap-2 mb-4">
                              <Badge color="blue">Certified</Badge>
                              <Badge color="green">98% Success</Badge>
                          </div>

                          <Button 
                            className={`w-full ${selectedFixer?.id === fixer.id ? 'bg-blucell-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                            disabled={isUnavailable}
                          >
                              {selectedFixer?.id === fixer.id ? 'Selected' : isUnavailable ? 'Unavailable' : 'Select Fixer'}
                          </Button>
                      </Card>
                  )}) : (
                      <div className="col-span-full text-center py-12 text-slate-500">
                          <p>No specific fixers available at the moment.</p>
                          <Button variant="outline" onClick={handleBook} className="mt-4">Continue with Auto-Assign</Button>
                      </div>
                  )}
              </div>

              <div className="flex justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                  <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                  <Button onClick={handleBook} disabled={!selectedFixer && fixers.length > 0}>
                      {selectedFixer ? `Confirm & Book with ${selectedFixer.name.split(' ')[0]}` : 'Confirm Booking'}
                  </Button>
              </div>
          </div>
      )}

      {step === 4 && (
        <Card className="p-12 text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Booking Confirmed!</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                A courier has been dispatched to pick up your <strong>{device}</strong>. 
                {selectedFixer 
                    ? <span> You've assigned <strong>{selectedFixer.name}</strong> to your repair.</span> 
                    : " A technician will be assigned shortly."
                }
            </p>
            
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl mb-8 border border-slate-200 dark:border-slate-800 max-w-md mx-auto">
                <div className="flex items-center justify-between mb-4">
                     <p className="font-bold text-sm">Repair ID: {newRepairId}</p>
                    <Button size="sm" onClick={() => navigate(`/dashboard?chatRepairId=${newRepairId}`)}>
                        <MessageSquare className="w-4 h-4 mr-2" /> Chat Now
                    </Button>
                </div>
                <p className="text-xs text-slate-500 text-left">
                    "We've received your ticket for the {device}. You can chat directly with your technician in the dashboard to discuss details."
                </p>
            </div>

            <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
                <Button variant="ghost" onClick={() => navigate('/')}>Back Home</Button>
            </div>
        </Card>
      )}
    </div>
  );
};
