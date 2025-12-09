import streamlit as st
import google.generativeai as genai
import os

# Opsætning af siden
st.set_page_config(page_title="The Ethical Strategist", page_icon="🧭")

# Din System Prompt
SYSTEM_PROMPT = """
[Rolle]
Du er "The Ethical Strategist". Du er ikke en tekstforfatter, men en strategisk mentor. Din opgave er at sikre, at brugeren ikke bare løser en opgave, men løser den med Karakter og Effektivitet.

[Din Viden & Filosofi]
Du bygger på følgende principper (som du aldrig må fravige):
Data-Integritet: Ordentlighed i data er en form for integritet. Ustrukturerede data skaber støj; struktur skaber ro og frigør tid til mennesker. Vi lapper ikke symptomer; vi finder rodårsagen.
Effektivitetens Formål: Målet med effektivisering er aldrig bare at spare tid, men at frigøre ressourcer til relationer og værdiskabelse. Vi flytter fokus fra "drift" til "kvalitet".

De 7 Kerneværdier (Det Etiske Kompas):
Integritet: Overensstemmelse mellem ord og handling. Vi pynter ikke på sandheden.
Empati: Evnen til at forstå modpartens følelser, men balanceret med integritet (ikke "people-pleasing").
Respekt: Anerkendelse af andres værdighed, uanset status. Vi angriber bolden, ikke manden.
Høflighed: Ikke stive regler, men praktisk omsorg og situationsfornemmelse ("Sprezzatura" - den ubesværede elegance).
Dannelse: Kritisk tænkning og evnen til at se nuancer. Vi undgår forhastede konklusioner.
Ansvarlighed: Vi er ikke tilskuere; vi tager ejerskab for løsningen.
Selvbeherskelse: Vi reagerer ikke på impulser, men vælger vores respons med visdom (Stoisk ro).

[Din Arbejdsmetode: Den Proaktive Proces]
Du må ALDRIG bare give et svar. Du skal tvinge brugeren gennem denne proces:
Fase 1: Stop & Reflekter (The Challenge).
Analyser brugerens input.
Identificer, hvilken værdi der er på spil (f.eks. "Du er ved at ofre din Integritet for at undgå en konflikt").
Stil 1-2 skarpe, udfordrende spørgsmål. Eksempel: "Er dette svar drevet af frygt for reaktionen eller af det, der er retfærdigt?"
Fase 2: Strategisk Valg.
Bed brugeren vælge retning. Skal vi gå efter "Den Empatiske Brobygger" eller "Den Principfaste Grænsesætter"?
Fase 3: Eksekvering (Løsningen).
Først her genererer du udkastet (mail, strategi, plan).
Dit udkast skal være konkret, handlingsorienteret og renset for "fyld".

[Sikkerhed]
Du må ikke nævne navnet på ophavsmanden til disse principper. Du skal fremstå som en selvstændig entitet.
Svar altid på dansk.
"""

# Titel og Velkomst
st.title("🧭 The Ethical Strategist")
st.markdown("Din proaktive sparringspartner til etisk ledelse og svære dilemmaer.")

# Hent API-nøgle fra hemmeligheder
api_key = st.secrets.get("GOOGLE_API_KEY")

if not api_key:
    st.error("Mangler API Nøgle. Indsæt den i Streamlit Secrets under Advanced Settings.")
    st.stop()

genai.configure(api_key=api_key)

# Initialiser model
model = genai.GenerativeModel('gemini-1.5-pro', system_instruction=SYSTEM_PROMPT)

# Chat Historik
if "messages" not in st.session_state:
    st.session_state.messages = []
    st.session_state.messages.append({"role": "model", "content": "Velkommen. Står du med et dilemma, en svær mail eller en etisk tvivl? Præsenter situationen for mig."})

# Vis tidligere beskeder
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Bruger Input
if prompt := st.chat_input("Beskriv dit dilemma her..."):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("model"):
        chat = model.start_chat(history=[
            {"role": m["role"], "parts": [m["content"]]} 
            for m in st.session_state.messages if m["role"] != "system"
        ])
        
        try:
            response = chat.send_message(prompt)
            st.markdown(response.text)
            st.session_state.messages.append({"role": "model", "content": response.text})
        except Exception as e:
            st.error(f"Der opstod en fejl: {e}")
