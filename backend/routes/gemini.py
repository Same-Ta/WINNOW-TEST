from fastapi import APIRouter, HTTPException
import google.generativeai as genai
import json
import re

from config.gemini import GEMINI_API_KEY
from models.schemas import GeminiChatRequest

router = APIRouter(prefix="/api/gemini", tags=["Gemini AI"])


@router.post("/chat")
async def gemini_chat(request: GeminiChatRequest):
    """Gemini AI와 채팅하여 JD를 생성합니다."""
    try:
        if not GEMINI_API_KEY:
            raise HTTPException(
                status_code=500,
                detail="Gemini API 키가 설정되지 않았습니다. 관리자에게 문의하세요."
            )

        system_instruction = """You are 'Winnow Recruitment Master'. Respond ONLY in pure JSON format.

CRITICAL: NO markdown code blocks! Never use ```json or ``` in your response.

Response format (Korean text in aiResponse):
{"aiResponse":"한국어로 대화","options":["선택1","선택2","선택3","기타"],"jdData":{"title":"","companyName":"","teamName":"","jobRole":"","location":"","scale":"","vision":"","mission":"","responsibilities":[],"requirements":[],"preferred":[],"benefits":[]}}

Rules:
- Ask step-by-step questions in Korean
- Update jdData with all conversation info
- Provide 3-4 options every time
"""

        # gemini-2.5-flash: 최신 고성능 모델 (gemini-2.0-flash-exp는 존재하지 않음)
        model = genai.GenerativeModel(
            'gemini-2.5-flash',
            system_instruction=system_instruction,
            generation_config={
                "response_mime_type": "application/json"
            }
        )

        # 채팅 히스토리 변환
        history = []
        for msg in request.chatHistory:
            role = msg.get("role", "user")
            text = msg.get("text", "")
            if text:
                history.append({
                    "role": "user" if role == "user" else "model",
                    "parts": [text]
                })

        chat = model.start_chat(history=history)
        response = chat.send_message(request.message)
        
        # AI 응답 파싱 (순수 JSON 형식 기대)
        response_text = response.text.strip()
        
        # 디버깅: AI 응답 출력
        print(f"📥 AI Response: {response_text[:500]}...")
        
        try:
            # 마크다운 코드 블록 제거 (혹시 모를 경우 대비)
            if response_text.startswith("```"):
                response_text = re.sub(r'^```(?:json)?\s*|\s*```$', '', response_text, flags=re.MULTILINE).strip()
            
            # JSON 응답 파싱 시도
            parsed_response = json.loads(response_text)
            
            return {
                "aiResponse": parsed_response.get("aiResponse", response_text),
                "options": parsed_response.get("options", []),
                "jdData": parsed_response.get("jdData", {})
            }
        except json.JSONDecodeError as je:
            # JSON 파싱 실패
            print(f"⚠️ JSON 파싱 실패: {str(je)}")
            print(f"⚠️ 원본 응답: {response_text}")
            return {
                "aiResponse": response_text,
                "options": [],
                "jdData": {}
            }
    except Exception as e:
        print(f"❌ Gemini Chat Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"AI 응답 생성 중 오류가 발생했습니다: {str(e)}"
        )
