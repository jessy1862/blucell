import React, { useState } from 'react';
import { Card, Button, Badge, Input, SectionTitle } from '../components/ui';
import { ShoppingCart, Star, Eye, X, ArrowUpDown, Search } from 'lucide-react';
import { Product } from '../types';

interface MarketplaceProps {
    addToCart: (product: Product) => void;
    products: Product[];
    formatPrice: (price: number) => string;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ addToCart, products, formatPrice }) => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'priceLow' | 'priceHigh' | 'rating'>('featured');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categories = ['All', 'Phone', 'Laptop', 'Audio', 'Camera', 'Gaming', 'Drone', 'Others'];

  const filteredProducts = products.filter(p => 
    (filter === 'All' || p.category === filter) && 
    p.name.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    switch (sortBy) {
        case 'priceLow': return a.price - b.price;
        case 'priceHigh': return b.price - a.price;
        case 'rating': return b.rating - a.rating;
        default: return 0; // Featured/Default order
    }
  });

  const QuickViewModal = () => {
    if (!selectedProduct) return null;
    const product = selectedProduct;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
                onClick={() => setSelectedProduct(null)}
            ></div>
             <div className="relative bg-silver-surface-light dark:bg-silver-surface-dark rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden animate-scale-up flex flex-col md:flex-row border border-silver-200 dark:border-silver-800">
                <button 
                    onClick={() => setSelectedProduct(null)} 
                    className="absolute top-4 right-4 p-2 bg-silver-100 dark:bg-silver-800 rounded-full hover:bg-silver-200 dark:hover:bg-silver-700 z-10 transition-colors"
                >
                    <X className="w-5 h-5 text-silver-500" />
                </button>
                
                <div className="md:w-1/2 bg-silver-50 dark:bg-silver-800/50 p-8 flex items-center justify-center border-r border-silver-100 dark:border-silver-800">
                    <img src={product.image} alt={product.name} className="max-h-[300px] w-auto object-contain drop-shadow-2xl" />
                </div>

                <div className="md:w-1/2 p-8 flex flex-col max-h-[90vh] overflow-y-auto">
                     <div className="mb-6">
                        <div className="flex justify-between items-start mb-2">
                             <Badge color="blue">{product.category}</Badge>
                             <div className="flex items-center gap-1 text-amber-500 text-sm font-medium bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                                <Star className="w-3 h-3 fill-current" />
                                <span>{product.rating}</span>
                                <span className="text-silver-400 font-normal">({product.reviews})</span>
                             </div>
                        </div>
                        <h2 className="text-3xl font-bold text-silver-900 dark:text-white mb-2 leading-tight">{product.name}</h2>
                        <div className="text-2xl font-bold text-blucell-600">{formatPrice(product.price)}</div>
                     </div>

                     <p className="text-silver-600 dark:text-silver-400 mb-8 leading-relaxed text-sm">
                        {product.description}
                     </p>

                     <div className="space-y-4 mb-8 bg-silver-50 dark:bg-silver-800/50 p-4 rounded-xl border border-silver-100 dark:border-silver-800">
                        <h4 className="font-semibold text-xs uppercase tracking-wider text-silver-500">Technical Specifications</h4>
                        <div className="grid grid-cols-1 gap-y-2">
                            {Object.entries(product.specs).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-sm">
                                    <span className="capitalize text-silver-500">{key}</span>
                                    <span className="font-medium text-silver-900 dark:text-white">{value}</span>
                                </div>
                            ))}
                        </div>
                     </div>

                     <div className="mt-auto pt-4 flex gap-3">
                        <Button 
                            className="flex-1 py-3 text-base shadow-blucell-500/20" 
                            onClick={() => { addToCart(product); setSelectedProduct(null); }}
                        >
                            <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
                        </Button>
                        <Button variant="outline" className="px-4" title="Save for later">
                            <Star className="w-5 h-5" />
                        </Button>
                     </div>
                </div>
             </div>
        </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <SectionTitle title="Shop Gadgets" subtitle="Curated tech for the modern professional" />
      
      <div className="flex flex-col lg:flex-row gap-6 mb-8 items-start lg:items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto no-scrollbar">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                        filter === cat 
                        ? 'bg-blucell-600 text-white shadow-lg shadow-blucell-500/30' 
                        : 'bg-silver-surface-light dark:bg-silver-surface-dark text-silver-600 dark:text-silver-300 border border-silver-200 dark:border-silver-700 hover:bg-silver-50 dark:hover:bg-silver-800'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>
        
        <div className="flex gap-4 w-full lg:w-auto">
             <div className="relative">
                <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="appearance-none w-full md:w-40 bg-white dark:bg-silver-950 border border-silver-300 dark:border-silver-700 rounded-lg px-4 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-blucell-500 text-silver-900 dark:text-silver-100"
                >
                    <option value="featured">Featured</option>
                    <option value="priceLow">Price: Low to High</option>
                    <option value="priceHigh">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-400 pointer-events-none" />
            </div>
            
            <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-400" />
                <Input 
                    placeholder="Search products..." 
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
            <Card key={product.id} className="group overflow-hidden flex flex-col h-full hover:shadow-xl transition-all duration-300 border-silver-200 dark:border-silver-800">
                <div className="relative aspect-square overflow-hidden bg-silver-100 dark:bg-silver-800">
                    <img 
                        src={product.image} 
                        alt={product.name} 
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                        <Badge color="blue">{product.category}</Badge>
                    </div>
                    {product.isBestSeller && (
                        <div className="absolute top-3 left-3">
                            <Badge color="yellow">Best Seller</Badge>
                        </div>
                    )}
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
                        <div className="flex items-center gap-2">
                            <Button 
                                size="sm" 
                                variant="secondary"
                                className="rounded-full w-10 h-10 p-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                onClick={() => setSelectedProduct(product)}
                                title="Quick View"
                            >
                                <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                                size="sm" 
                                className="rounded-full w-10 h-10 p-0 flex items-center justify-center hover:bg-blucell-700 shadow-lg shadow-blucell-500/20"
                                onClick={() => addToCart(product)}
                                title="Add to Cart"
                            >
                                <ShoppingCart className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        ))}
      </div>
      
      <QuickViewModal />
    </div>
  );
};