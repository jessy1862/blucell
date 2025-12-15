import React from 'react';
import { CartItem } from '../types';
import { Button } from './ui';
import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  formatPrice: (price: number) => string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, cart, updateQuantity, removeItem, formatPrice }) => {
  const navigate = useNavigate();
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-silver-surface-light dark:bg-silver-surface-dark shadow-2xl h-full flex flex-col animate-slide-in-right">
        <div className="p-5 border-b border-silver-100 dark:border-silver-800 flex justify-between items-center bg-silver-50/50 dark:bg-silver-900/50 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blucell-600" />
            <h2 className="font-bold text-lg text-silver-900 dark:text-white">Your Cart ({cart.length})</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-silver-100 dark:hover:bg-silver-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-silver-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                <ShoppingBag className="w-16 h-16 text-silver-300" />
                <p className="text-lg font-medium text-silver-500">Your cart is empty</p>
                <Button variant="outline" onClick={onClose}>Start Shopping</Button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-4 animate-fade-in-up">
                <div className="w-20 h-20 rounded-lg bg-silver-100 dark:bg-silver-800 overflow-hidden shrink-0 border border-silver-200 dark:border-silver-700">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-silver-900 dark:text-white line-clamp-1">{item.name}</h3>
                    <p className="text-sm text-silver-500">{item.category}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3 bg-silver-50 dark:bg-silver-800 rounded-lg p-1">
                        <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 hover:bg-white dark:hover:bg-silver-700 rounded shadow-sm disabled:opacity-50 text-silver-600 dark:text-silver-300"
                            disabled={item.quantity <= 1}
                        >
                            <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center text-silver-900 dark:text-white">{item.quantity}</span>
                        <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 hover:bg-white dark:hover:bg-silver-700 rounded shadow-sm text-silver-600 dark:text-silver-300"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-silver-900 dark:text-white">{formatPrice(item.price * item.quantity)}</p>
                        <button onClick={() => removeItem(item.id)} className="text-xs text-red-500 hover:text-red-600 underline decoration-dotted">Remove</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 bg-silver-50 dark:bg-silver-800/50 border-t border-silver-200 dark:border-silver-800 space-y-4">
            <div className="space-y-2 text-sm">
                <div className="flex justify-between text-silver-500">
                    <span>Subtotal</span>
                    <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-silver-500">
                    <span>Shipping</span>
                    <span>Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-silver-900 dark:text-white pt-2 border-t border-silver-200 dark:border-silver-700">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                </div>
            </div>
            <Button className="w-full py-4 text-lg shadow-blucell-500/25" onClick={() => { onClose(); navigate('/checkout'); }}>
                Checkout Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};