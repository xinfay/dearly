import React, { useState, useEffect, useMemo } from 'react';
import { StarRating } from './StarRating';
import { Truck, Shield, Leaf, Award, Check } from 'lucide-react';
import { mockProduct } from '../data/mockProduct';
import { useNavigate } from 'react-router-dom';

export const ProductInfo = ({ product }) => {
  const hasMatrix = !!product?.variantMatrix && Object.keys(product.variantMatrix).length > 0;

  const colorList = useMemo(() => {
    if (!hasMatrix) return product.colors || [];
    return Object.entries(product.variantMatrix)
      .filter(([, data]) => data?.size && Object.keys(data.size).length > 0)
      .map(([name]) => name);
  }, [hasMatrix, product.variantMatrix, product.colors]);

  const [selectedColor, setSelectedColor] = useState('');
  useEffect(() => {
    if (!selectedColor && colorList.length) setSelectedColor(colorList[0]);
  }, [colorList, selectedColor]);

  const sizeOptions = useMemo(() => {
    if (!hasMatrix) return product.sizes || [];
    const sizesObj = product.variantMatrix?.[selectedColor]?.size || {};
    return Object.keys(sizesObj);
  }, [hasMatrix, product, selectedColor]);

  const [selectedSize, setSelectedSize] = useState('');
  useEffect(() => {
    if ((!selectedSize || !sizeOptions.includes(selectedSize)) && sizeOptions.length) {
      setSelectedSize(sizeOptions[0]);
    }
  }, [sizeOptions, selectedSize]);

  const variantId = useMemo(() => {
    if (!hasMatrix) return null;
    return product.variantMatrix?.[selectedColor]?.size?.[selectedSize] ?? null;
  }, [hasMatrix, product, selectedColor, selectedSize]);

  useEffect(() => {
    console.log({
      colorList: Object.keys(product.variantMatrix || {}),
      selectedColor,
      sizeOptions,
      selectedSize,
      variantId,
    });
  }, [product, selectedColor, sizeOptions, selectedSize, variantId]);

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
        color: selectedColor,
        variantId
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Product Name and Rating */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>

        {(() => {
          const reviews = Array.isArray(product.tabs?.reviews)
            ? product.tabs.reviews.filter(Boolean)
            : Array.isArray(product.reviews)
              ? product.reviews.filter(Boolean)
              : [];

          const count = reviews.length;
          const avg = count
            ? reviews.reduce(
                (sum, r) => sum + (typeof r.rating === "number" ? r.rating : Number(r.rating) || 0),
                0
              ) / count
            : 0;

          const hasStarRating = typeof StarRating !== "undefined";
          const FallbackStars = ({ rating }) => {
            const r = Math.max(0, Math.min(5, Math.round(rating || 0)));
            return (
              <span aria-label={`Rating ${r} out of 5`} className="text-sm">
                {"★".repeat(r)}
                {"☆".repeat(5 - r)}
              </span>
            );
          };

          return (
            <div className="flex items-center space-x-2">
              {hasStarRating ? (
                <StarRating rating={avg} showNumber />
              ) : (
                <FallbackStars rating={avg} />
              )}
              <span className="text-sm text-gray-500">
                ({count} {count === 1 ? "review" : "reviews"})
              </span>
            </div>
          );
        })()}
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

      {/* Colors */}
      {hasMatrix && colorList.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Color</h3>
          <div className="flex flex-wrap gap-2">
            {colorList.map((name) => {
              const hex = product.variantMatrix?.[name]?.hex || '#ffffff';
              const selected = selectedColor === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedColor(name)}
                  title={`${name} • ${hex}`}
                  className={`relative h-8 w-8 rounded-lg border transition
                    ${selected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-300 hover:border-gray-400'}`}
                  style={{ backgroundColor: hex }}
                >
                  {selected && (
                    <Check
                      className="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow"
                      strokeWidth={3}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sizes */}
      {sizeOptions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Size</h3>
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((size) => {
              const selected = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition
                    ${selected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

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