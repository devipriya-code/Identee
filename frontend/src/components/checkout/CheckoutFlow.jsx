import { useState } from "react";
import { THEME } from "../../theme/theme";
import CheckoutStepper from "./CheckoutStepper";
import AddressStep from "./AddressStep";
import OrderSummaryStep from "./OrderSummaryStep";
import PaymentStep from "./PaymentStep";

// items/buyNow are optional overrides for the "Buy Now" flow.
// Leave both undefined for normal cart checkout (falls back to redux cart).
export default function CheckoutFlow({ items, buyNow }) {
  const [step, setStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [coupon, setCoupon] = useState(null);

  return (
    <div
      style={{ minHeight: "100vh", background: THEME.bg, padding: "48px 20px" }}
    >
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <CheckoutStepper currentStep={step} />

        {step === 1 && (
          <AddressStep
            selectedAddress={shippingAddress}
            onContinue={(addr) => {
              setShippingAddress(addr);
              setStep(2);
            }}
          />
        )}

        {step === 2 && (
          <OrderSummaryStep
            items={items}
            shippingAddress={shippingAddress}
            onChangeAddress={() => setStep(1)}
            coupon={coupon}
            setCoupon={setCoupon}
            onBack={() => setStep(1)}
            onContinue={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <PaymentStep
            items={items}
            buyNow={buyNow}
            shippingAddress={shippingAddress}
            coupon={coupon}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </div>
  );
}
