// 콜드 스타트 방지용 Keep-alive 스크립트
// Vercel Cron Jobs나 외부 서비스에서 5분마다 실행하도록 설정

const BACKEND_URL = process.env.BACKEND_URL || 'https://your-backend-url.render.com';

async function keepAlive() {
  try {
    const response = await fetch(`${BACKEND_URL}/keepalive`);
    const data = await response.json();
    console.log('✅ Keep-alive success:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Keep-alive failed:', error);
    return { success: false, error };
  }
}

// Vercel Edge Function으로 사용할 경우
export default async function handler(req, res) {
  const result = await keepAlive();
  
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(500).json(result);
  }
}

// Node.js에서 직접 실행하는 경우
if (require.main === module) {
  keepAlive().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}