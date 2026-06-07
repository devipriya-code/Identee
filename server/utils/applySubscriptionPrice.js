export const applySubscriptionPrice = (productDoc, user) => {
  // Convert mongoose document → plain object
  const product = productDoc.toObject
    ? productDoc.toObject()
    : productDoc;

  const basePrice = Number(product.price);

  // Default response (non-subscriber)
  const response = {
    ...product,
    originalPrice: basePrice,
    subscriptionPrice: basePrice,
    subscriptionDiscountPercent: 0,
    isSubscriptionApplied: false,
  };

  // No valid subscription
  if (
    !user ||
    !user.isSubscribed ||
    !user.subscription ||
    !user.subscription.isActive
  ) {
    return response;
  }

  const { startDate, endDate, discountPercent } = user.subscription;
  const now = new Date();

  // Subscription expired or not started
  if (now < new Date(startDate) || now > new Date(endDate)) {
    return response;
  }

  const discount = Number(discountPercent);

  if (discount <= 0) {
    return response;
  }

  // Apply discount safely
  const discountedPrice = Math.round(
    basePrice - (basePrice * discount) / 100
  );

  return {
    ...response,
    subscriptionPrice: discountedPrice,
    subscriptionDiscountPercent: discount,
    isSubscriptionApplied: true,
  };
};