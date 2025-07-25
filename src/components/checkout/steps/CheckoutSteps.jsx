import React from 'react';
import { Gift, ArrowLeft, Heart } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import GetPayment from '../../GetPayment';
import { countryOptions, usStateOptions, caStateOptions } from '../../../data/countryStateCode';

export default function CheckoutSteps({
  currentStep,
  shippingInfo,
  shippingErrors,
  handleInputChange,
  handleContinueToPayment,
  handleContinueToReview,
  handlePlaceOrder,
  quantity,
  incQuantity,
  decQuantity,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  isGift,
  setIsGift,
  giftMessage,
  setGiftMessage,
  isPaymentComplete,
  setIsPaymentComplete,
  setSubmitPayment,
  stripePromise,
  item,
  total,
  setCurrentStep,
  paymentMethods
}) {
  switch (currentStep) {
    case 'shipping':
      return <ShippingForm />;
    case 'payment':
      return <PaymentForm />;
    case 'review':
      return <ReviewForm />;
    default:
      return <ShippingForm />;
  }

  function ShippingForm() {
    return (
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
  );}

  function PaymentForm() {
    return (
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
                <method.icon className="w-5 h-5" />
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
  }

  function ReviewForm() {
    return (
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


        {/* TO BE CHANGED: this is a test form for Printful fulfillment */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Printful Variant ID (test)
            </label>
            <input
                type="text"
                value={shippingInfo.variantId}
                onChange={(e) => handleInputChange('variantId', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="eg. 22755"
            />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL (test)
            </label>
            <input
                type="text"
                value={shippingInfo.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="https://..."
            />
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
  }
}