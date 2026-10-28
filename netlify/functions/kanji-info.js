const axios = require('axios');

exports.handler = async (event) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  // OPTIONS 요청 처리 (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const { kanji } = event.queryStringParameters || {};

  if (!kanji) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Kanji character is required' })
    };
  }

  try {
    // Kanji API 호출
    const response = await axios.get(`https://kanjiapi.dev/v1/kanji/${encodeURIComponent(kanji)}`, {
      timeout: 10000
    });

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        // 한자 정보는 거의 바뀌지 않으므로 브라우저 하루, CDN 일주일 캐싱
        'Cache-Control': 'public, max-age=86400, s-maxage=604800'
      },
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('Kanji API failed:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText
    });

    // 응답이 없으면(타임아웃·네트워크) 502로 업스트림 실패를 표시
    return {
      statusCode: error.response?.status || 502,
      headers,
      body: JSON.stringify({
        error: 'Failed to fetch kanji data',
        details: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      })
    };
  }
};
