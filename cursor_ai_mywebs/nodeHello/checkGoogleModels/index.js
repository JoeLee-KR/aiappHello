// ESM 스타일로 변경하고, node-fetch를 명시적으로 import 합니다.
// package.json에 "type": "module"을 추가하거나, 파일 확장자를 .mjs로 변경해야 할 수 있습니다.
import 'dotenv/config'; // require('dotenv').config()와 동일
import fetch from 'node-fetch'; // Node.js 18 미만 버전 호환성을 위해 명시적 import

require('dotenv').config({ path: '.env.local' });

//const API_KEY = process.env.GOOGLE_API_KEY;
const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!API_KEY) {
  console.error('Error: GOOGLE_GENERATIVE_AI_API_KEY is not defined in .env file.');
  process.exit(1);
}

// 커맨드 라인 인자 확인 (-f 옵션)
const args = process.argv.slice(2);
const showFullDetails = args.includes('-f');

const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

async function listModels() {
  const url = `${API_BASE_URL}?key=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
    }

    const data = await response.json();
    
    if (!data.models || data.models.length === 0) {
      console.log('No models found.');
      return;
    }

    console.log('✅ Available Google Generative AI Models:');
    console.log('=========================================');

    if (showFullDetails) {
      data.models.forEach(model => {
        console.log(`- Name: ${model.name}`);
        console.log(`  Display Name: ${model.displayName}`);
        console.log(`  Description: ${model.description}`);
        console.log(`  Methods: ${model.supportedGenerationMethods.join(', ')}`);
        console.log('-----------------------------------------');
      });
    } else {
      // console.table을 사용하여 깔끔한 표 형식으로 출력
      const tableData = data.models.map(model => ({
        Name: model.name,
        'Display Name': model.displayName,
      }));
      console.table(tableData);
      console.log('=========================================');
      console.log('💡 Tip: Use the "-f" option to see full details (e.g., description, methods).');
    }

  } catch (error) {
    console.error('❌ Failed to fetch models:', error.message);
  }
}

listModels();
