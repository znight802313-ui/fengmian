const https = require('https');

const models = [
  '[次]gemini-3.1-pro-preview',
  '[次]gemini-2.5-pro',
  '[次]gemini-3-flash-preview',
  '[次]claude-opus-4-7-thinking',
  '[次]claude-sonnet-4-6-thinking',
  'gpt-5.5'
];

const apiKey = 'sk-KW7XVLjLAHeiMGPhQAPypobB99AjT96FftTLCgujCwT0UYuA';

async function testModel(model) {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: '飞机是谁发明的？一句话回答。' }]
    });

    const options = {
      hostname: 'us.novaiapi.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(data)
      },
      rejectUnauthorized: false
    };

    const req = https.request(options, (res) => {
      let result = '';
      res.on('data', (d) => { result += d; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(result);
          console.log(`\n=== Model: ${model} ===`);
          console.log(`Status Code: ${res.statusCode}`);
          if (parsed.choices && parsed.choices[0] && parsed.choices[0].message) {
             console.log(`Response: ${parsed.choices[0].message.content}`);
          } else {
             console.log(`Error Response:`, result);
          }
        } catch(e) {
          console.log(`\n=== Model: ${model} ===`);
          console.log(`Status Code: ${res.statusCode}`);
          console.log(`Raw Response: ${result}`);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error(`\n=== Model: ${model} Error ===`, error.message);
      resolve();
    });

    req.write(data);
    req.end();
  });
}

async function runTests() {
  for (const model of models) {
    await testModel(model);
  }
}

runTests();
