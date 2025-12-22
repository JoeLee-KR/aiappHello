# SimpleWeb - 자기소개 페이지

순수 Node.js로 만든 간단한 웹 서버입니다.

## 실행 방법

```bash
cd 00_cursor_node/simpleweb
node server.js
```

브라우저에서 `http://localhost:3000` 접속

## 구조

- `server.js`: HTTP 서버 (Python의 `http.server`와 유사)
- `index.html`: 자기소개 페이지
- `style.css`: 스타일시트

## 설명

이 프로젝트는 순수 Node.js의 `http` 모듈만 사용합니다 (Python의 `http.server`와 유사).
Express 같은 프레임워크 없이도 간단한 웹 서버를 만들 수 있습니다.

