import React, { useState } from 'react';

export const ImageGallery = ({ images, productName }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="flex space-x-4">
      {/* Thumbnail Column */}
      <div className="flex flex-col space-y-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
              selectedImage === index
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <img
              src={image}
              alt={`${productName} view ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="flex-1">
        <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-200">
          <img
            src={images[selectedImage]}
            alt={productName}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};