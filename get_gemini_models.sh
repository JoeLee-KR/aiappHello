#!/bin/bash

# ==============================================================================
# [설정] 조회할 환경 변수 파일 경로를 여기에 지정하십시오.
# 형님의 요청대로 변수명을 지정했습니다.
# ==============================================================================
GeminiAPI_ENVFILE="./.env.local"

# ------------------------------------------------------------------------------
# 1. 환경 변수 파일 존재 여부 확인
# ------------------------------------------------------------------------------
if [ ! -f "$GeminiAPI_ENVFILE" ]; then
    echo "❌ 에러: 설정 파일($GeminiAPI_ENVFILE)을 찾을 수 없습니다."
    echo "   파일 경로가 정확한지 확인해 주세요."
    exit 1
fi

# ------------------------------------------------------------------------------
# 2. API Key 추출 (grep과 sed를 사용하여 안전하게 파싱)
#    - 주석(#) 무시
#    - 키 값 주변의 따옴표(", ') 제거
#    - 공백 제거
# ------------------------------------------------------------------------------
API_KEY=$(grep "^GOOGLE_GENERATIVE_AI_API_KEY" "$GeminiAPI_ENVFILE" | cut -d '=' -f2- | sed 's/^["'\'']//;s/["'\'']$//' | tr -d '[:space:]')

if [ -z "$API_KEY" ]; then
    echo "❌ 에러: $GeminiAPI_ENVFILE 파일 안에 'GOOGLE_GENERATIVE_AI_API_KEY'가 없습니다."
    exit 1
fi

echo "✅ API Key를 확인했습니다. ($GeminiAPI_ENVFILE)"
echo "📡 Google Gemini API 서버에 모델 리스트를 요청 중입니다..."
echo "--------------------------------------------------------------------------------"
printf "%-30s | %-15s | %-s\n" "MODEL ID (코드용)" "VERSION" "DISPLAY NAME"
echo "--------------------------------------------------------------------------------"

# ------------------------------------------------------------------------------
# 3. API 호출 및 Python을 이용한 깔끔한 JSON 파싱
#    (jq가 없어도 macOS 기본 python3로 동작하도록 작성)
# ------------------------------------------------------------------------------
curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=$API_KEY" | python3 -c "
import sys, json

try:
    data = json.load(sys.stdin)
    if 'models' not in data:
        print(f'API Error: {data}')
        sys.exit(1)

    # 모델 리스트 순회
    for model in data['models']:
        # 콘텐츠 생성(generateContent)이 가능한 모델만 필터링
        if 'generateContent' in model.get('supportedGenerationMethods', []):
            name = model['name'].replace('models/', '') # 'models/' 접두어 제거하고 출력
            version = model.get('version', 'N/A')
            display_name = model.get('displayName', 'Unknown')
            
            # 포맷팅하여 출력
            print(f'{name:<30} | {version:<15} | {display_name}')

except Exception as e:
    print(f'Error parsing JSON: {e}')
"

echo "--------------------------------------------------------------------------------"
echo "💡 Tip: 코드(route.ts)에는 'MODEL ID' 컬럼의 값을 사용하세요."
