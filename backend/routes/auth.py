from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import auth as firebase_auth, firestore as firebase_firestore

from config.firebase import db
from dependencies.auth import verify_token
from models.schemas import UserRegister

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/register")
async def register(user: UserRegister):
    """새 사용자를 등록합니다."""
    try:
        user_record = firebase_auth.create_user(
            email=user.email,
            password=user.password,
            display_name=user.nickname or user.email.split('@')[0]
        )

        db.collection('users').document(user_record.uid).set({
            'email': user.email,
            'nickname': user.nickname or user.email.split('@')[0],
            'createdAt': firebase_firestore.SERVER_TIMESTAMP
        })

        return {
            "uid": user_record.uid,
            "email": user.email,
            "message": "User registered successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/google-login")
async def google_login(user_data: dict = Depends(verify_token)):
    """Google 로그인 사용자의 Firestore 문서를 생성/업데이트합니다."""
    try:
        uid = user_data['uid']
        email = user_data.get('email', '')
        name = user_data.get('name', '') or email.split('@')[0]
        picture = user_data.get('picture', '')

        user_ref = db.collection('users').document(uid)
        user_doc = user_ref.get()

        if not user_doc.exists:
            # 신규 Google 사용자: Firestore 문서 생성
            user_ref.set({
                'email': email,
                'nickname': name,
                'photoURL': picture,
                'provider': 'google',
                'createdAt': firebase_firestore.SERVER_TIMESTAMP
            })
        else:
            # 기존 사용자: 최근 로그인 시간 업데이트
            user_ref.update({
                'lastLoginAt': firebase_firestore.SERVER_TIMESTAMP,
                'photoURL': picture,
            })

        return {
            "uid": uid,
            "email": email,
            "nickname": name,
            "message": "Google login synced successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me")
async def get_current_user(user_data: dict = Depends(verify_token)):
    """현재 로그인한 사용자 정보를 반환합니다."""
    try:
        user_doc = db.collection('users').document(user_data['uid']).get()
        if user_doc.exists:
            return {"uid": user_data['uid'], **user_doc.to_dict()}
        return {"uid": user_data['uid'], "email": user_data.get('email')}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
