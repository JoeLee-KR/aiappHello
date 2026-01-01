import streamlit as st
from audiorecorder import audiorecorder
from openai import OpenAI

import os
import base64
from dotenv import load_dotenv
from datetime import datetime

def STT(audio_data, client):
    # audiorecorder가 반환한 wave_audio_data를 파일로 저장

    filename='assist_tmp.mp3'
    wav_file = open(filename, "wb")
    wav_file.write(audio_data.export().read())
    wav_file.close()

    # 저장된 음성파일을 열고, Whisper에 STT를 의뢰
    audio_file = open(filename, "rb")
    # Whisper 모델을 활용해 텍스트 얻기
    try:
        # openai 의 whisper STT를 활용하여 텍스트로 추출합니다.
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            response_format="text"
        )

        audio_file.close()
        os.remove(filename)
    except:
        transcript = '여러분들의 Key 값'
    return transcript

def TTS(response, vvclient):
    print("...in TTS:"+ response)
    with vvclient.audio.speech.with_streaming_response.create(
        model='tts-1',
        voice='shimmer',
        input=response,
    ) as xresponse:
        filename="joe_tmp.mp3"
        xresponse.stream_to_file(filename)

    # auto play saved audiofile at streamlit
    with open(filename, "rb") as f:
        data = f.read()
        b64 = base64.b64encode(data).decode()
        mdsrc = f"""
            <audio autoplay="True">
            <source src="data:audio/mp3;base64,{b64}" type="audio/mp3">
            </audio>
            """
        st.markdown(mdsrc, unsafe_allow_html=True, )
    #os.remove(filename)

def askGPT(vprompt, vclient):
    response = vclient.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=vprompt
    )
    vresponse = response.choices[0].message.content
    print("at askGPT::" + vresponse)
    return vresponse

def initVariables():
    # 사용자와 음성비서의 대화 내용 chat 기록. 초기화
    # 이래 GPT가 사용할 prompt기록용과 다르게 순수 대화 내용만 기록
    # 이 번 WebApp에서는 실제 사용은 하지 않음
    if "chat" not in st.session_state:
        st.session_state["chat"] = []

    # GPT API에 입력으로 들어갈 첫 기본 프롬프트 넣어줌. 초기화
    # 여기에 이전 질문과 답변을 누적하여 저장하고, ackGPT 시에 누적하여 사용
    if "pmsg" not in st.session_state:
        st.session_state["pmsg"] = [{
            "role": "system",
            "content": "You are a thoughtful assistant. "
                       "Response to all input in 30 words and answer in korean"
        }]

def log01(location, vclient):
    print("======LOG01-start:" + location + "::" + str(vclient) )
    #if "chat" in st.session_state: print("chat:"+str(st.session_state["chat"]))
    #if "pmsg" in st.session_state: print("pmsg:"+str(st.session_state["pmsg"]))
    for alist in st.session_state:
        print("X:"+ str(alist) +"::"+ str(st.session_state[alist]) +"...")
        #print("X:" + str(alist) +"...")
    print("======LOG01-end:")

def log02():
    for alist in st.session_state["pmsg"]:
        print("  pmsg>>>" + alist["role"] + "::" + alist["content"] + "EL" )
    for sender, time, message in st.session_state["chat"]:
        print("  chat>>>" + sender + "::" + time + ": " + message +"EL" )
    print( type(st.session_state["chat"][0]), type(st.session_state["pmsg"][0]) )

def main():
    print("===Begin of Main===")

    # 별도 apikey파일에서 사용할 키를 얻어, openai.OpenAI API사용할 client핸들을 얻음
    load_dotenv("../../_apikeys.env")
    OPENAI_API_KEY = os.getenv("Doogie.2ndKey")
    client = OpenAI( api_key = OPENAI_API_KEY )
    # client = openai.OpenAI( api_key = OPENAI_API_KEY )

    st.set_page_config(
        page_title="🔊음성 비서 프로그램🔊",
        layout="wide"
    )

    # 음성입력 확인 Flag, 오른쪽 컬럼(col2)에 대화기록(첫gpt질문후) 수행 여부 판단 flag
    # Streamlit 자체가 Web App을 구성해 주는 것이므로,
    # 이 main()이 한 번 실행되는 것은 Streamlit Webapp이 새로은 하나의 page를 rewrite하는것
    # 즉, page내부의 app요소들에 의해, action event가 발생된 후,
    # 이 main()은 다시 새로운 또 호출 되고, Streamlit webapp은 새로은 page를 만든다.
    # 그래서 계속 유지가 필요한 data는 streamlit session에 저장해 두어야 하는 것.
    flag_start = False
    initVariables()
    print("... after initVariables, flag_start=", flag_start)

    #st.image('ai.png', width=200)
    st.header('JOE_나만의 인공지능 비서 🔊')
    st.markdown('---')

    col1, col2 = st.columns(2)
    with col1:
        st.subheader('질문작업,녹음확인>>')

        # 질문 녹음용 audiorecorder WebApp object를 버튼형태 HTML로 포함시키고
        # 해당 WebApp object가 선택되어 처리되면, WebApp 자체가 rewrite되도록 하는 특징이다.
        wav_audio_data = audiorecorder("질문녹음시작",
                                       "녹음중,녹음정지,질문전달")

        print("COL1, new(" + str(flag_start) + "):("+ str(len(wav_audio_data)) +"):"+"..." )
        if len(wav_audio_data) > 0 :

            # 앞의 질문녹음 버튼 밑에, 얻은 오디오를 재생하는 object를 HTML에 포함시킨다.
            st.audio(wav_audio_data.export().read())

            # 음성파일에서 텍스트추출
            question = STT(wav_audio_data, client)
            print("COL1-1, new(" + str(flag_start) + "):(" + str(len(wav_audio_data)) + "):" + "...")

            # Streamlit WebApp 특성에 따라, 필요한 정보들을 WbeApp Session에 저장함
            # 채팅 기록 단순 누적. time, question msg, "urquestion" 속성으로 저장,
            now = datetime.now().strftime("%H:%M")
            st.session_state["chat"] = st.session_state["chat"] + [("urquestion", now, question)]

            # GPT 모델에 넣을 프롬프트를 위해 질문 저장. 이때 기존 내용 누적 형태로...
            # roel=user, COL1의 질문은 user role속성으로...
            st.session_state["pmsg"] = st.session_state["pmsg"] \
                                       + [{"role": "user", "content": question}]

            flag_start = True
        print("COL1-2, new(" + str(flag_start) + "):(" + str(len(wav_audio_data)) + "):" + "...")
    with col2:
        st.subheader('대화기록>>')
        print("COL2, new(" + str(flag_start) + "):(" + str(st.session_state["pmsg"]) +"...")

        if flag_start:
            # 이제까지의 모든 누적내용을 프로프트로 주공, 답변을 얻어냄
            response = askGPT( st.session_state["pmsg"], client)

            # Streamlit WebApp 특성에 따라, 필요한 정보들을 WbeApp Session에 누적 저장함
            # 채팅 기록 단순 누적. time, response msg, "bot" 속성으로 저장.
            now = datetime.now().strftime("%H:%M")
            st.session_state["chat"] = st.session_state["chat"] + [("bot", now, response)]

            # GPT 모델에 넣을 프롬프트를 위해 얻은 답변을 추가 누적으로 저장.
            # role=assist, COL2의 대답은 assist role속성으로...
            st.session_state["pmsg"] = st.session_state["pmsg"] \
                                       + [{ "role": "assistant", "content": response }]

            # 채팅 형식으로 시각화 하기
            # session "chat"에 들어 있는 누적된 모든 것들을 차례대로 꺼내어 보여 준다.
            for sender, time, message in st.session_state["chat"]:
                if sender == "urquestion":
                    st.write(
                        f'<div style="display:flex;align-items:center;">'
                        f'<div style="background-color:#007AFF;color:white;border-radius:12px;padding:8px 12px;margin-right:8px;">'
                        f'{message}</div>'
                        f'<div style="font-size:0.8rem;color:gray;">{time}</div></div>',
                        unsafe_allow_html=True)
                    st.write("")
                else:
                    st.write(
                        f'<div style="display:flex;align-items:center;justify-content:flex-end;">'
                        f'<div style="background-color:lightgray;border-radius:12px;padding:8px 12px;margin-left:8px;">'
                        f'{message}</div>'
                        f'<div style="font-size:0.8rem;color:gray;">{time}</div></div>',
                        unsafe_allow_html=True)
                    st.write("")
            log02()
            TTS(response, client)

    print("===End of Main===")
    print("COL_ALL, new(" + str(flag_start) + "):(" + str(len(st.session_state["pmsg"]))      + "...")
if __name__ == "__main__":
    main()