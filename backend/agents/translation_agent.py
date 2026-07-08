"""
agents/translation_agent.py — Language Translation Agent.

Responsibility: Localise the combined final response into the vendor's
regional language.  No RAG — pure Granite generation.

Supported languages (ISO 639-1 codes):
  hi  Hindi     mr  Marathi    ta  Tamil
  te  Telugu    kn  Kannada    ml  Malayalam
  bn  Bengali   gu  Gujarati   pa  Punjabi
  ur  Urdu      en  English (no translation needed)
"""
from __future__ import annotations

from config import Config
from utils.watsonx_client import watsonx_client

LANGUAGE_NAMES: dict[str, str] = {
    "hi": "Hindi",
    "mr": "Marathi",
    "ta": "Tamil",
    "te": "Telugu",
    "kn": "Kannada",
    "ml": "Malayalam",
    "bn": "Bengali",
    "gu": "Gujarati",
    "pa": "Punjabi",
    "ur": "Urdu",
    "en": "English",
}

_MOCK_TRANSLATED = """**[मराठी अनुवाद — Mock Mode]**

हे एक mock अनुवाद आहे. खरे watsonx credentials सेट करा आणि USE_MOCK=false करा म्हणजे Granite खरा अनुवाद देईल.

---

*(Mock translation — set USE_MOCK=false and add watsonx credentials for real Marathi output.)*"""


class TranslationAgent:
    NAME = "Language Translation Agent"

    def run(self, text: str, target_language: str = "en") -> dict[str, str]:
        """
        Translate *text* into *target_language*.

        Parameters
        ----------
        text            : the combined English response to translate
        target_language : ISO 639-1 language code (e.g. "mr", "hi")

        Returns
        -------
        {"agent": str, "translated_text": str, "language": str, "translated": bool}
        """
        if target_language == "en" or not target_language:
            return {
                "agent": self.NAME,
                "translated_text": text,
                "language": "en",
                "translated": False,
            }

        if Config.USE_MOCK:
            return {
                "agent": self.NAME,
                "translated_text": _MOCK_TRANSLATED,
                "language": target_language,
                "translated": True,
            }

        lang_name = LANGUAGE_NAMES.get(target_language, target_language)

        prompt = f"""You are not being used for a coding task — respond only in plain natural language, no code blocks or technical formatting.

You are a professional translator specialising in Indian regional languages.
Translate the following text into {lang_name}.

Rules:
- Preserve all markdown formatting (bold **, bullet points -, numbered lists, tables).
- Keep proper nouns, brand names, URLs, and phone numbers in their original form.
- Translate everything else naturally — do NOT transliterate.
- Output ONLY the translated text with no preamble.

TEXT TO TRANSLATE:
{text}

{lang_name.upper()} TRANSLATION:"""

        translated = watsonx_client.text_generate(
            prompt=prompt,
            max_new_tokens=1200,
            temperature=0.2,
        )

        return {
            "agent": self.NAME,
            "translated_text": translated,
            "language": target_language,
            "translated": True,
        }
