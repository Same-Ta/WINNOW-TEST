# Winnow 배포 가이드

## 🚀 배포 아키텍처

- **프론트엔드**: Vercel
- **백엔드**: Render.com (또는 Railway, Google Cloud Run)

---

## 📦 1. 백엔드 배포 (Render)

### 1-1. Render 계정 생성
1. [Render.com](https://render.com) 가입
2. GitHub 연동

### 1-2. 새 Web Service 생성
1. **Dashboard** → **New** → **Web Service**
2. GitHub 리포지토리 연결
3. **Root Directory**: `backend` 입력
4. **Environment**: `Python 3`
5. **Build Command**: `pip install -r requirements.txt`
6. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### 1-3. 환경 변수 설정
**Environment** 탭에서 추가:

```env
GEMINI_API_KEY=your_actual_gemini_api_key

# Firebase (serviceAccountKey.json 내용을 환경변수로)
FIREBASE_PROJECT_ID=winnow-d0a4c
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...your_key...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@winnow-d0a4c.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your_email

FRONTEND_URL=https://your-app.vercel.app
```

### 1-4. 배포 완료
- 배포 URL 확인: `https://winnow-backend.onrender.com`

---

## 🎨 2. 프론트엔드 배포 (Vercel)

### 2-1. Vercel 프로젝트 생성
1. [Vercel](https://vercel.com) 가입
2. **Add New Project** → GitHub 리포지토리 선택

### 2-2. 프로젝트 설정
**Configure Project**:
- **Root Directory**: 비워둠 (루트의 `vercel.json` 사용)
- **Build Command**: 자동 감지
- **Output Directory**: 자동 감지

### 2-3. 환경 변수 설정
**Settings** → **Environment Variables**:

```env
VITE_API_BASE_URL=https://api.winnow.kr

# Firebase (Frontend)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=winnow-d0a4c.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=winnow-d0a4c
VITE_FIREBASE_STORAGE_BUCKET=winnow-d0a4c.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Gemini (Frontend용 - ChatInterface에서 사용)
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 2-4. 배포
- Git push 시 자동 배포
- 배포 URL: `https://your-app.vercel.app`

---

## 🔄 3. CORS 연결

백엔드에 프론트엔드 URL 등록 (이미 완료):

**Render 환경변수**:
```env
FRONTEND_URL=https://www.winnow.kr
```

---

## 🌐 4. 커스텀 도메인 설정 (선택)

### 백엔드 API 도메인 (Render)
1. Render 대시보드 → Settings → **Custom Domain**
2. `api.winnow.kr` 입력
3. **DNS 설정** (도메인 등록 업체에서):
   - Type: `CNAME`
   - Name: `api`
   - Value: `winnow-backend.onrender.com`
   - TTL: `3600`

### 프론트엔드 도메인 (Vercel)
- ✅ **이미 설정 완료**: `www.winnow.kr`

---

## ✅ 5. 배포 확인

### 백엔드 체크
```bash
curl https://api.winnow.kr/
# 또는
curl https://winnow-backend.onrender.com/
# 응답: {"message": "Winnow API is running", "version": "1.0.0"}
```

### 프론트엔드 체크
1. `https://www.winnow.kr` 접속
2. 로그인 시도
3. JD 생성 테스트

---

## 📝 6. 주의사항

### Render 무료 티어 제한
- **자동 sleep**: 15분 비활성 시 서버 중지 (첫 요청 시 재시작 ~30초 소요)
- **월 750시간 무료**: 충분함

### 해결책 (선택)
- **UptimeRobot** 등으로 5분마다 Health Check 요청 → Sleep 방지

---

## 🔧 로컬 개발

### 백엔드
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 프론트엔드
```bash
cd frontend
npm install
npm run dev
```

---

## 📂 파일 구조

```
JDNEW/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── Procfile              # Render 배포용
│   ├── runtime.txt           # Python 버전
│   ├── .env.example
│   └── serviceAccountKey.json (git에 포함 X)
├── frontend/
│   ├── package.json
│   ├── vercel.json
│   └── .env.example
├── vercel.json               # 루트 레벨
└── render.yaml               # Render 설정 (선택)
```

---

## 🎉 완료!

프론트엔드와 백엔드가 각각 Vercel/Render에 배포되어 통신합니다.
