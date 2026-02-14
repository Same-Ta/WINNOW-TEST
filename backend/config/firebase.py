import firebase_admin
from firebase_admin import credentials, firestore, storage
import os
from typing import Optional, Any

# 지연 초기화를 위한 변수들
_db: Optional[firestore.Client] = None
_bucket: Optional[Any] = None

def _initialize_firebase():
    """Firebase Admin SDK 지연 초기화"""
    if not firebase_admin._apps:
        # 환경 변수에서 Firebase 인증 정보 로드
        private_key = os.getenv("FIREBASE_PRIVATE_KEY", "")
        
        # 줄바꿈 문자 변환 (\n을 실제 줄바꿈으로)
        private_key = private_key.replace("\\n", "\n")
        
        firebase_config = {
            "type": "service_account",
            "project_id": os.getenv("FIREBASE_PROJECT_ID"),
            "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
            "private_key": private_key,
            "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
            "client_id": os.getenv("FIREBASE_CLIENT_ID"),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{os.getenv('FIREBASE_CLIENT_EMAIL')}"
        }
        
        storage_bucket = os.getenv("FIREBASE_STORAGE_BUCKET", "")
        
        cred = credentials.Certificate(firebase_config)
        
        init_options = {}
        if storage_bucket:
            init_options['storageBucket'] = storage_bucket
        
        firebase_admin.initialize_app(cred, init_options)

def get_db() -> firestore.Client:
    """지연 초기화된 Firestore 클라이언트 반환"""
    global _db
    if _db is None:
        _initialize_firebase()
        _db = firestore.client()
    return _db

def get_bucket() -> Optional[Any]:
    """지연 초기화된 Storage 버킷 반환"""
    global _bucket
    if _bucket is None and os.getenv("FIREBASE_STORAGE_BUCKET"):
        _initialize_firebase()
        _bucket = storage.bucket()
    return _bucket

# 하위 호환성을 위한 별칭
db = property(lambda self: get_db())
bucket = property(lambda self: get_bucket())
