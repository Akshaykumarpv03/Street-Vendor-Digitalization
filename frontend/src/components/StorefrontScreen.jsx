/**
 * StorefrontScreen.jsx — Digital Storefront placeholder screen.
 */
export default function StorefrontScreen() {
  const features = [
    { icon: "add_a_photo",      title: "Product Photos",   desc: "Upload and showcase your products with AI-enhanced images" },
    { icon: "edit_note",        title: "Business Profile",  desc: "Create a shareable digital card for your stall" },
    { icon: "language",         title: "Google Listing",   desc: "Get found on Google Maps and Search" },
    { icon: "share",            title: "WhatsApp Catalog",  desc: "Share your catalogue instantly via WhatsApp" },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
      <div>
        <h2 className="font-headline-lg-mobile md:text-headline-lg text-on-background font-bold">Digital Storefront</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Build your online presence and reach more customers.
        </p>
      </div>

      {/* Coming soon banner */}
      <div className="md-card p-md flex flex-col items-center text-center gap-4 py-10">
        <div className="w-16 h-16 rounded-2xl bg-primary-container/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: "36px", fontVariationSettings: "'FILL' 1" }}>storefront</span>
        </div>
        <div>
          <h3 className="font-headline-md text-headline-md text-on-surface">Coming Soon</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-xs mx-auto">
            Your digital storefront is being set up. Ask the AI assistant on the Home tab to help build your profile.
          </p>
        </div>
        <button className="btn-filled px-8">Go to AI Assistant</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {features.map((f) => (
          <div key={f.title} className="md-card p-sm flex flex-col gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
            <h3 className="font-label-lg text-label-lg text-on-surface">{f.title}</h3>
            <p className="font-label-sm text-label-sm text-on-surface-variant leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
