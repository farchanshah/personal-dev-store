import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@devstore/types';
import { formatPrice } from '@devstore/utils/formatters';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ShoppingCart, Star, Clock } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const averageRating = product.reviews?.length
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
    : 0;

  return (
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Product Image */}
      <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl opacity-20">
              {product.type === 'DIGITAL' ? '💾' : 
               product.type === 'SERVICE' ? '⚡' : '📦'}
            </div>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <Badge variant={product.featured ? "destructive" : "secondary"}>
            {product.featured ? 'Featured' : product.type}
          </Badge>
          
          {product.type === 'SERVICE' && product.service?.durationDays && (
            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
              <Clock className="w-3 h-3 mr-1" />
              {product.service.durationDays} days
            </Badge>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full bg-white/90 backdrop-blur-sm shadow-md"
            onClick={() => onAddToCart?.(product)}
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-6">
        {/* Category */}
        {product.category && (
          <div className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-2">
            {product.category}
          </div>
        )}
        
        {/* Title */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-1 hover:text-blue-600 transition-colors">
            {product.title}
          </h3>
        </Link>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>
        
        {/* Rating */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(averageRating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-2">
              ({product.reviews.length})
            </span>
          </div>
        )}
        
        {/* Price & CTA */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-2xl">
              {formatPrice(product.priceCents, product.currency)}
            </span>
            {product.comparePriceCents && (
              <span className="text-gray-400 line-through text-sm ml-2">
                {formatPrice(product.comparePriceCents, product.currency)}
              </span>
            )}
          </div>
          
          <Button
            onClick={() => onAddToCart?.(product)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
          >
            {product.type === 'SERVICE' ? 'Book Now' : 'Add to Cart'}
          </Button>
        </div>
        
        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {product.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}