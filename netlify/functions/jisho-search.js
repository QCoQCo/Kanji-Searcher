const axios = require('axios');

const JISHO_SEARCH_URL = 'https://jisho.org/api/v1/search/words';
const MAX_ATTEMPTS = 2; // 일시적 오류(네트워크/5xx)에 한해 1회 재시도
const RETRY_DELAY_MS = 500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 네트워크 오류(응답 없음)나 서버 오류(5xx)만 재시도 대상
const isRetryable = (error) => !error.response || error.response.status >= 500;

async function searchJisho(keyword) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await axios.get(JISHO_SEARCH_URL, {
        params: { keyword },
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9,ja;q=0.8',
        }
      });
      return response.data;
    } catch (error) {
      lastError = error;
      console.error(`Jisho API attempt ${attempt} failed:`, error.message);

      if (attempt < MAX_ATTEMPTS && isRetryable(error)) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      break;
    }
  }

  throw lastError;
}

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

  const { keyword } = event.queryStringParameters || {};

  if (!keyword) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Keyword is required' })
    };
  }

  try {
    const data = await searchJisho(keyword);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        // 사전 데이터는 자주 바뀌지 않으므로 CDN에서 하루 캐싱
        'Cache-Control': 'public, max-age=3600, s-maxage=86400'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Jisho API failed:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText
    });

    // 응답이 없으면(타임아웃·네트워크) 502로 업스트림 실패를 표시
    return {
      statusCode: error.response?.status || 502,
      headers,
      body: JSON.stringify({
        error: 'Failed to fetch data from Jisho API',
        details: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      })
    };
  }
};
