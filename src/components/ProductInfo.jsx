import React, { useState } from 'react';
import { StarRating } from './StarRating';
import { Truck, Shield, Leaf, Award } from 'lucide-react';
import { mockProduct } from '../data/mockProduct';
import itemsList from '../data/items'
import { useNavigate } from 'react-router-dom';

export const ProductInfo = ({ product }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');

  const getFeatureIcon = (feature) => {
    switch (feature.toLowerCase()) {
      case 'eco-friendly':
        return <Leaf className="w-4 h-4" />;
      case 'premium quality':
        return <Shield className="w-4 h-4" />;
      case 'bestseller':
        return <Award className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const navigate = useNavigate();
  const buildRedirect = () => {
    navigate('/build', {
      state: {
        itemId: product.id,
        size: selectedSize,
        color: selectedColor
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Product Name and Rating */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
        <div className="flex items-center space-x-2">
          <StarRating rating={product.rating} showNumber />
          <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
        </div>
      </div>

      {/* Start Customizing Button */}
      <button
        onClick={() => buildRedirect()}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
      >
        Start Customizing
      </button>

      {/* Technique */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Technique</h3>
        <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
          {product.technique}
        </span>
      </div>

      {/* Color Selector */}
      {product.colors && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Color</h3>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`px-3 py-2 rounded-lg border text-sm transition-all duration-200 ${
                  selectedColor === color
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size Selector */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Size</h3>
        <div className="grid grid-cols-4 gap-2">
          {product.sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                selectedSize === size
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Price and Delivery */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-gray-900">{"C$ " + product.price}</span>
          <div className="flex items-center text-sm text-gray-600">
            <Truck className="w-4 h-4 mr-1" />
            {product.deliveryEstimate} to Canada
          </div>
        </div>
      </div>

      {/* Features/Tags */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Features</h3>
        <div className="flex flex-wrap gap-2">
          {product.features.map((feature) => (
            <span
              key={feature}
              className="inline-flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium"
            >
              {getFeatureIcon(feature)}
              <span>{feature}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <div className="flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};