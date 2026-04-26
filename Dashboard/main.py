import streamlit as st
import pandas as pd
import plotly.express as px
import seaborn as sns
import matplotlib.pyplot as plt

# Konfigurasi Halaman
st.set_page_config(page_title="Dashboard Gaya Belajar Python", page_icon="📊", layout="wide")

# Judul Dashboard
st.title("📊 Dashboard Analisis Gaya Belajar (VARK) User")
st.markdown("Dashboard interaktif untuk memonitor hasil pre-test profil psikologis dan gaya belajar user pada Sistem Rekomendasi Belajar Python.")

# --- FUNGSI LOAD DATA ---
@st.cache_data
def load_data():
    GITHUB_RAW_URL = "https://raw.githubusercontent.com/Dziarur/Capstone-Project/refs/heads/main/Dataset/Data_Clean/Data_Final.csv" 
    try:
        df = pd.read_csv(GITHUB_RAW_URL)
        return df
    except Exception as e:
        st.error(f"Gagal memuat data: {e}")
        return pd.DataFrame()

df = load_data()

# --- MEMASTIKAN DATA TERLOAD ---
if not df.empty:
    # Kolom Skor
    score_cols = ['Score_Visual', 'Score_Auditory', 'Score_ReadWrite', 'Score_Kinesthetic']
    
    # --- SIDEBAR FILTER ---
    st.sidebar.header("⚙️ Filter Data")
    gaya_belajar = st.sidebar.multiselect(
        "Pilih Dominant Style:",
        options=df["Dominant_Style"].dropna().unique(),
        default=df["Dominant_Style"].dropna().unique()
    )
    
    # Terapkan filter
    df_filtered = df[df["Dominant_Style"].isin(gaya_belajar)]
    
    # Menampilkan Metrik Utama
    st.markdown("### 📌 Ringkasan Metrik")
    col_metric1, col_metric2 = st.columns(2)
    col_metric1.metric("Total Responden Terfilter", len(df_filtered))
    if not df_filtered.empty:
        col_metric2.metric("Gaya Belajar Terbanyak", df_filtered["Dominant_Style"].mode()[0])
    
    st.divider()

    # --- BAR CHART SECTION ---
    col1, col2 = st.columns(2)

    with col1:
        st.subheader("📈 Distribusi Gaya Belajar Dominan")
        dist_data = df_filtered['Dominant_Style'].value_counts().reset_index()
        dist_data.columns = ['Gaya Belajar', 'Jumlah']
        fig1 = px.bar(dist_data, x='Gaya Belajar', y='Jumlah', color='Gaya Belajar', text_auto=True)
        st.plotly_chart(fig1, use_container_width=True)

    with col2:
        st.subheader("📊 Rata-rata Skor Dimensi VARK")
        avg_scores = df_filtered[score_cols].mean().reset_index()
        avg_scores.columns = ['Dimensi', 'Rata-rata Skor']
        avg_scores['Dimensi'] = avg_scores['Dimensi'].str.replace('Score_', '')
        fig2 = px.bar(avg_scores, x='Dimensi', y='Rata-rata Skor', color='Dimensi', text_auto='.2f')
        st.plotly_chart(fig2, use_container_width=True)

    # --- UNIMODAL VS MULTIMODAL SECTION ---
    st.divider()
    st.subheader("🍩 Analisis Profil Belajar: Unimodal vs Multimodal")
    
    # Kalkulasi (Menggunakan df_filtered agar interaktif)
    max_scores = df_filtered[score_cols].max(axis=1)
    num_dominant_styles = df_filtered[score_cols].eq(max_scores, axis=0).sum(axis=1)
    multimodal_count = (num_dominant_styles > 1).sum()
    unimodal_count = len(df_filtered) - multimodal_count

    if len(df_filtered) > 0:
        col_chart, col_desc = st.columns([1.5, 1])
        
        with col_chart:
            # Membuat Donut Chart
            fig_donut, ax = plt.subplots(figsize=(8, 6))
            labels = ['Multimodal', 'Unimodal']
            sizes = [multimodal_count, unimodal_count]
            colors = ['#ff9999', '#66b3ff']
            
            # Matplotlib Pie
            ax.pie(sizes, labels=labels, colors=colors, autopct='%1.2f%%', startangle=90, 
                   pctdistance=0.85, textprops={'fontsize': 12, 'weight': 'bold'})
            
            # Draw Circle (Donut hole)
            centre_circle = plt.Circle((0,0), 0.70, fc='white')
            ax.add_artist(centre_circle)
            ax.axis('equal') 
            
            # PERBAIKAN: Gunakan st.pyplot() bukan plt.show()
            st.pyplot(fig_donut)
        
        with col_desc:
            st.write(f"*Total Responden:* {len(df_filtered)}")
            st.write(f"*Multimodal:* {multimodal_count} user")
            st.write(f"*Unimodal:* {unimodal_count} user")
            st.info("User Multimodal adalah mereka yang memiliki skor tertinggi yang sama pada lebih dari satu dimensi gaya belajar (contoh: skor Visual dan Auditory sama-sama tinggi).")

    # --- HEATMAP CORRELATION ---
    st.divider()
    st.subheader("🔥 Peta Korelasi Antar Gaya Belajar")
    corr_data = df_filtered[score_cols]
    fig_corr, ax_corr = plt.subplots(figsize=(10, 6))
    sns.heatmap(corr_data.corr(), annot=True, cmap='Blues', fmt=".3f", ax=ax_corr)
    st.pyplot(fig_corr)

    # Data Mentah
    with st.expander("Lihat Data Mentah"):
        st.dataframe(df_filtered)