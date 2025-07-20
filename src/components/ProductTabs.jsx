import React, { useState } from 'react';
import { StarRating } from './StarRating';
import { CheckCircle } from 'lucide-react';

export const ProductTabs = ({ product, reviews }) => {
  const [activeTab, setActiveTab] = useState('description');

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'features', label: 'Features' },
    { id: 'fabric', label: 'Fabric Info' },
    { id: 'reviews', label: `Reviews (${product.reviews})` },
    { id: 'disclaimers', label: 'Disclaimers' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-4">
            {product.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        );

      case 'fabric':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(product.fitInfo).map(([key, value]) => (
              <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                <span className="font-medium text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <span className="text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        );

      case 'reviews':
        return (
          <div className="space-y-6">
            {/* Review Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{product.rating}</div>
                  <StarRating rating={product.rating} size="sm" />
                  <div className="text-sm text-gray-500 mt-1">{product.reviews} reviews</div>
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span>Fit:</span>
                      <StarRating rating={4.3} size="sm" showNumber />
                    </div>
                    <div className="flex justify-between">
                      <span>Print Quality:</span>
                      <StarRating rating={4.7} size="sm" showNumber />
                    </div>
                    <div className="flex justify-between">
                      <span>Fabric:</span>
                      <StarRating rating={4.5} size="sm" showNumber />
                    </div>
                    <div className="flex justify-between">
                      <span>Overall:</span>
                      <StarRating rating={4.5} size="sm" showNumber />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{review.author}</span>
                        {review.verified && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <StarRating rating={review.rating} size="sm" />
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{review.content}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'disclaimers':
        return (
          <div className="space-y-3">
            {product.disclaimers.map((disclaimer, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 text-sm">{disclaimer}</p>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mt-12">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-6">{renderTabContent()}</div>
    </div>
  );
};