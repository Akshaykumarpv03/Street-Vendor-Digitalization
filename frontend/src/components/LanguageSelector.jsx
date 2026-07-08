/**
 * LanguageSelector.jsx — horizontal chip row for selecting response language.
 * The vendor's preferred language is sent to /api/query and used by the
 * Translation Agent to localise the response.
 */
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "mr", label: "मराठी" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ml", label: "മലയാളം" },
  { code: "bn", label: "বাংলা" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
];

export default function LanguageSelector({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onChange(lang.code)}
          className={`chip ${value === lang.code ? "chip-active" : "chip-inactive"}`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
