# Kanji Searcher / 漢字検索

<p align="center">
  <strong>언어 선택 / 言語選択</strong><br>
  <a href="#korean">🇰🇷 한국어</a> · <a href="#japanese">🇯🇵 日本語</a>
</p>

---

<span id="korean"></span>

## 🇰🇷 한국어

### 소개

일본어 한자 학습을 위한 검색 도구입니다. Jisho API와 Kanji API를 활용하여 한자와 단어를 검색할 수 있습니다.

### 주요 기능

- **한자 검색** - JLPT 레벨별 필터링 지원
- **단어 검색** - 일본어 단어 검색 및 상세 정보
- **랜덤 단어** - JLPT 레벨별 무작위 단어 학습 (Comprehensive / JLPT 모드)
- **가상 키보드** - 일본어 입력 지원
- **검색 기록** - 최근 검색어 저장
- **관련 단어** - 한자별 관련 단어 표시

### 기술 스택

- React + TypeScript
- Vite
- Netlify Functions (API 프록시)
- Jisho API
- Kanji API

### 개발 환경 설정

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

### 배포

이 프로젝트는 Netlify Functions를 사용하여 CORS 문제를 해결합니다.

**배포 전 준비사항:**

1. Netlify Functions 의존성 설치:
```bash
cd netlify/functions && npm install
```

2. 프로젝트 빌드:
```bash
npm run build
```

**Netlify 배포:**

1. Netlify 대시보드에서 새 사이트 생성
2. GitHub 저장소 연결
3. 빌드 설정:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

### API 구조

- `/api/jisho-search` - Jisho API 프록시
- `/api/kanji-info` - Kanji API 프록시

### 문제 해결

**검색이 안 되는 경우:**
1. Netlify Functions가 제대로 배포되었는지 확인
2. 브라우저 개발자 도구에서 네트워크 탭 확인
3. Netlify Functions 로그 확인

**CORS 오류:**  
Netlify Functions를 통해 CORS 문제를 해결합니다. 여전히 문제가 있다면 `netlify.toml` 파일 설정과 Functions 배포 상태를 확인하세요.

---

<span id="japanese"></span>

## 🇯🇵 日本語

### 概要

日本語漢字学習のための検索ツールです。Jisho API と Kanji API を活用して、漢字と単語を検索できます。

### 主な機能

- **漢字検索** - JLPT レベル別フィルタリング対応
- **単語検索** - 日本語単語の検索と詳細情報
- **ランダム単語** - JLPT レベル別のランダム単語学習（Comprehensive / JLPT モード）
- **仮想キーボード** - 日本語入力対応
- **検索履歴** - 最近の検索語を保存
- **関連単語** - 漢字ごとの関連単語表示

### 技術スタック

- React + TypeScript
- Vite
- Netlify Functions（API プロキシ）
- Jisho API
- Kanji API

### 開発環境セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# Netlify Functions の依存関係インストール
cd netlify/functions && npm install

# Netlify Functions のローカルテスト
netlify dev
```

### デプロイ

このプロジェクトは Netlify Functions を使用して CORS の問題を解決しています。

**デプロイ前の準備:**

1. Netlify Functions の依存関係をインストール:
```bash
cd netlify/functions && npm install
```

2. プロジェクトのビルド:
```bash
npm run build
```

**Netlify へのデプロイ:**

1. Netlify ダッシュボードで新規サイトを作成
2. GitHub リポジトリを接続
3. ビルド設定:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

### API 構造

- `/api/jisho-search` - Jisho API プロキシ
- `/api/kanji-info` - Kanji API プロキシ

### トラブルシューティング

**検索ができない場合:**
1. Netlify Functions が正しくデプロイされているか確認
2. ブラウザの開発者ツールでネットワークタブを確認
3. Netlify Functions のログを確認

**CORS エラー:**  
Netlify Functions により CORS の問題を解決しています。問題が続く場合は `netlify.toml` の設定と Functions のデプロイ状態を確認してください。

---

<p align="center">
  <a href="#korean">↑ 한국어</a> · <a href="#japanese">↑ 日本語</a>
</p>
