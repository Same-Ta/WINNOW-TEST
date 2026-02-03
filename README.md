# WINNOW - 채용 공고 생성 플랫폼

AI 기반 채용 공고(JD) 생성 및 관리 플랫폼

## 기능

- 🤖 AI 기반 채용 공고 자동 생성
- 📝 실시간 미리보기 및 편집
- 🔐 Firebase 인증
- 💾 Firestore 데이터베이스
- 📱 반응형 디자인

## 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Google AI Configuration
VITE_GEMINI_API_KEY=your-gemini-api-key
```

## 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## Vercel 배포

### 1. Vercel CLI 사용

```bash
# Vercel CLI 설치 (전역)
npm install -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 2. Vercel 대시보드 사용

1. [Vercel](https://vercel.com)에 로그인
2. "Add New Project" 클릭
3. GitHub 레포지토리 연결
4. 환경 변수 설정:
   - Settings → Environment Variables에서 `.env` 파일의 모든 변수 추가
5. Deploy 클릭

### 환경 변수 설정 (Vercel)

Vercel 프로젝트 설정에서 다음 환경 변수를 추가해야 합니다:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_GEMINI_API_KEY`

## 기술 스택

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS
- **Build**: Vite
- **Backend**: Firebase (Auth, Firestore)
- **AI**: Google Gemini API
- **Deployment**: Vercel

## 프로젝트 구조

```
JDNEW/
├── src/
│   ├── components/     # 재사용 가능한 컴포넌트
│   ├── pages/          # 페이지 컴포넌트
│   ├── config/         # 설정 파일 (Firebase 등)
│   ├── constants/      # 상수
│   ├── utils/          # 유틸리티 함수
│   ├── App.tsx         # 메인 앱 컴포넌트
│   └── main.tsx        # 진입점
├── public/             # 정적 파일
├── .env                # 환경 변수 (gitignore됨)
├── vercel.json         # Vercel 배포 설정
└── package.json        # 프로젝트 의존성
```

## 라이선스

MIT
