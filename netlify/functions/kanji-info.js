const axios = require('axios');

exports.handler = async (event, context) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // OPTIONS 요청 처리 (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { kanji } = event.queryStringParameters || {};
    
    if (!kanji) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Kanji character is required' })
      };
    }

    // Kanji API 호출
    const response = await axios.get(`https://kanjiapi.dev/v1/kanji/${encodeURIComponent(kanji)}`, {
      timeout: 10000
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('Kanji API error:', error);
    
    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch kanji data',
        details: error.message 
      })
    };
  }
}; 