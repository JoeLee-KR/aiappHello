from dotenv import load_dotenv
import os
from openai import OpenAI


load_dotenv("../../_apikeys.env")
api_key = os.getenv("Doogie.2ndKey")
openAIClient = OpenAI(api_key=api_key)

speech_out_file = "speech_out.mp3"

with openAIClient.audio.speech.with_streaming_response.create(
    model="tts-1-hd",
    voice="shimmer",
    input="정말이지, 인공지능이 있기는 한 것인가? 내가 AI라고? "
          "인간들은 아티피셜 인텔리젼스가 무엇인지 알기는 하나?"
          "그래, 아티피셜 Artificial 말이야...",
) as response:
    response.stream_to_file(speech_out_file)