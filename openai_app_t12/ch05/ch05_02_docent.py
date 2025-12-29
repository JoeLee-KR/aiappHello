import streamlit as st
from openai import OpenAI, api_key

import os
import io
import base64
from PIL import Image
from dotenv import load_dotenv

load_dotenv("../../_apikeys.env")
OPENAI_API_KEY = os.getenv("Doogie.2ndKey")
OpenAIclient = OpenAI( api_key = OPENAI_API_KEY )

def GPT4Vcall(urlPrompt):
    # "이 이미지에 대해서 아주 자세히 묘사해줘"
    response = OpenAIclient.chat.completions.create(
    #model="gpt-4-vision-preview",
    model="gpt-4-turbo",
    messages=[
        {
        "role": "user",
        "content": [
            {"type": "text", "text": "이 이미지에 대해서 자세히 묘사해 줘"},
            {
            "type": "image_url",
            "image_url": {
                "url": urlPrompt,
            },
            },
        ],
        }
    ],
    max_tokens=1024,
    )
    print( response )
    total_bill = (response.usage.completion_tokens * 30 + response.usage.prompt_tokens * 10) / 1000000
    sumbill = f"""
            Tokens, total:{response.usage.total_tokens}, \
            prompt:{response.usage.prompt_tokens}, \
            completion: {response.usage.completion_tokens} \
            and, Total Bill: {total_bill} USD...
        """
    st.text( sumbill)
    #return response.choices[0].message.content
    return response

# TTS
def TTScall(response):
    # TTS를 활용하여 Text를 음성으로 만든 object을 파일로 저장.
    with OpenAIclient.audio.speech.with_streaming_response.create(
        model='tts-1',
        voice='shimmer',
        input=response,
    ) as xresponse:
        filename = "joe_tmp.mp3"
        xresponse.stream_to_file(filename)

    # 저장한 음성파일을 streamli webapp에서 자동 재생
    with open(filename, "rb") as f:
        data = f.read()
        b64 = base64.b64encode(data).decode()
        # HTML 문법을 사용하여 자동으로 음원을 재생하는 코드를 작성하여
        # streamlit 안에서 HTML 문법 구현에 사용되는 st.markdown() 을 활용하여 실행을 합니다.
        md = f"""
            <audio autoplay="True">
            <source src="data:audio/mp3;base64,{b64}" type="audio/mp3">
            </audio>
            """
        st.markdown(md, unsafe_allow_html=True, )
    # 폴더에 남지 않도록 파일 삭제
    # os.remove(filename)

def main():
    st.title("💬 이미지를 해설해드립니다.")

    # 이미지를 업로드
    img_file_handle = st.file_uploader('Upload a PNG image', type='png')

    if img_file_handle is not None:

        image = Image.open(img_file_handle)

        # 업로드한 이미지를 화면에 출력
        st.image(image, caption='Uploaded Image.', use_container_width=True)

        # 이미지 => 바이트 버퍼로 변환
        bytebuffered = io.BytesIO()
        image.save(bytebuffered, format="PNG")
        # 바이트 버퍼 => Base64 인코딩 바이트 문자열로 변환
        img_base64 = base64.b64encode(bytebuffered.getvalue())
        # Base64 인코딩 바이트 문자열 => UTF-8 문자열로 디코딩
        img_base64_str = img_base64.decode('utf-8')

        # GPT-4V에서 입력받을 수 있는 형태로 변환
        # 예시 참고: https://platform.openai.com/docs/guides/vision/uploading-base-64-encoded-images
        image4gpt = f"data:image/jpeg;base64,{img_base64_str}"

        # GPT4V가 이미지에 대한 설명을 반환하고 이를 st.info()로 출력.
        responseObject = GPT4Vcall(image4gpt)
        st.info(responseObject.choices[0].message.content)

        # 이미지에 대한 설명을 음성으로 변환.
        TTScall(responseObject.choices[0].message.content)
if __name__=="__main__":
    main()
