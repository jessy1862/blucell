import React, { useState } from 'react';
import { CartItem, Order } from '../types';
import { Card, Button, Input, SectionTitle } from '../components/ui';
import { ShieldCheck, CreditCard, Truck, Check, Wallet, Bitcoin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CheckoutProps {
  cart: CartItem[];
  clearCart: () => void;
  formatPrice: (price: number) => string;
  onPlaceOrder?: (order: Order) => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ cart, clearCart, formatPrice, onPlaceOrder }) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'crypto'>('card');
  const [newOrderId, setNewOrderId] = useState('');
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Mock payment
    
    const id = `ord-${Math.floor(Math.random() * 10000)}`;
    setNewOrderId(id);

    if (onPlaceOrder) {
        const order: Order = {
            id: id,
            date: new Date().toISOString().split('T')[0],
            total: total * 1.08, // Adding simplified tax
            status: 'PROCESSING',
            items: cart.map(item => ({
                productName: item.name,
                quantity: item.quantity,
                image: item.image
            }))
        };
        onPlaceOrder(order);
    }

    clearCart();
    setIsProcessing(false);
    setStep(3); // Success
  };

  if (cart.length === 0 && step !== 3) {
      return (
          <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
              <Button onClick={() => navigate('/shop')}>Go Shopping</Button>
          </div>
      )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      {step === 3 ? (
         <Card className="max-w-xl mx-auto p-12 text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Order Confirmed!</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
                Thank you for your purchase. Your order #{newOrderId} has been placed successfully.
            </p>
            <Button onClick={() => navigate('/dashboard')}>Track Order</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
                <SectionTitle title="Checkout" subtitle="Complete your purchase securely" />
                
                {/* Steps */}
                <div className="flex items-center gap-4 mb-8">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blucell-600 font-bold' : 'text-slate-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-blucell-600 bg-blucell-50' : 'border-slate-300'}`}>1</div>
                        <span>Shipping</span>
                    </div>
                    <div className="w-12 h-0.5 bg-slate-200"></div>
                     <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blucell-600 font-bold' : 'text-slate-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-blucell-600 bg-blucell-50' : 'border-slate-300'}`}>2</div>
                        <span>Payment</span>
                    </div>
                </div>

                {step === 1 && (
                    <Card className="p-8 animate-fade-in-up">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-blucell-600" /> Shipping Details
                        </h3>
                        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                            <Input label="First Name" required />
                            <Input label="Last Name" required />
                            <Input label="Street Address" className="md:col-span-2" required />
                            <Input label="City" required />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="State" required />
                                <Input label="Zip Code" required />
                            </div>
                            <div className="md:col-span-2 pt-4 flex justify-end">
                                <Button type="submit">Continue to Payment</Button>
                            </div>
                        </form>
                    </Card>
                )}

                {step === 2 && (
                     <Card className="p-8 animate-fade-in-up">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-blucell-600" /> Payment Method
                        </h3>
                        
                        <div className="mb-8 grid grid-cols-3 gap-4">
                            <button 
                                onClick={() => setPaymentMethod('card')}
                                className={`py-4 px-2 border-2 rounded-xl font-medium flex flex-col items-center justify-center gap-3 transition-all ${
                                    paymentMethod === 'card' 
                                    ? 'border-blucell-600 bg-blucell-50 text-blucell-700 dark:bg-blucell-900/20 dark:text-blucell-300' 
                                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                <CreditCard className="w-6 h-6" /> 
                                <span className="text-sm">Card</span>
                            </button>
                             <button 
                                onClick={() => setPaymentMethod('paypal')}
                                className={`py-4 px-2 border-2 rounded-xl font-medium flex flex-col items-center justify-center gap-3 transition-all ${
                                    paymentMethod === 'paypal' 
                                    ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                <Wallet className="w-6 h-6" /> 
                                <span className="text-sm">PayPal</span>
                            </button>
                            <button 
                                onClick={() => setPaymentMethod('crypto')}
                                className={`py-4 px-2 border-2 rounded-xl font-medium flex flex-col items-center justify-center gap-3 transition-all ${
                                    paymentMethod === 'crypto' 
                                    ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300' 
                                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                <Bitcoin className="w-6 h-6" /> 
                                <span className="text-sm">Crypto</span>
                            </button>
                        </div>

                        {paymentMethod === 'card' && (
                            <form className="space-y-6 animate-fade-in" onSubmit={handlePayment}>
                                <Input label="Card Number" placeholder="0000 0000 0000 0000" required />
                                <div className="grid grid-cols-2 gap-6">
                                    <Input label="Expiry Date" placeholder="MM/YY" required />
                                    <Input label="CVC" placeholder="123" required />
                                </div>
                                <Input label="Cardholder Name" placeholder="Full Name on Card" required />
                                
                                <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                    <ShieldCheck className="w-4 h-4 text-green-600" />
                                    Your payment information is encrypted and secure.
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button variant="ghost" onClick={() => setStep(1)} type="button">Back</Button>
                                    <Button type="submit" className="flex-1" isLoading={isProcessing}>
                                        Pay {formatPrice(total * 1.08)}
                                    </Button>
                                </div>
                            </form>
                        )}

                        {paymentMethod === 'paypal' && (
                             <div className="text-center space-y-6 py-8 animate-fade-in">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                                    <Wallet className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="max-w-xs mx-auto">
                                    <h4 className="font-bold text-lg mb-2">Pay with PayPal</h4>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">You will be redirected to PayPal's secure portal to complete your purchase.</p>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <Button variant="ghost" onClick={() => setStep(1)} type="button">Back</Button>
                                    <Button onClick={handlePayment} className="flex-1 bg-[#0070BA] hover:bg-[#003087] text-white" isLoading={isProcessing}>
                                        Proceed to PayPal
                                    </Button>
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'crypto' && (
                             <div className="text-center space-y-6 py-8 animate-fade-in">
                                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto">
                                    <Bitcoin className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div className="max-w-xs mx-auto">
                                    <h4 className="font-bold text-lg mb-2">Pay with Crypto</h4>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">We accept Bitcoin, Ethereum, and USDC via Coinbase Commerce.</p>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <Button variant="ghost" onClick={() => setStep(1)} type="button">Back</Button>
                                    <Button onClick={handlePayment} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200" isLoading={isProcessing}>
                                        Pay with Crypto
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-4 space-y-6">
                <Card className="p-6 sticky top-24">
                    <h3 className="font-bold text-lg mb-4">Order Summary</h3>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto mb-4 pr-2">
                        {cart.map(item => (
                            <div key={item.id} className="flex gap-3">
                                <img src={item.image} alt="" className="w-12 h-12 rounded bg-slate-100 object-cover" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                                    <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                </div>
                                <p className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2 text-sm border-t border-slate-100 dark:border-slate-800 pt-4">
                         <div className="flex justify-between text-slate-500">
                            <span>Subtotal</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                         <div className="flex justify-between text-slate-500">
                            <span>Tax (Est.)</span>
                            <span>{formatPrice(total * 0.08)}</span>
                        </div>
                         <div className="flex justify-between text-slate-500">
                            <span>Shipping</span>
                            <span className="text-green-600">Free</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                            <span>Total</span>
                            <span>{formatPrice(total * 1.08)}</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
      )}
    </div>
  );
};