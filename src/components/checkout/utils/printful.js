export function buildPrintfulPayload(shippingInfo, itemId, quantity) {
  return {
    name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
    address: shippingInfo.address,
    quantity: quantity,
    variantId: parseInt(shippingInfo.variantId),
    city: shippingInfo.city,
    statecode: shippingInfo.state,
    countrycode: shippingInfo.country,
    zip: shippingInfo.zipCode,
    url: shippingInfo.url,
    productId: itemId,
  };
}