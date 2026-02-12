const axios = require('axios');

// CORS 프록시를 통한 Jisho API 호출
async function searchWithCorsProxy(keyword) {
  try {
    // cors-anywhere 프록시 사용
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const jishoUrl = `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(keyword)}`;
    
    const response = await axios.get(proxyUrl + jishoUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Origin': 'https://jisho.org'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('CORS proxy failed:', error.message);
    throw error;
  }
}

// 대체 API 함수
async function searchWithAlternativeAPI(keyword) {
  try {
    // Weblio API 시도 (대체 옵션)
    const response = await axios.get(`https://api.weblio.jp/v1/wordSearch`, {
      params: { 
        query: keyword,
        key: process.env.WEBLIO_API_KEY || 'demo' // 실제 API 키가 필요할 수 있음
      },
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Alternative API also failed:', error.message);
    throw error;
  }
}

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
    const { keyword } = event.queryStringParameters || {};
    
    if (!keyword) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Keyword is required' })
      };
    }

    console.log(`Searching for keyword: ${keyword}`);

    let response;
    let source = 'jisho';

    // 1. 직접 Jisho API 시도
    try {
      response = await axios.get(`https://jisho.org/api/v1/search/words`, {
        params: { keyword },
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9,ja;q=0.8',
          'Referer': 'https://jisho.org/',
          'Origin': 'https://jisho.org'
        }
      });

      console.log(`Jisho API response status: ${response.status}`);
    } catch (jishoError) {
      console.error('Direct Jisho API failed, trying CORS proxy:', jishoError.message);
      
      // 2. CORS 프록시 시도
      try {
        response = await searchWithCorsProxy(keyword);
        source = 'cors-proxy';
        console.log('Using CORS proxy');
      } catch (proxyError) {
        console.error('CORS proxy failed, trying alternative API:', proxyError.message);
        
        // 3. 대체 API 시도
        try {
          response = await searchWithAlternativeAPI(keyword);
          source = 'alternative';
          console.log('Using alternative API');
        } catch (altError) {
          // 모든 방법이 실패하면 원래 에러를 던짐
          throw jishoError;
        }
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ...response.data,
        _source: source
      })
    };
  } catch (error) {
    console.error('All API methods failed:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch data from all available APIs',
        details: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      })
    };
  }
}; 