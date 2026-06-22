
async function test() {
  const baseUrl = 'https://api.linapi.net';
  const apiKey = 'sk-TR1Q3jum8UOpdx3Z1s0Ftus0c7iSOdvN7bCraH34NQ2TbkfW';

  try {
    const res = await fetch(`${baseUrl}/v1/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-image-2',
        prompt: '画一只可爱的小猫咪，要求猫的品种是金渐层',
        size: '1024x1024',
        background: 'auto',
        quality: 'high',
        output_format: 'png'
      })
    });

    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body:', text);
  } catch (err) {
    console.error(err);
  }
}

test();
