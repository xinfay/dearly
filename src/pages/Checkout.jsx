import React, { useState } from 'react';
import Select from 'react-select';
import { Heart, Lock, Truck, Gift, ArrowLeft, CreditCard, Smartphone, Wallet } from 'lucide-react';
import { useLocation } from "react-router-dom";
import Layout from '../components/Layout';
import { countryOptions, usStateOptions, caStateOptions } from '../data/countryStateCode';
import { mockProduct } from '../data/mockProduct';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import GetPayment from '../components/GetPayment';

console.log("Loaded Stripe key:", import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);


function Checkout() {
  const location = useLocation();
  const itemId = location.state?.itemId;
  const item = mockProduct.find((anItem) => anItem.id === itemId);

  const [currentStep, setCurrentStep] = useState('shipping');
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    country: '',
    city: '',
    state: '',
    zipCode: ''
    // ELSE NEEDED for PRINTFUL FULFILLMENT: variantId, url
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  const paymentMethods = [
    {
      id: 'card',
      type: 'card',
      label: 'Credit or Debit Card',
      icon: <CreditCard className="w-5 h-5" />
    },
    // {
    //   id: 'apple_pay',
    //   type: 'apple_pay',
    //   label: 'Apple Pay',
    //   icon: <Smartphone className="w-5 h-5" />
    // },
    // {
    //   id: 'google_pay',
    //   type: 'google_pay',
    //   label: 'Google Pay',
    //   icon: <Wallet className="w-5 h-5" />
    // }
  ];

  const [shippingErrors, setShippingErrors] = useState({});
  const validateShippingInfo = () => {
    const errors = {};
    if (!shippingInfo.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!shippingInfo.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!shippingInfo.email?.trim()) {
      errors.email = 'Email is required';
    }
    if (!shippingInfo.address?.trim()) {
      errors.address = 'Address is required';
    }
    if (!shippingInfo.city?.trim()) {
      errors.city = 'City is required';
    }
    if (!shippingInfo.state?.trim()) {
      errors.state = 'State is required';
    }
    if (!shippingInfo.zipCode?.trim()) {
      errors.zipCode = 'Zip code is required';
    }

    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const handleInputChange = (field, value) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleContinueToPayment = () => {
    if (validateShippingInfo()) {
      setCurrentStep('payment');
    }
  };

  const handleContinueToReview = async () => {
    if (!submitPayment) return;

    const success = await submitPayment();
    if (success) {
      setCurrentStep('review');
    }
  };

  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [submitPayment, setSubmitPayment] = useState(null);

  const handlePlaceOrder = async () => {
    // Here you would integrate with Stripe
    console.log('Processing order with Stripe...', {
      items: item,
      shipping: shippingInfo,
      paymentMethod: selectedPaymentMethod,
      total: total,
      isGift,
      giftMessage
    });

    console.log("Sending to Printful API");

    try {
      const payload = {
        ...form,
        productId: itemId,
      };
      console.log("Sending payload:", payload);

      const response = await fetch("http://127.0.0.1:8000/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Fetch finished:", response);
      const result = await response.json();
      console.log("✅ Order response:", result);

      // Output the result to alert
      // alert("Order submitted: " + JSON.stringify(result));
    } catch (error) {
      console.error("❌ Error in handleSubmit:", error);
      alert("Failed to submit order.");
    }
  };

  const [quantity, setQuantity] = useState(1); // Initialize quantity
  const incQuantity = () => setQuantity(prev => prev + 1);
  const decQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1)); // Avoid going below 1

  const subtotal = Number(item.price) * quantity;
  // TO BE CHANGED: shipping and tax should be calculated based on the item, amount and location
  const shipping = 8.99;
  const tax = subtotal * 0.13;
  const total = subtotal + shipping + tax;


  const renderProgressSteps = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[
          { id: 'shipping', label: 'Shipping', number: 1 },
          { id: 'payment', label: 'Payment', number: 2 },
          { id: 'review', label: 'Review', number: 3 }
        ].map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step.id 
                  ? 'bg-rose-500 text-white' 
                  : index < ['shipping', 'payment', 'review'].indexOf(currentStep)
                    ? 'bg-rose-200 text-rose-700'
                    : 'bg-gray-200 text-gray-500'
              }`}>
                {step.number}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep === step.id ? 'text-rose-600' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
            </div>
            {index < 2 && (
              <div className={`w-8 h-0.5 ${
                index < ['shipping', 'payment', 'review'].indexOf(currentStep)
                  ? 'bg-rose-200'
                  : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderOrderSummary = () => (
    <div className="bg-rose-50 rounded-2xl p-6 h-fit">
      <h3 className="font-playfair text-xl font-semibold text-gray-900 mb-4">
        Your Heartfelt Creation
      </h3>
      
      {/* STRETCH A CART FUNCTION */}
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

  const renderShippingForm = () => (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-2xl font-semibold text-gray-900 mb-2">
          Where should we send your gift?
        </h2>
        <p className="text-gray-600">
          Every detail matters when it comes to delivering something special.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            value={shippingInfo.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            className={`w-full px-4 py-3 border ${
              shippingErrors.firstName ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent`}
            placeholder="Enter first name"
          />
          {shippingErrors.firstName && (
            <p className="text-red-500 text-sm mt-1">{shippingErrors.firstName}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            value={shippingInfo.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className={`w-full px-4 py-3 border ${
              shippingErrors.lastName ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent`}
            placeholder="Enter last name"
          />
          {shippingErrors.lastName && (
            <p className="text-red-500 text-sm mt-1">{shippingErrors.lastName}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          value={shippingInfo.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-4 py-3 border ${
              shippingErrors.email ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent`}
            placeholder="Enter email address"
          />
          {shippingErrors.email && (
            <p className="text-red-500 text-sm mt-1">{shippingErrors.email}</p>
          )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <input
          type="text"
          value={shippingInfo.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
            className={`w-full px-4 py-3 border ${
              shippingErrors.address ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent`}
            placeholder="Enter address"
          />
          {shippingErrors.address && (
            <p className="text-red-500 text-sm mt-1">{shippingErrors.address}</p>
          )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Country
        </label>
        <select
          value={shippingInfo.country}
          onChange={(e) => {
            handleInputChange('country', e.target.value);
            handleInputChange('state', ''); // Reset state when country changes
          }}
          className={`w-full px-4 py-3 border ${
            shippingErrors.country ? "border-red-500" : "border-gray-300"
          } rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent`}
        >
          <option value="">Select a country</option>
          {countryOptions.map((country) => (
            <option key={country.value} value={country.value}>
              {country.label}
            </option>
          ))}
        </select>
        {shippingErrors.country && (
          <p className="text-red-500 text-sm mt-1">{shippingErrors.country}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            value={shippingInfo.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className={`w-full px-4 py-3 border ${
              shippingErrors.city ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent`}
            placeholder="Enter city"
          />
          {shippingErrors.city && (
            <p className="text-red-500 text-sm mt-1">{shippingErrors.city}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State / Province
          </label>
          <select
            value={shippingInfo.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            disabled={!shippingInfo.country}
            className={`w-full px-4 py-3 border ${
              shippingErrors.state ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent`}
          >
            <option value="">Select a state</option>
            {(shippingInfo.country === "US" ? usStateOptions
              : shippingInfo.country === "CA" ? caStateOptions
              : []
            ).map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
          {shippingErrors.state && (
            <p className="text-red-500 text-sm mt-1">{shippingErrors.state}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ZIP Code
          </label>
          <input
            type="text"
            value={shippingInfo.zipCode}
            onChange={(e) => handleInputChange('zipCode', e.target.value)}
            className={`w-full px-4 py-3 border ${
              shippingErrors.zipCode ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent`}
            placeholder="Enter ZIP code"
          />
          {shippingErrors.zipCode && (
            <p className="text-red-500 text-sm mt-1">{shippingErrors.zipCode}</p>
          )}
        </div>
      </div>

      <div className="bg-rose-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Gift className="w-5 h-5 text-rose-500 mt-0.5" />
          <div className="flex-1">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isGift}
                onChange={(e) => setIsGift(e.target.checked)}
                className="rounded border-gray-300 text-rose-500 focus:ring-rose-500"
              />
              <span className="text-sm font-medium text-gray-700">
                This is a gift
              </span>
            </label>
            {isGift && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gift Message (Optional)
                </label>
                <textarea
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Add a personal message to accompany your gift..."
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleContinueToPayment}
        className="w-full bg-rose-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-rose-600 transition-colors duration-200"
      >
        Continue to Payment
      </button>
    </div>
  );

  const renderPaymentForm = () => (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-2xl font-semibold text-gray-900 mb-2">
          How would you like to pay?
        </h2>
        <p className="text-gray-600">
          Your payment information is secure and encrypted.
        </p>
      </div>

      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <label
            key={method.id}
            className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
              selectedPaymentMethod === method.id
                ? 'border-rose-500 bg-rose-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={selectedPaymentMethod === method.id}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="text-rose-500 focus:ring-rose-500"
            />
            {method.icon}
            <span className="font-medium text-gray-900">{method.label}</span>
          </label>
        ))}
      </div>

      {selectedPaymentMethod === 'card' && (
        <Elements stripe={stripePromise}>
          <GetPayment
            onPaymentComplete={(paymentMethod) => {
              console.log('Payment method created:', paymentMethod.id);
              setIsPaymentComplete(true);
            }}
            setIsPaymentComplete={setIsPaymentComplete}
            setSubmitPayment={setSubmitPayment}
          />
        </Elements>
      )}

      <div className="flex space-x-4">
        <button
          onClick={() => setCurrentStep('shipping')}
          className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          onClick={handleContinueToReview}
          disabled={!isPaymentComplete}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ${
            isPaymentComplete
              ? 'bg-rose-500 text-white hover:bg-rose-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Review Order
        </button>
      </div>
    </div>
  );

  const renderReviewOrder = () => (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-2xl font-semibold text-gray-900 mb-2">
          Almost there! Let's review your order
        </h2>
        <p className="text-gray-600">
          Take a moment to make sure everything looks perfect.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
          <div className="text-sm text-gray-600">
            <p>{shippingInfo.firstName} {shippingInfo.lastName}</p>
            <p>{shippingInfo.address}</p>
            <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
            <p>{shippingInfo.email}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Payment Method</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {paymentMethods.find(m => m.id === selectedPaymentMethod)?.icon}
            <span>{paymentMethods.find(m => m.id === selectedPaymentMethod)?.label}</span>
          </div>
        </div>

        {isGift && giftMessage && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Gift Message</h3>
            <p className="text-sm text-gray-600 italic">"{giftMessage}"</p>
          </div>
        )}
      </div>

      <div className="bg-rose-50 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-sm text-rose-700">
          <Heart className="w-4 h-4" />
          <span>
            Your heartfelt creation will be carefully crafted and shipped with love.
          </span>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setCurrentStep('payment')}
          className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          onClick={handlePlaceOrder}
          className="flex-1 bg-rose-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-rose-600 transition-colors duration-200"
        >
          Place Order - ${total.toFixed(2)}
        </button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'shipping':
        return renderShippingForm();
      case 'payment':
        return renderPaymentForm();
      case 'review':
        return renderReviewOrder();
      default:
        return renderShippingForm();
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderProgressSteps()}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Checkout Form */}
            <div className="lg:col-span-2">
              {renderCurrentStep()}
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              {renderOrderSummary()}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-gray-50 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-sm text-gray-500">
              <p className="mb-2">
                Questions? Contact us at{' '}
                <a href="mailto:support@dearly.com" className="text-rose-500 hover:text-rose-600">
                  support@dearly.com
                </a>
              </p>
              <p>
                Dearly empowers your gift-giving. AI doesn't replace your heart — it just helps you show it better.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  );

};

export default Checkout;
