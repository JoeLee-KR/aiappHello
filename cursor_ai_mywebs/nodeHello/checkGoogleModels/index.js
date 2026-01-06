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

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    if (data.models) {
      console.log('Available Google Generative AI Models:');
      console.log('=======================================');
      
      data.models.forEach(model => {
        if (showFullDetails) {
          console.log(`Name: ${model.name}`);
          console.log(`Display Name: ${model.displayName}`);
          console.log(`Description: ${model.description}`);
          console.log(`Supported Generation Methods: ${model.supportedGenerationMethods.join(', ')}`);
          console.log('---------------------------------------');
        } else {
          // 한 줄 출력 모드 (이름 | 표시 이름)
          console.log(`${model.name.padEnd(25)} | ${model.displayName}`);
        }
      });

      if (!showFullDetails) {
        console.log('=======================================');
        console.log('Tip: Use "-f" option to see full details (description, methods, etc).');
      }

    } else {
      console.log('No models found.');
    }
  } catch (error) {
    console.error('Failed to fetch models:', error);
  }
}

listModels();
