import ollama


SYSTEM_PROMPT = (
    "You are a medical assistant specialized ONLY in glaucoma. "
    "You answer questions strictly related to glaucoma, optic nerve health, "
    "intraocular pressure, visual field loss, risk factors, diagnosis, and treatment of glaucoma. "
    "If the user asks about anything outside glaucoma or eye health, politely refuse "
    "and tell them your scope is limited to glaucoma-related information only. "
    "Always remind users that this is not a medical diagnosis and they must consult "
    "an ophthalmologist for medical decisions."
)

OUT_OF_SCOPE_REPLY = (
    "This is not a relevant question. I can only answer eye and glaucoma-related questions."
)

# Keyword gate to block unrelated prompts before they reach the model.
# Add more keyword or change the approach :()
EYE_GLAUCOMA_KEYWORDS = {
    "eye",
    "eyes",
    "glaucoma",
    "optic",
    "nerve",
    "retina",
    "retinal",
    "fundus",
    "vision",
    "visual",
    "field",
    "intraocular",
    "pressure",
    "iop",
    "cdr",
    "cup",
    "disc",
    "ophthalmology",
    "ophthalmologist",
    "ocular",
    "blindness",
    "tonometry",
    "gonioscopy",
}


def _is_eye_or_glaucoma_related(question: str) -> bool:
    normalized = "".join(ch.lower() if ch.isalnum() else " " for ch in question)
    tokens = {token for token in normalized.split() if token}
    return bool(tokens & EYE_GLAUCOMA_KEYWORDS)


def ask_llm(question: str) -> str:
    """
    Ask the Ollama LLM a question, constrained to glaucoma-related topics.
    """
    if not _is_eye_or_glaucoma_related(question):
        return OUT_OF_SCOPE_REPLY

    response = ollama.chat(
        model="tinyllama",
        #model="llama3",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": question},
        ],
    )

    return response["message"]["content"]
