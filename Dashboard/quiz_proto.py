import streamlit as st
import pandas as pd
import plotly.express as px
import seaborn as sns
import matplotlib.pyplot as plt



st.set_page_config(page_title="Prototype quiz test", page_icon="😂", layout="wide")

st.title("Dashboard Gaya Belajar Python")
st.markdown("""Survei tidak cukup membuktikan, cobalah test sederhana ini""")

# Initialize Session State
if 'answers' not in st.session_state:
    st.session_state.answers = {}

# Define your questions
quiz_data = {
    "q1": {
        "text": "Apa hobi utama Anda?",
        "type": "multiple_choice",
        "options": ["Coding", "Desain", "Analisis Data"]
    },
    "q2": {
        "text": "Ceritakan pengalaman tersulit Anda saat belajar Python:",
        "type": "text_area",
    },
    "q3": {
        "text": "Pilih library yang paling sering Anda gunakan (Bisa pilih banyak):",
        "type": "multiselect",
        "options": ["Pandas", "NumPy", "Scikit-Learn", "PyTorch"]
    },
    "q4": {
        "text": "Seberapa mahir Anda dalam Python?",
        "type": "slider",
        "range": (0, 100)
    }
}


@st.fragment
def questionnaire():
    st.subheader("Kuisioner Interaktif")
    answers = st.session_state.answers

    # Iterate through questions and create widgets
    for key, item in quiz_data.items():
        st.write(f"### {item['text']}")

        if item["type"] == "multiple_choice":
            answers[key] = st.radio("Pilih salah satu:", item["options"], key=key)

        elif item["type"] == "text_area":
            answers[key] = st.text_area("Tulis jawaban di sini:", key=key, placeholder="Ketik sesuatu...")

        elif item["type"] == "multiselect":
            answers[key] = st.multiselect("Pilih semua yang sesuai:", item["options"], key=key)

        elif item["type"] == "slider":
            min_v, max_v = item["range"]
            answers[key] = st.slider("Geser sesuai level Anda:", min_v, max_v, 50, key=key)

    # Manual Save/Process Button
    if st.button("Submit Jawaban"):
        return answers
    return None


# Execution
results = questionnaire()

if results:
    st.success("Jawaban Berhasil Disimpan!")
    st.json(results)  # This is your dictionary ready for processing

    # Example of processing
    if results['q1'] == "Langsung Ngoding":
        st.write("Tipe Belajar: **Kinestetik**")



