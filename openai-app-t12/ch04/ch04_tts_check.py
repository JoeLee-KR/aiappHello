from dotenv import load_dotenv
import os
from openai import OpenAI


load_dotenv("../../_apikeys.env")
api_key = os.getenv("Doogie.2ndKey")
openAIClient = OpenAI(api_key=api_key)

speech_out_file = "speech_out.mp3"

with openAIClient.audio.speech.with_streaming_response.create(
    model="tts-1",
    voice="alloy",
    input="오늘은 좋아하는 것을 만들기에 좋은 날 입니다.",
) as response:
    response.stream_to_file(speech_out_file)