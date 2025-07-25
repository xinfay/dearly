import React, { useState } from 'react';
import { mockProduct } from '../../../data/mockProduct';
import { buildPrintfulPayload } from '../utils/printful';

export function useCheckout(itemId) {
  const item = mockProduct.find(i => i.id === itemId);

  const [currentStep, setCurrentStep] = useState('shipping');
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    country: '',
    city: '',
    state: '',
    zipCode: '',
    // ELSE NEEDED for PRINTFUL FULFILLMENT: variantId, url
    variantId: '22755',    // remove later
    url: 'https://static.wikia.nocookie.net/cartoons/images/e/ed/Profile_-_SpongeBob_SquarePants.png/revision/latest?cb=20240420115914',          // remove later
  });

  const [shippingErrors, setShippingErrors] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [orderStatus, setOrderStatus] = useState(null);  // 'success' | 'error' | null
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [submitPayment, setSubmitPayment] = useState(null);

  // TO BE CHANGED: shipping and tax should be calculated based on the item, amount and location
  const shipping = 8.99;
  const subtotal = Number(item?.price || 0) * quantity;
  const tax = subtotal * 0.13;
  const total = subtotal + shipping + tax;

  const handleInputChange = (field, value) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateShippingInfo = () => {
    const errors = {};
    if (!shippingInfo.firstName?.trim()) errors.firstName = 'First name is required';
    if (!shippingInfo.lastName?.trim()) errors.lastName = 'Last name is required';
    if (!shippingInfo.email?.trim()) errors.email = 'Email is required';
    if (!shippingInfo.address?.trim()) errors.address = 'Address is required';
    if (!shippingInfo.city?.trim()) errors.city = 'City is required';
    if (!shippingInfo.state?.trim()) errors.state = 'State is required';
    if (!shippingInfo.zipCode?.trim()) errors.zipCode = 'Zip code is required';

    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinueToPayment = () => {
    if (validateShippingInfo()) {
      setCurrentStep('payment');
    }
  };

  const handleContinueToReview = async () => {
    if (!submitPayment) return;
    const success = await submitPayment();
    if (success) setCurrentStep('review');
  };

  const incQuantity = () => setQuantity(prev => prev + 1);
  const decQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handlePlaceOrder = async () => {
    const payload = {
      name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
      address: shippingInfo.address,
      quantity: quantity || 1,
      variantId: parseInt(shippingInfo.variantId),
      city: shippingInfo.city,
      statecode: shippingInfo.state,
      countrycode: shippingInfo.country,
      zip: shippingInfo.zipCode,
      url: shippingInfo.url,
      productId: itemId,
    };

    try {
      const payload = buildPrintfulPayload(shippingInfo, itemId, quantity);
      console.log("Sending payload:", payload);

      const response = await fetch("http://127.0.0.1:8000/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("✅ Order response:", result);
      if (result.code === 200) {
        setOrderStatus('success');
      } else {
        setOrderStatus('error');
      }
    } catch (error) {
      console.error("❌ Error in handlePlaceOrder:", error);
      setOrderStatus('error');
    }
  };

  return {
    item,
    currentStep,
    setCurrentStep,
    shippingInfo,
    handleInputChange,
    shippingErrors,
    validateShippingInfo,
    handleContinueToPayment,
    handleContinueToReview,
    quantity,
    incQuantity,
    decQuantity,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    isGift,
    setIsGift,
    giftMessage,
    setGiftMessage,
    orderStatus,
    setOrderStatus,
    isPaymentComplete,
    setIsPaymentComplete,
    submitPayment,
    setSubmitPayment,
    subtotal,
    shipping,
    tax,
    total,
    handlePlaceOrder,
  };
}
