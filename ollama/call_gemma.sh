#!/bin/bash

TARGET_IP="${1:-localhost}"
URL="http://${TARGET_IP}:11434/api/generate"

# 테스트용 프롬프트 (작은따옴표 포함)
MY_PROMPT="ubuntu에 docker를 먼저 설치해야 겠군... 지저분하지 않고 깔끔하세 설치하는 방법 알려줘. 여기서 깔끔하다는 것은 나중에 docker를 지우거나, 업그레이드 하거나, 다른 솔루션 패키지들과 연동하거나, 추가 여러 버젼을 혼용하거나, 모두 지우고 새로 시작하거나 등등의 작업이 일어날 수 있는 것에 대해 깔끔한 것을 말하는 것이야 "

echo ">> [Connecting to Ollama Server] ${TARGET_IP}"
echo ">> [Request prompt] ${MY_PROMPT}"
echo "---------------------------------------------------"

# curl 요청 전송
curl -s "$URL" -d "{
  \"model\": \"gemma2:9b\",
  \"prompt\": \"${MY_PROMPT}\",
  \"stream\": false
}" | jq -r '
  .response + "\n" +
  "---------------------------------------------------\n" +
  ">> [Performance Metrics]\n" +
  
  "Total: " + ((.total_duration / 1000000000) | tostring)[0:4] + "s = " +
  "Model Load: " + ((.load_duration / 1000000000) | tostring)[0:5] + "s + " +
  "Prompt Eval: " + ((.prompt_eval_duration / 1000000000) | tostring)[0:5] + "s " +
  "(" + (.prompt_eval_count | tostring) + "tkns) \n" +

  "Response: " + ((.eval_duration / 1000000000) | tostring)[0:4] + "s " +
  "(" + (.eval_count | tostring) + "tkns) " +
  "Perf.: " + ((.eval_count / (.eval_duration / 1000000000)) | tostring)[0:5] + "tps"
' 2>/dev/null || echo ">> Error: Not response or No jq."
echo "---------------------------------------------------"
