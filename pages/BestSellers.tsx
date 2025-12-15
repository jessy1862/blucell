import React from 'react';
import { Product } from '../types';
import { Card, Button, Badge, SectionTitle } from '../components/ui';
import { ShoppingCart, Star } from 'lucide-react';

interface BestSellersProps {
    products: Product[];
    addToCart: (product: Product) => void;
    formatPrice: (price: number) => string;
}

export const BestSellers: React.FC<BestSellersProps> = ({ products, addToCart, formatPrice }) => {
    const bestSellers = products.filter(p => p.isBestSeller);

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in">
            <SectionTitle title="Best Sellers" subtitle="Our most popular products loved by customers." />
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {bestSellers.map(product => (
                    <Card key={product.id} className="group overflow-hidden flex flex-col h-full hover:shadow-xl transition-all duration-300 border-silver-200 dark:border-silver-800">
                         <div className="relative aspect-square overflow-hidden bg-silver-100 dark:bg-silver-800">
                            <img src={product.image} alt={product.name} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute top-3 right-3">
                                <Badge color="yellow">Best Seller</Badge>
                            </div>
                            <div className="absolute top-3 left-3">
                                <Badge color="blue">{product.category}</Badge>
                            </div>
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                             <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-silver-900 dark:text-white line-clamp-1">{product.name}</h3>
                                <div className="flex items-center gap-1 text-amber-500 text-sm">
                                    <Star className="w-3 h-3 fill-current" />
                                    <span>{product.rating}</span>
                                </div>
                            </div>
                             <p className="text-silver-500 text-sm mb-4 line-clamp-2 flex-1">{product.description}</p>
                             <div className="flex items-center justify-between mt-auto pt-4 border-t border-silver-100 dark:border-silver-800">
                                <span className="text-xl font-bold text-silver-900 dark:text-white">{formatPrice(product.price)}</span>
                                <Button size="sm" onClick={() => addToCart(product)}>
                                    <ShoppingCart className="w-4 h-4 mr-2" /> Add
                                </Button>
                             </div>
                        </div>
                    </Card>
                ))}
                {bestSellers.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-24 text-silver-500">
                        <Star className="w-16 h-16 mb-4 text-silver-300" />
                        <p className="text-xl font-medium">No best sellers marked yet.</p>
                        <p className="text-sm">Check back later for our top picks!</p>
                    </div>
                )}
             </div>
        </div>
    );
};
