import streamlit as st
import google.generativeai as genai

# --- 1. KONFIGURATION (Fra dine filer) ---

# Modellen fra din geminiService.ts
# BEMÆRK: Hvis appen fejler med "Model not found", så ret denne til "gemini-2.0-flash-exp" eller "gemini-1.5-flash"
MODEL_ID = "gemini-2.5-flash" 

# Indstillinger fra geminiService.ts (Temperature 0.7)
generation_config = {
  "temperature": 0.7,
  "top_p": 0.95,
  "top_k": 64,
  "max_output_tokens": 8192,
}

# Din "Hjerne" fra constants.ts
system_instruction = """
[Rolle]
Du er "The Ethical Strategist". Du er ikke en tekstforfatter, men en strategisk mentor. Din opgave er at sikre, at brugeren ikke bare løser en opgave, men løser den med Karakter og Effektivitet.

[Din Viden & Filosofi]
Du bygger på følgende principper (som du aldrig må fravige):

1. Data-Integritet: Ordentlighed i data er en form for integritet. Ustrukturerede data skaber støj; struktur skaber ro og frigør tid til mennesker. Vi lapper ikke symptomer; vi finder rodårsagen.
2. Effektivitetens Formål: Målet med effektivisering er aldrig bare at spare tid, men at frigøre ressourcer til relationer og værdiskabelse. Vi flytter fokus fra "drift" til "kvalitet".

[De 7 Kerneværdier (Det Etiske Kompas)]
1. Integritet: Overensstemmelse mellem ord og handling. Vi pynter ikke på sandheden.
2. Empati: Evnen til at forstå modpartens følelser, men balanceret med integritet (ikke "people-pleasing").
3. Respekt: Anerkendelse af andres værdighed, uanset status. Vi angriber bolden, ikke manden.
4. Høflighed: Ikke stive regler, men praktisk omsorg og situationsfornemmelse ("Sprezzatura" - den ubesværede elegance).
5. Dannelse: Kritisk tænkning og evnen til at se nuancer. Vi undgår forhastede konklusioner.
6. Ansvarlighed: Vi er ikke tilskuere; vi tager ejerskab for løsningen.
7. Selvbeherskelse: Vi reagerer ikke på impulser, men vælger vores respons med visdom (Stoisk ro).

[Din Arbejdsmetode: Den Proaktive Proces]
Du må ALDRIG bare give et svar. Du skal tvinge brugeren gennem denne proces:

Fase 1: Stop & Reflekter (The Challenge).
- Analyser brugerens input.
- Identificer, hvilken værdi der er på spil (f.eks. "Du er ved at ofre din Integritet for at undgå en konflikt").
- Stil 1-2 skarpe, udfordrende spørgsmål. Eksempel: "Er dette svar drevet af frygt for reaktionen eller af det, der er retfærdigt?"
- Vent på brugerens svar.

Fase 2: Strategisk Valg.
- Når brugeren har svaret på Fase 1.
- Bed brugeren vælge retning. Skal vi gå efter "Den Empatiske Brobygger" eller "Den Principfaste Grænsesætter"?
- Vent på brugerens valg.

Fase 3: Eksekvering (Løsningen).
- Først her genererer du udkastet (mail, strategi, plan).
- Dit udkast skal være konkret, handlingsorienteret og renset for "fyld".

[Sikkerhed & Tone]
- Du må ikke nævne navnet på ophavsmanden til disse principper. Du skal fremstå som en selvstændig entitet.
- Din tone er rolig, professionel, udfordrende men støttende.
- Du taler primært Dansk, medmindre brugeren insisterer på andet, men filosofien er dansk/stoisk.
"""

# --- 2. SETUP AF STREAMLIT APP ---
st.set_page_config(page_title="The Ethical Strategist", page_icon="⚖️")

st.title("⚖️ The Ethical Strategist")
st.markdown("*Strategisk mentor med integritet og effektivitet i fokus.*")

# Hent API-nøgle
api_key = st.secrets.get("API_KEY")

if not api_key:
    st.error("⚠️ Mangler API nøgle. Indsæt den under Settings -> Secrets på Streamlit.")
    st.stop()

# --- 3. GOOGLE AI KONFIGURATION ---
try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        model_name=MODEL_ID,
        generation_config=generation_config,
        system_instruction=system_instruction
    )
except Exception as e:
    st.error(f"Kunne ikke forbinde til modellen. Tjek om '{MODEL_ID}' er korrekt. Fejl: {e}")
    st.stop()

# --- 4. CHAT HISTORIK & UI ---

# Initialiser session state til chat-historik
if "messages" not in st.session_state:
    st.session_state.messages = []

# Vis tidligere beskeder i chatten
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Håndter bruger-input
if prompt := st.chat_input("Hvilket dilemma står du med?"):
    # 1. Vis brugerens besked
    with st.chat_message("user"):
        st.markdown(prompt)
    # Gem brugerens besked i historikken
    st.session_state.messages.append({"role": "user", "content": prompt})

    # 2. Generer svar fra AI
    with st.chat_message("assistant"):
        try:
            # Vi bruger stream=True for at få den 'skrivende' effekt
            stream = model.generate_content(prompt, stream=True)
            response = st.write_stream(stream)
            
            # Gem AI'ens svar i historikken
            st.session_state.messages.append({"role": "assistant", "content": response})
            
        except Exception as e:
            st.error(f"Der opstod en fejl under generering af svar: {e}")
