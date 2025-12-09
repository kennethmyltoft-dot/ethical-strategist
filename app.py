import streamlit as st
import google.generativeai as genai
import os

# 1. Opsætning af siden
st.set_page_config(page_title="Min AI App", page_icon="🤖")
st.title("🤖 Min Gemini AI App")

# 2. Hent API-nøglen sikkert fra Streamlit Secrets
# Hvis koden kører lokalt, kan man bruge en .env fil, men på nettet bruger vi secrets.
api_key = st.secrets.get("API_KEY")

if not api_key:
    st.error("Mangler API nøgle! Husk at tilføje 'API_KEY' i Streamlit Secrets indstillingerne.")
    st.stop()

# 3. Konfigurer Google AI med nøglen
genai.configure(api_key=api_key)

# Vælg model (Ret evt. til 'gemini-pro' eller den model du foretrækker)
model = genai.GenerativeModel('gemini-2.5-flash')

# 4. Lav input-feltet til brugeren
user_input = st.text_area("Skriv din besked her:", height=150)

# 5. Knappen der sender beskeden
if st.button("Send besked"):
    if user_input:
        with st.spinner("AI'en tænker..."):
            try:
                # Send besked til modellen
                response = model.generate_content(user_input)
                
                # Vis svaret
                st.markdown("### Svar fra AI:")
                st.write(response.text)
            except Exception as e:
                st.error(f"Der skete en fejl: {e}")
    else:
        st.warning("Du skal skrive noget først!")
