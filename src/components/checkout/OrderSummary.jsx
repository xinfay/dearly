import React from 'react';
import { Truck, Lock } from 'lucide-react';

export default function OrderSummary({ item, quantity, incQuantity, decQuantity, subtotal, shipping, tax, total }) {
  return (
    <div className="bg-rose-50 rounded-2xl p-6 h-fit">
      <h3 className="font-playfair text-xl font-semibold text-gray-900 mb-4">
        Your Heartfelt Creation
      </h3>

      <div key={item.id} className="flex space-x-4 mb-6">
        <img
          src={item.images}
          alt={item.name}
          className="w-16 h-16 rounded-lg object-cover"
        />
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{item.name}</h4>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
            {item.short_description}
          </p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
              <span className="text-sm text-gray-500">Qty: {quantity}</span>
              <div className="flex border border-gray-300 rounded overflow-hidden ml-2">
                <button
                  onClick={decQuantity}
                  className="w-6 h-6 flex items-center justify-center text-gray-700 hover:bg-gray-100"
                >
                  -
                </button>
                <button
                  onClick={incQuantity}
                  className="w-6 h-6 flex items-center justify-center text-gray-700 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
            <span className="font-medium text-gray-900">${(item.price * quantity).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-rose-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-900">${shipping.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="text-gray-900">${tax.toFixed(2)}</span>
        </div>
        <div className="border-t border-rose-200 pt-2 flex justify-between font-semibold">
          <span className="text-gray-900">Total</span>
          <span className="text-gray-900">${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-6 p-4 bg-white rounded-lg border border-rose-200">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Truck className="w-4 h-4" />
          <span>Estimated delivery: 5-7 business days</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
          <Lock className="w-4 h-4" />
          <span>Secure checkout with Stripe</span>
        </div>
      </div>
    </div>
  );
}

function SummaryLine({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}