"""
Drop-in LLM service for deployment.

The rest of the app still imports ask_llm from this module, but the local
Ollama dependency has been replaced with Groq's hosted OpenAI-compatible API.
"""

import os
import requests


GROQ_API_URL = os.environ.get(
    "GROQ_API_URL",
    "https://api.groq.com/openai/v1/chat/completions",
)
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.1-8b-instant")
MAX_TOKENS = int(os.environ.get("GROQ_MAX_TOKENS", "600"))

SYSTEM_PROMPT = """You are GlaucomaAI, a careful educational assistant focused on glaucoma and ocular health.
Answer questions about glaucoma risk factors, symptoms, cup-to-disc ratio, optic nerve health, IOP,
screening, treatment options, and follow-up care. If the question is unrelated to eye health, politely
redirect. Do not diagnose, and always remind users to consult a qualified ophthalmologist."""

OUT_OF_SCOPE_REPLY = (
    "I'm specialized in glaucoma and ocular-health questions. Please ask about topics like "
    "glaucoma symptoms, cup-to-disc ratio, eye pressure, optic nerve health, screening results, "
    "or treatment options."
)

EYE_GLAUCOMA_KEYWORDS = {
    "glaucoma", "glaucomatous", "iop", "intraocular", "pressure", "cdr",
    "cup", "disc", "cupping", "optic", "nerve", "rnfl", "retinal",
    "retina", "eye", "eyes", "ocular", "vision", "visual", "field",
    "blindness", "blind", "blur", "blurry", "halos", "tunnel",
    "peripheral", "fundus", "oct", "tonometry", "ophthalmology",
    "ophthalmologist", "optometrist", "latanoprost", "timolol",
    "brimonidine", "dorzolamide", "acetazolamide", "trabeculectomy",
    "slt", "laser", "migs", "cataract", "screening", "heatmap",
    "gradcam", "diagnosis", "treatment", "medication", "follow-up",
}

PHRASE_MATCHES = {
    "optic nerve", "visual field", "cup to disc", "cup-to-disc",
    "eye pressure", "intraocular pressure", "ocular hypertension",
    "open angle", "angle closure", "normal tension", "eye drop",
    "eye drops", "eye exam", "eye test", "my eye", "my eyes",
}


def _is_eye_or_glaucoma_related(question: str) -> bool:
    normalized = question.lower()
    if len(normalized.split()) <= 4:
        return True

    if any(phrase in normalized for phrase in PHRASE_MATCHES):
        return True

    tokens = {token.strip(".,?!:;()[]{}\"'").lower() for token in normalized.split()}
    return bool(tokens & EYE_GLAUCOMA_KEYWORDS)


def ask_llm(question: str, conversation_history: list | None = None) -> str:
    """Ask Groq's hosted LLM a glaucoma-related question."""
    if not _is_eye_or_glaucoma_related(question):
        return OUT_OF_SCOPE_REPLY

    api_key = os.environ.get("GROQ_API_KEY", "")
    if not api_key:
        return (
            "LLM service is not configured. Set the GROQ_API_KEY environment variable "
            "in your deployment secrets."
        )

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if conversation_history:
        messages.extend(conversation_history)
    messages.append({"role": "user", "content": question})

    payload = {
        "model": GROQ_MODEL,
        "messages": messages,
        "max_tokens": MAX_TOKENS,
        "stream": False,
    }

    try:
        response = requests.post(
            GROQ_API_URL,
            json=payload,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            timeout=60,
        )
        response.raise_for_status()
        data = response.json()
        answer = data["choices"][0]["message"]["content"].strip()
        return (
            f"{answer}\n\n"
            "This information is educational only. Please consult a qualified ophthalmologist "
            "for diagnosis and treatment decisions."
        )
    except requests.exceptions.Timeout:
        return "The LLM service timed out. Please try again."
    except requests.exceptions.HTTPError:
        return f"Groq API error ({response.status_code}): {response.text[:200]}"
    except Exception as exc:
        return f"Unexpected error contacting Groq: {exc}"
