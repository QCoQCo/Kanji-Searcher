# Kanji Searcher

일본어 한자 학습을 위한 검색 도구입니다. Jisho API와 Kanji API를 활용하여 한자와 단어를 검색할 수 있습니다.

## 기능

- 한자 검색 (JLPT 레벨별 필터링)
- 단어 검색
- 가상 키보드
- 검색 기록
- 관련 단어 표시

## 기술 스택

- React + TypeScript
- Vite
- Netlify Functions (API 프록시)
- Jisho API
- Kanji API

## 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# Netlify Functions 의존성 설치
cd netlify/functions && npm install

# 로컬에서 Netlify Functions 테스트
netlify dev
```

## 배포

이 프로젝트는 Netlify Functions를 사용하여 CORS 문제를 해결합니다.

### 배포 전 준비사항

1. Netlify Functions 의존성 설치:
```bash
cd netlify/functions && npm install
```

2. 프로젝트 빌드:
```bash
npm run build
```

### Netlify 배포

1. Netlify 대시보드에서 새 사이트 생성
2. GitHub 저장소 연결
3. 빌드 설정:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

### 환경 변수

필요한 경우 Netlify 대시보드에서 환경 변수를 설정할 수 있습니다.

## API 구조

- `/api/jisho-search` - Jisho API 프록시
- `/api/kanji-info` - Kanji API 프록시

## 문제 해결

### 검색이 안 되는 경우

1. Netlify Functions가 제대로 배포되었는지 확인
2. 브라우저 개발자 도구에서 네트워크 탭 확인
3. Netlify Functions 로그 확인

### CORS 오류

Netlify Functions를 통해 CORS 문제를 해결. 만약 여전히 문제가 있다면:
1. `netlify.toml` 파일이 올바르게 설정되었는지 확인
2. Functions가 제대로 배포되었는지 확인
