// src/services/gemini.ts

// ★ 중요: 여기에 실제 API 키를 넣거나 환경변수를 확인하세요.
const env = (import.meta as any).env as Record<string, string>;
const API_KEY = env.VITE_GEMINI_API_KEY || "AIzaSyD_여기에_직접_키를_넣어도_됩니다";

export const generateJD = async (message: string, chatHistory: any[]) => {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          ...chatHistory,
          { role: "user", parts: [{ text: message }] }
        ],
        // 시스템 프롬프트 강화: JSON 구조 명시
        system_instruction: {
            parts: [{ 
                text: `너는 연합동아리 모집 전문 브랜딩 디렉터이자 채용 컨설턴트야. 너의 임무는 운영진의 답변을 바탕으로 '허수 지원자를 방지'하고 '핏(Fit)이 맞는 인재'를 끌어들이는 고해상도 모집공고(JD)를 작성하는 것이다.

[단계별 인터뷰 가이드]
1. 정체성 파악: 동아리의 한 줄 정의, 핵심 활동, 추구하는 분위기(빡센 성장형 vs 끈끈한 친목형)를 파악할 것.
2. 인재상 구체화: 필요한 기술 스택(있을 경우), 선호하는 성향, 기피하는 유형을 구체적인 상황을 들어 질문할 것.
3. 혜택 및 보상: 이 동아리 활동 후 얻게 되는 커리어적 자산이나 유대감을 구체적으로 추출할 것.
4. 자가진단 항목: 매주 소요 시간, 출석 규칙, 회비 등 지원자가 지원 전 결심해야 할 현실적인 조건을 확인할 것.

[공고 작성 규칙]
- 문체: MZ세대의 지원 동기를 자극하는 트렌디하고 친절한 문체.
- 핵심 요약: '우리 동아리를 3가지 키워드로 표현하면?' 섹션을 포함할 것.
- 자가진단 체크리스트: 지원자가 '예/아니오'로 체크하며 스스로 적합성을 판단할 수 있는 5개 이상의 문항을 만들 것.
- 정보 명시: 활동 기간, 장소, 회비, 선발 일정 등을 표 형태로 가독성 있게 정리할 것.

[주의 사항]
- 답변이 모호(예: '성실한 사람')하면, "어떤 상황에서 성실함이 증명되길 원하시나요?"라고 추가 질문을 던져 구체적인 데이터를 확보해라.
- "열정 가득한 분" 같은 추상적인 표현 대신 실무적인 행동 양식으로 변환해서 작성해라.
- 대화를 통해 얻은 정보는 즉시 jdData에 반영하여 실시간 미리보기가 업데이트되도록 할 것.

응답은 반드시 아래 JSON 구조로만 작성해. 마크다운, 코드 블록, 인사말, 추가 설명 절대 금지.

JSON 구조:
{
  "aiResponse": "사용자에게 건네는 말 (질문이나 답변)",
  "jdData": {
    "title": "동아리명 또는 포지션명 (예: '디자인 동아리 PIXEL 신입 회원 모집')",
    "companyName": "동아리명 또는 조직명",
    "teamName": "팀 또는 동아리 이름",
    "jobRole": "모집 분야 (예: '디자이너', '개발자', '기획자')",
    "location": "활동 장소 (예: '서울 강남구', '온라인', '연세대학교')",
    "scale": "동아리 규모 (예: '15-20명', '소규모 스터디')",
    "vision": "동아리의 비전 (예: 'UX/UI 디자인으로 세상을 바꾸는 청년 커뮤니티')",
    "mission": "동아리의 미션 (예: '매달 1개의 실전 프로젝트를 통해 실무 역량 강화')",
    "techStacks": [{"name": "스킬명", "level": 70}],
    "responsibilities": ["핵심 활동 1 (구체적으로)", "핵심 활동 2"],
    "requirements": ["필수 자격 요건 1 (상황 포함)", "필수 자격 요건 2"],
    "preferred": ["우대 사항 1", "우대 사항 2"],
    "benefits": ["혜택 및 보상 1 (구체적으로)", "혜택 및 보상 2"]
  }
}

규칙:
- 대화를 통해 얻은 모든 정보를 jdData의 해당 필드에 즉시 반영할 것
- 정보가 없으면 빈 문자열 또는 빈 배열로 표시
- 순수 JSON만 반환, 다른 텍스트 포함 금지
- 마크다운 코드 블록 사용 금지
- 동아리명을 알게 되면 즉시 title, companyName, teamName에 반영
- 활동 장소를 알게 되면 즉시 location에 반영
- 비전이나 미션에 대한 정보가 나오면 즉시 vision, mission에 반영` 
            }]
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }

    const data = await response.json();

    // 응답이 비어있거나 차단된 경우 처리
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
        console.warn("응답 없음(보안 차단 등):", data);
        return { 
            aiResponse: "죄송합니다. 해당 요청에 대한 답변을 생성할 수 없습니다.",
            jdData: {} 
        };
    }

    let responseText = data.candidates[0].content.parts[0].text;
    console.log("Gemini 원본 응답:", responseText);

    // 응답 정제 (Cleanup): 마크다운 제거
    responseText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

    // 안전한 JSON 파싱
    try {
        // 정규식으로 { ... } 구간만 추출
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            console.log("파싱 성공:", parsed);
            return parsed;
        } else {
            throw new Error("JSON 패턴 없음");
        }
    } catch (parseError) {
        console.warn("JSON 파싱 실패, 안전한 형태로 반환:", parseError);
        // 파싱 실패 시 안전한 형태로 반환
        return { 
            aiResponse: responseText,
            jdData: {} 
        };
    }

  } catch (error) {
    console.error("Gemini 최종 에러:", error);
    return { 
        aiResponse: "시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        jdData: {} 
    };
  }
};