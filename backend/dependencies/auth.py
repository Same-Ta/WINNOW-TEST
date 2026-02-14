from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth as firebase_auth
from config.firebase import get_db

security = HTTPBearer()


async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Firebase ID 토큰을 검증하고 사용자 정보를 반환합니다."""
    # Firebase 초기화 확인 (get_db 호출 시 초기화됨)
    get_db()
    
    token = credentials.credentials
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication"
        )
