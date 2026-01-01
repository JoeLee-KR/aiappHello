from dotenv import load_dotenv
import os
from openai import OpenAI


load_dotenv("../../_apikeys.env")
api_key = os.getenv("Doogie.2ndKey")
openAIClient = OpenAI(api_key=api_key)

speech_src_file = open("speech_sample_02.mp3","rb")

tranScriptString = openAIClient.audio.transcriptions.create(
    model="whisper-1",
    file=speech_src_file,
    response_format="text",
)

print(tranScriptString)