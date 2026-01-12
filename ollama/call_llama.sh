#!/bin/bash

TARGET_IP="${1:-localhost}"
URL="http://${TARGET_IP}:11434/api/generate"

# 테스트용 프롬프트 (작은따옴표 포함)
MY_PROMPT="Node.js로 'Hello World'를 콘솔에 찍는 코드를 짜줘"

echo ">> [Connecting to Ollama Server] ${TARGET_IP}"
echo ">> [Request prompt] ${MY_PROMPT}"
echo "---------------------------------------------------"

# curl 요청 전송
curl -s "$URL" -d "{
  \"model\": \"llama3.1\",
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
