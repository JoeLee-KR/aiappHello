# HelloWorld
# 12345abcde
# 한글이라구
import sys;
print('myPython [%s] on [%s]' % (sys.version, sys.platform))

from dotenv import load_dotenv
import os


# .env 파일 로드 (파일 이름을 지정하지 않으면 기본적으로 '.env'를 찾음)
load_dotenv("../../_apikeys.env")  # 또는 load_dotenv("config.env")

# 환경변수에서 API 키 읽기
api_key = os.getenv("Doogie.2ndKey")

# API 키 사용 예시
if api_key:
    print(f"Key loaded: {api_key[:8]}****...ommitted...")  # 보안을 위해 앞 몇자리만 출력
else:
    print("Key not found.")

# some string test
text = "MYTEXT"
prompt = f'''
    **Instructions** :
    - You are an expert assistant that summarizes text into **Korean language**.
    - Your task is to summarize the **text** sentences in **Korean language**.
    - Your summaries should include the following :
        - Omit duplicate content, but increase the summary weight of duplicate content.
        - Summarize by emphasizing concepts and arguments rather than case evidence.
        - Summarize in 3 lines.
        - Use the format of a bullet point.
    -text : {text}
    '''
print(prompt)