import React from 'react';
import { ImageGallery } from '../components/ImageGallery';
import { ProductInfo } from '../components/ProductInfo';
import { ProductTabs } from '../components/ProductTabs';
import { mockProduct, mockReviews } from '../data/mockProduct';
import { useLocation } from "react-router-dom";
import Layout from '../components/Layout';


function View() {
  const location = useLocation();

  const index = mockProduct.findIndex((item) => item.id === location.state?.itemId);
  if (!location.state?.itemId || index === -1) {
    return <p className="text-red-600 font-semibold">Error: Item not found.</p>;
  }
  const product = mockProduct[index];

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Main Content */}
        <main className="w-full px-4 sm:px-6 lg:px-[2%] xl:px-[5%] py-8 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Column - Image Gallery (40%) */}
            <div className="lg:col-span-2">
              <ImageGallery 
                images={product.images} 
                productName={product.name}
              />
            </div>

            {/* Right Column - Product Info (60%) */}
            <div className="lg:col-span-3">
              <ProductInfo
                  product={product}
              />
            </div>
          </div>

          {/* Below Fold - Tabs */}
          <ProductTabs product={product} reviews={mockReviews} />
        </main>
      </div>
    </Layout>
  );
}

export default View;