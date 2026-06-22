const https = require('https');

const data = JSON.stringify({
  model: 'deepseek-v4-flash',
  messages: [
    { role: 'user', content: '飞机是谁发明的？' }
  ]
});

const options = {
  hostname: 'api.deepseek.com',
  port: 443,
  path: '/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sk-6a3b558d454d4ec6b9d90d0ec385aeaf'
  }
};

const req = https.request(options, (res) => {
  let result = '';
  res.on('data', (d) => { result += d; });
  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log('Response:', result);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
