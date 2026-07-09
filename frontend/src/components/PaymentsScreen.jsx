/**
 * PaymentsScreen.jsx — UPI / QR Payments setup screen.
 */
const STEPS = [
  { icon: "download",      title: "Download a UPI App",      desc: "PhonePe, Google Pay, Paytm, or BHIM — any works." },
  { icon: "badge",         title: "Register as Merchant",    desc: "Use your Aadhaar and bank account to register." },
  { icon: "qr_code_2",     title: "Generate Your QR Code",   desc: "Print and laminate it — display it at your stall." },
  { icon: "campaign",      title: "Promote to Customers",    desc: "Put a sign: 'Pay by UPI and get ₹5 cashback today!'" },
];

export default function PaymentsScreen() {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
      <div>
        <h2 className="font-headline-lg-mobile md:text-headline-lg text-on-background font-bold">UPI Payments Setup</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Accept digital payments in 4 simple steps — no smartphone required.
        </p>
      </div>

      {/* QR demo card */}
      <div className="md-card p-md flex items-center gap-md">
        <div className="w-24 h-24 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0 border border-outline-variant">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: "56px" }}>qr_code_2</span>
        </div>
        <div>
          <h3 className="font-label-lg text-label-lg text-on-surface">Your Merchant QR</h3>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-1 leading-relaxed">
            Once registered, your unique QR code will appear here. Customers scan it to pay you instantly.
          </p>
          <button className="mt-3 btn-filled text-sm px-5 py-2">Set Up Now</button>
        </div>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-3">
        <h3 className="font-headline-md text-headline-md-mobile text-on-background">How to Get Started</h3>
        {STEPS.map((step, i) => (
          <div key={step.title} className="md-card p-sm flex items-start gap-sm">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-on-primary font-bold text-sm">{i + 1}</span>
            </div>
            <div className="flex-1">
              <h4 className="font-label-lg text-label-lg text-on-surface">{step.title}</h4>
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5 leading-relaxed">{step.desc}</p>
            </div>
            <span className="material-symbols-outlined text-primary flex-shrink-0"
                  style={{ fontVariationSettings: "'FILL' 1" }}>{step.icon}</span>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-sm flex gap-sm items-start">
        <span className="material-symbols-outlined text-secondary flex-shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
        <p className="font-body-md text-body-md text-on-surface">
          <strong>Zero fees!</strong> UPI transactions for merchants under ₹2,000/day are completely free.
        </p>
      </div>
    </div>
  );
}
