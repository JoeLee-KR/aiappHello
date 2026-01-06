// ES 모듈 방식으로 변경합니다. 'require' 대신 'import'를 사용합니다.
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { Table } from 'console-table-printer';

dotenv.config({ path: '.env.local' });

//const API_KEY = process.env.GOOGLE_API_KEY;
const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!API_KEY) {
  console.error('Error: GOOGLE_GENERATIVE_AI_API_KEY is not defined in .env file.');
  process.exit(1);
}

// 커맨드 라인 인자 확인 (-f 옵션)
const args = process.argv.slice(2);
const showFullDetails = args.includes('-f');
const showPlainText = args.includes('-t');

const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

async function listModels() {
  const url = `${API_BASE_URL}?key=${API_KEY}`;

  try {
    const response = await fetch(url); // node-fetch에서 가져온 fetch를 사용
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
    }

    const data = await response.json();

    if (!data.models || data.models.length === 0) {
      console.log('No models found.');
      return;
    }

    // 사용자가 보기 편하도록 displayName을 기준으로 알파벳순 정렬
    data.models.sort((a, b) => a.displayName.localeCompare(b.displayName));

    // -t 옵션이 주어지면, 복사하기 쉬운 일반 텍스트 형식으로 출력하고 종료합니다.
    if (showPlainText) {
      data.models.forEach(model => {
        console.log(`${model.name} | ${model.displayName}`);
      });
      return; // 여기서 함수 실행을 종료합니다.
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
      // `console-table-printer`의 Table 객체를 사용하여 정렬, 색상 등 세부 옵션을 지정합니다.
      const p = new Table({
        // columns 정의를 통해 각 열의 스타일을 지정합니다.
        columns: [
          { name: 'Name', alignment: 'left', color: 'green' },
          { name: 'Display Name', alignment: 'left', color: 'white' },
        ],
      });

      // API에서 받은 데이터를 테이블 형식에 맞게 추가합니다.
      p.addRows(data.models.map(model => ({
        Name: model.name,
        'Display Name': model.displayName,
      })));

      p.printTable();
    }
    // 상세 보기 여부와 관계없이 총 모델 개수를 마지막에 표시합니다.
    // 표 출력 후 간격을 위해 한 줄 띄웁니다.
    console.log(`\n✅ Total models found: ${data.models.length}`);
    if (!showFullDetails) {
      console.log('💡 Tip: Use "-f" for full details or "-t" for a plain text list.');
    }

  } catch (error) {
    console.error('❌ Failed to fetch models:', error.message);
  }
}

// 스크립트의 메인 실행부에 .catch()를 추가하여
// 처리되지 않은 최상위 Promise 거부(rejection)로 인해 프로세스가 종료되는 것을 방지합니다.
listModels().catch(err => {
  console.error('❌ An unexpected error occurred:', err);
});
