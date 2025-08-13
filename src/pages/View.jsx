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
      {/* Make this container the stacking context */}
      <div className="relative min-h-screen overflow-hidden bg-white">
        {/* --- Pastel background layer (ABOVE the white, BELOW content) --- */}
        <div className="pointer-events-none absolute inset-0 z-0">
          {/* top-left rosy */}
          <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-pink-200/40 blur-3xl" />
          {/* center wash */}
          <div className="absolute top-[28%] left-[35%] w-[38%] h-[38%] rounded-full bg-rose-200/30 blur-3xl" />
          {/* bottom-right yellow */}
          <div className="absolute bottom-[-8%] right-[-8%] w-[50%] h-[50%] rounded-full bg-yellow-200/35 blur-3xl" />
        </div>

        {/* --- Main Content (ABOVE the blobs) --- */}
        <main className="relative z-10 w-full px-4 sm:px-6 lg:px-[2%] xl:px-[5%] py-8 mx-auto">
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
              <ProductInfo product={product} />
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
