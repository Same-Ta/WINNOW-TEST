from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import firestore as firebase_firestore

from config.firebase import get_db
from dependencies.auth import verify_token
from models.schemas import JDCreate, JDUpdate

router = APIRouter(prefix="/api/jds", tags=["JDs"])


@router.post("")
async def create_jd(jd: JDCreate, user_data: dict = Depends(verify_token)):
    """새 JD를 생성합니다."""
    try:
        jd_data = jd.dict()
        jd_data['userId'] = user_data['uid']
        jd_data['createdAt'] = firebase_firestore.SERVER_TIMESTAMP
        jd_data['updatedAt'] = firebase_firestore.SERVER_TIMESTAMP

        doc_ref = get_db().collection('jds').document()
        doc_ref.set(jd_data)

        return {"id": doc_ref.id, "message": "JD created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("")
async def get_jds(user_data: dict = Depends(verify_token)):
    """현재 사용자의 모든 JD를 반환합니다 (소유 + 협업 포함)."""
    try:
        uid = user_data['uid']
        user_email = user_data.get('email', '').lower()
        jds = []
        seen_ids = set()

        # 1. 자신이 소유한 JD
        own_ref = get_db().collection('jds').where('userId', '==', uid)
        for doc in own_ref.stream():
            jd_data = doc.to_dict()
            jd_data['id'] = doc.id
            jd_data['_role'] = 'owner'
            jds.append(jd_data)
            seen_ids.add(doc.id)

        # 2. 협업자로 초대된 JD (UID 기반)
        collab_ref = get_db().collection('jds').where('collaboratorIds', 'array_contains', uid)
        for doc in collab_ref.stream():
            if doc.id not in seen_ids:
                jd_data = doc.to_dict()
                jd_data['id'] = doc.id
                jd_data['_role'] = 'collaborator'
                jds.append(jd_data)
                seen_ids.add(doc.id)

        # 3. 이메일로 초대되었지만 UID가 아직 연결 안 된 JD (폴백)
        if user_email:
            email_ref = get_db().collection('jds').where('collaboratorEmails', 'array_contains', user_email)
            for doc in email_ref.stream():
                if doc.id not in seen_ids:
                    jd_data = doc.to_dict()
                    jd_data['id'] = doc.id
                    jd_data['_role'] = 'collaborator'
                    jds.append(jd_data)
                    seen_ids.add(doc.id)

                    # UID를 collaboratorIds에 자동 추가 (마이그레이션)
                    try:
                        doc.reference.update({
                            'collaboratorIds': firebase_firestore.ArrayUnion([uid])
                        })
                        # collaborators 배열의 해당 항목에도 uid 업데이트
                        collabs = jd_data.get('collaborators', [])
                        updated = False
                        for c in collabs:
                            if c.get('email', '').lower() == user_email and not c.get('uid'):
                                c['uid'] = uid
                                updated = True
                        if updated:
                            doc.reference.update({'collaborators': collabs})
                    except Exception:
                        pass  # 마이그레이션 실패해도 JD 목록은 정상 반환

        return jds
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{jd_id}")
async def get_jd(jd_id: str):
    """특정 JD를 반환합니다."""
    try:
        doc = get_db().collection('jds').document(jd_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="JD not found")
        jd_data = doc.to_dict()
        jd_data['id'] = doc.id
        return jd_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{jd_id}")
async def update_jd(jd_id: str, jd: JDUpdate, user_data: dict = Depends(verify_token)):
    """JD를 수정합니다."""
    try:
        doc_ref = get_db().collection('jds').document(jd_id)
        doc = doc_ref.get()

        if not doc.exists:
            raise HTTPException(status_code=404, detail="JD not found")

        if doc.to_dict().get('userId') != user_data['uid']:
            raise HTTPException(status_code=403, detail="Not authorized")

        update_data = {k: v for k, v in jd.dict().items() if v is not None}
        update_data['updatedAt'] = firebase_firestore.SERVER_TIMESTAMP
        doc_ref.update(update_data)

        return {"message": "JD updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{jd_id}")
async def delete_jd(jd_id: str, user_data: dict = Depends(verify_token)):
    """JD를 삭제합니다."""
    try:
        doc_ref = get_db().collection('jds').document(jd_id)
        doc = doc_ref.get()

        if not doc.exists:
            raise HTTPException(status_code=404, detail="JD not found")

        if doc.to_dict().get('userId') != user_data['uid']:
            raise HTTPException(status_code=403, detail="Not authorized")

        doc_ref.delete()
        return {"message": "JD deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
