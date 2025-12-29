import sys
import streamlit as st
from audiorecorder import audiorecorder

st.write("Python executable path:", sys.executable)
st.title("test streamlit-audiorecorder package")
wav_audio_data = audiorecorder("Click to record",
                               "Click to stop recording")

if len(wav_audio_data) > 0:
    # To play audio in frontend:
    st.audio(wav_audio_data.export().read())

    # To save audio to a file, use pydub export method:
    wav_audio_data.export("audio.wav", format="wav")

    # To get audio properties, use pydub AudioSegment properties:
    st.write(f"Frame rate: {wav_audio_data.frame_rate}, "
             f"Frame width: {wav_audio_data.frame_width}, "
             f"Duration: {wav_audio_data.duration_seconds} seconds")