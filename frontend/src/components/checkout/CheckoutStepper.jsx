import { THEME } from "../../theme/theme";

const STEPS = ["Address", "Order Summary", "Payment"];

export default function CheckoutStepper({ currentStep }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 0,
        marginBottom: 40,
        maxWidth: 560,
        margin: "0 auto 40px",
      }}
    >
      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const active = stepNum === currentStep;
        const done = stepNum < currentStep;

        return (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              flex: i < STEPS.length - 1 ? 1 : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 13,
                  fontFamily: THEME.fontBody,
                  background: done
                    ? THEME.gold
                    : active
                      ? THEME.goldBg
                      : THEME.surface2,
                  color: done
                    ? "#0B0B0C"
                    : active
                      ? THEME.goldDeep
                      : THEME.textMuted,
                  border: `1.5px solid ${done || active ? THEME.gold : THEME.border}`,
                  transition: "all 0.2s",
                }}
              >
                {done ? "✓" : stepNum}
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: active ? 700 : 500,
                  color: active ? THEME.goldDeep : THEME.textMuted,
                  fontFamily: THEME.fontBody,
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: done ? THEME.gold : THEME.border,
                  margin: "0 8px 20px",
                  transition: "background 0.2s",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
