#
# Optional, this only for streamlit-audiorec package
#
import sys
import streamlit as st
from st_audiorec import st_audiorec

st.write("Python executable path:", sys.executable)
st.title('test streamlit-audiorec package')
wav_audio_data = st_audiorec()

#if len(wav_audio_data) > 0:
if wav_audio_data is not None:
    st.audio(wav_audio_data, format='audio/wav')

