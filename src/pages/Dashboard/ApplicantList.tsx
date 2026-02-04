import { useState, useEffect } from 'react';
import { Filter, Download, X, Sparkles, FileText } from 'lucide-react';
import { db, auth } from '@/config/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import * as XLSX from 'xlsx';

interface Application {
    id: string;
    applicantName: string;
    applicantEmail: string;
    applicantPhone?: string;
    applicantGender?: string;
    jdTitle: string;
    requirementAnswers?: Array<{ question: string; checked: boolean; detail: string; answer?: string }>;
    preferredAnswers?: Array<{ question: string; checked: boolean; detail: string; answer?: string }>;
    appliedAt: any;
    status: string;
}

export const ApplicantList = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    
    // AI 스크리닝 리포트 관련 상태
    const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
    const [aiSummary, setAiSummary] = useState<string>('');
    const [summaryLoading, setSummaryLoading] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                console.log('로그인된 사용자가 없습니다.');
                setLoading(false);
                return;
            }

            console.log('지원서 불러오는 중...', currentUser.uid);

            const applicationsQuery = query(
                collection(db, 'applications'),
                where('recruiterId', '==', currentUser.uid)
            );

            const snapshot = await getDocs(applicationsQuery);
            const applicationsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Application[];

            // 클라이언트 측에서 날짜순 정렬
            applicationsData.sort((a, b) => {
                const dateA = a.appliedAt?.toDate ? a.appliedAt.toDate().getTime() : 0;
                const dateB = b.appliedAt?.toDate ? b.appliedAt.toDate().getTime() : 0;
                return dateB - dateA;
            });

            console.log('불러온 지원서:', applicationsData.length, '건');
            setApplications(applicationsData);
        } catch (error) {
            console.error('지원서 로딩 실패:', error);
            alert('지원서를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (applicationId: string, newStatus: string) => {
        try {
            const applicationRef = doc(db, 'applications', applicationId);
            await updateDoc(applicationRef, { status: newStatus });

            // 로컬 상태 업데이트
            setApplications(prev =>
                prev.map(app =>
                    app.id === applicationId ? { ...app, status: newStatus } : app
                )
            );
        } catch (error) {
            console.error('상태 업데이트 실패:', error);
            alert('상태 업데이트에 실패했습니다.');
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    };

    // AI 요약 생성 함수
    const generateAISummary = async (application: Application) => {
        setSummaryLoading(true);
        try {
            const env = (import.meta as any).env as Record<string, string>;
            const API_KEY = env.VITE_GEMINI_API_KEY || "";
            
            if (!API_KEY) {
                setAiSummary('API 키가 설정되지 않았습니다. .env 파일에 VITE_GEMINI_API_KEY를 추가해주세요.');
                setSummaryLoading(false);
                return;
            }

            // 답변 텍스트 생성
            let answersText = ``;
            
            if (application.requirementAnswers && application.requirementAnswers.length > 0) {
                answersText += `[자격 요건 답변]\n`;
                application.requirementAnswers.forEach(a => {
                    const status = a.answer === 'Y' ? '✓ 충족' : '✗ 미충족';
                    const detail = a.detail ? ` - 상세: ${a.detail}` : '';
                    answersText += `${status} ${a.question}${detail}\n`;
                });
                answersText += `\n`;
            }
            
            if (application.preferredAnswers && application.preferredAnswers.length > 0) {
                answersText += `[우대 사항 답변]\n`;
                application.preferredAnswers.forEach(a => {
                    const status = a.answer === 'Y' ? '✓ 충족' : '✗ 미충족';
                    const detail = a.detail ? ` - 상세: ${a.detail}` : '';
                    answersText += `${status} ${a.question}${detail}\n`;
                });
            }

            const prompt = `[시스템 역할]
당신은 스타트업과 창업 팀의 초기 멤버를 선발하는 전문 채용 컨설턴트입니다. 지원자의 답변을 바탕으로 **[역량(Skill)]**과 **[의지(Will)]**를 분석하여 4가지 유형으로 분류하고, 우리 조직과의 적합성을 평가하세요.

[분석 기준 - 2x2 Matrix]
- **Star (High Skill / High Will)**: 구체적인 성과 지표를 제시하며, 스스로 문제를 정의하고 해결책을 찾아 실행하는 '압도적 실행가'
- **Expert (High Skill / Low Will)**: 기술적 수준은 높으나 수동적이며, 보상이나 조건에 민감하고 팀의 비전보다는 개인의 과업에 집중하는 '냉소적 전문가'
- **Prospect (Low Skill / High Will)**: 현재 기술은 부족하나 학습 속도가 빠르고, 팀의 성장을 위해 궂은일도 마다하지 않는 '폭발적 성장주'
- **Risk (Low Skill / Low Will)**: 답변이 모호하고 구체적 경험이 없으며, 개선 의지나 직무에 대한 이해도가 모두 낮은 '비적합 대상'

---

[지원자 정보]
- 이름: ${application.applicantName}
- 포지션: ${application.jdTitle}

[지원자 답변]
${answersText}

---

위 내용을 바탕으로 아래 형식으로 분석 결과를 작성해주세요:

## 🔍 지원자 심층 분석 결과: ${application.applicantName}

### 1. 사분면 위치 및 종합 평가
> **분류: [Star / Expert / Prospect / Risk]**
> **한줄 요약:** (핵심 특징을 한 문장으로)

### 2. 역량/의지 세부 판별 근거
| 항목 | 평가 | 핵심 근거 |
|:---|:---|:---|
| **직무 역량** | 상/중/하 | (지원자 답변 기반) |
| **문제 해결** | 상/중/하 | (구체적 근거) |
| **학습 의지** | 상/중/하 | (구체적 근거) |
| **협업 태도** | 상/중/하 | (구체적 근거) |

### 3. 조직 적합도 체크리스트
- **스타트업 마인드셋:** [예/아니오] - (근거)
- **자기 주도성:** [예/아니오] - (근거)
- **커뮤니케이션:** [예/아니오] - (근거)

### 4. 채용 가이드 및 리스크 관리
**💡 강점:** (이 사람이 합류했을 때 팀에 가져올 긍정적 변화)

**⚠️ 주의점:** (관리 시 주의해야 할 리스크나 매니징 포인트)

**🙋 추가 질문 추천:** (부족한 부분을 확인하기 위해 면접 시 필요한 질문 2-3개)

---
마크다운 형식으로 깔끔하게 작성해주세요.`;

            // fetch API 직접 사용
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
            
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: prompt }] }]
                }),
            });

            if (!response.ok) {
                throw new Error(`API 호출 실패: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
                throw new Error('응답 없음');
            }

            const summary = data.candidates[0].content.parts[0].text;
            setAiSummary(summary);
        } catch (error) {
            console.error('AI 요약 생성 실패:', error);
            setAiSummary('AI 요약 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setSummaryLoading(false);
        }
    };

    // 지원자 클릭 핸들러
    const handleApplicantClick = (application: Application) => {
        setSelectedApplicant(application);
        setAiSummary('');
        generateAISummary(application);
    };

    // 모달 닫기
    const closeModal = () => {
        setSelectedApplicant(null);
        setAiSummary('');
    };

    // 엑셀 다운로드 함수
    const handleExcelDownload = () => {
        try {
            // 엑셀로 변환할 데이터 준비
            const excelData = filteredApplications.map((app, index) => {
                // 자격요건 답변 정리
                const requirementAnswers = app.requirementAnswers?.map(ans => 
                    `${ans.question}: ${ans.answer === 'Y' ? '충족' : '미충족'}`
                ).join('\n') || '-';

                // 우대사항 답변 정리
                const preferredAnswers = app.preferredAnswers?.map(ans => 
                    `${ans.question}: ${ans.answer === 'Y' ? '충족' : '미충족'}`
                ).join('\n') || '-';

                return {
                    '번호': index + 1,
                    '지원자명': app.applicantName || '-',
                    '이메일': app.applicantEmail || '-',
                    '전화번호': app.applicantPhone || '-',
                    '성별': app.applicantGender || '-',
                    '지원 포지션': app.jdTitle || '-',
                    '지원일': formatDate(app.appliedAt),
                    '상태': app.status || '검토중',
                    '자격요건': requirementAnswers,
                    '우대사항': preferredAnswers
                };
            });

            // 워크시트 생성
            const worksheet = XLSX.utils.json_to_sheet(excelData);

            // 열 너비 설정
            const columnWidths = [
                { wch: 5 },   // 번호
                { wch: 12 },  // 지원자명
                { wch: 25 },  // 이메일
                { wch: 15 },  // 전화번호
                { wch: 8 },   // 성별
                { wch: 30 },  // 지원 포지션
                { wch: 12 },  // 지원일
                { wch: 10 },  // 상태
                { wch: 50 },  // 자격요건
                { wch: 50 }   // 우대사항
            ];
            worksheet['!cols'] = columnWidths;

            // 워크북 생성
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, '지원자 목록');

            // 파일명 생성 (현재 날짜 포함)
            const today = new Date();
            const dateString = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
            const fileName = `지원자_목록_${dateString}.xlsx`;

            // 파일 다운로드
            XLSX.writeFile(workbook, fileName);

            console.log('엑셀 다운로드 완료:', fileName);
        } catch (error) {
            console.error('엑셀 다운로드 실패:', error);
            alert('엑셀 파일 생성 중 오류가 발생했습니다.');
        }
    };

    const filteredApplications = statusFilter === 'all'
        ? applications
        : applications.filter(app => app.status === statusFilter);

    const statusOptions = ['검토중', '합격', '불합격'];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">로딩 중...</p>
                </div>
            </div>
        );
    }

    return (
     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[600px] flex flex-col max-w-[1200px] mx-auto">
         <div className="p-6 border-b border-gray-100 flex justify-between items-center">
             <div>
                <h3 className="font-bold text-lg text-gray-900">지원자 리스트</h3>
                <p className="text-xs text-gray-400 mt-1">총 {filteredApplications.length}명의 지원자가 있습니다.</p>
             </div>
             <div className="flex gap-2 relative">
                 <button 
                     onClick={() => setShowFilterMenu(!showFilterMenu)}
                     className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-medium text-gray-600 transition-colors"
                 >
                     <Filter size={16}/> 필터 {statusFilter !== 'all' && `(${statusFilter})`}
                 </button>
                 
                 {showFilterMenu && (
                     <div className="absolute top-12 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-2 w-40">
                         <button
                             onClick={() => {
                                 setStatusFilter('all');
                                 setShowFilterMenu(false);
                             }}
                             className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                         >
                             전체 보기
                         </button>
                         {statusOptions.map(status => (
                             <button
                                 key={status}
                                 onClick={() => {
                                     setStatusFilter(status);
                                     setShowFilterMenu(false);
                                 }}
                                 className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                             >
                                 {status}
                             </button>
                         ))}
                     </div>
                 )}
                 
                 <button 
                     onClick={handleExcelDownload}
                     className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-medium text-gray-600 transition-colors"
                 >
                     <Download size={16}/> 엑셀 다운로드
                 </button>
             </div>
         </div>
         <div className="flex-1 overflow-auto">
             <table className="w-full text-left text-sm text-gray-600">
                 <thead className="bg-[#F8FAFC] text-[11px] uppercase font-bold text-gray-400 tracking-wider">
                     <tr>
                         <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/></th>
                         <th className="px-6 py-4">이름</th>
                         <th className="px-6 py-4">지원 포지션</th>
                         <th className="px-6 py-4">성별</th>
                         <th className="px-6 py-4">지원 일시</th>
                         <th className="px-6 py-4">작성 내용</th>
                         <th className="px-6 py-4 text-center">상태</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                     {filteredApplications.length === 0 ? (
                         <tr>
                             <td colSpan={7} className="px-6 py-20 text-center text-gray-400">
                                 {statusFilter === 'all' ? '아직 지원자가 없습니다.' : `${statusFilter} 상태의 지원자가 없습니다.`}
                             </td>
                         </tr>
                     ) : (
                         filteredApplications.map((application) => (
                             <tr key={application.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer">
                                 <td className="px-6 py-5"><input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" onClick={(e) => e.stopPropagation()}/></td>
                                 <td className="px-6 py-5" onClick={() => handleApplicantClick(application)}>
                                     <div className="font-bold text-[14px] text-gray-900">{application.applicantName}</div>
                                     <div className="text-[11px] text-gray-400">{application.applicantEmail}</div>
                                 </td>
                                 <td className="px-6 py-5" onClick={() => handleApplicantClick(application)}>
                                     <div className="text-[13px] font-medium text-gray-700">{application.jdTitle}</div>
                                 </td>
                                 <td className="px-6 py-5 text-[13px] text-gray-600" onClick={() => handleApplicantClick(application)}>{application.applicantGender || '-'}</td>
                                 <td className="px-6 py-5 text-[13px] text-gray-400" onClick={() => handleApplicantClick(application)}>{formatDate(application.appliedAt)}</td>
                                 <td className="px-6 py-5">
                                     <button
                                         onClick={(e) => {
                                             e.stopPropagation();
                                             handleApplicantClick(application);
                                         }}
                                         className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-[12px] font-medium"
                                     >
                                         <Sparkles size={14} />
                                         AI 분석
                                     </button>
                                 </td>
                                 <td className="px-6 py-5">
                                     <div className="flex justify-center gap-1">
                                         <button
                                             onClick={(e) => {
                                                 e.stopPropagation();
                                                 handleStatusChange(application.id, '합격');
                                             }}
                                             className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                                                 application.status === '합격' 
                                                     ? 'bg-green-500 text-white shadow-md' 
                                                     : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-600'
                                             }`}
                                         >
                                             합격
                                         </button>
                                         <button
                                             onClick={(e) => {
                                                 e.stopPropagation();
                                                 handleStatusChange(application.id, '불합격');
                                             }}
                                             className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                                                 application.status === '불합격' 
                                                     ? 'bg-red-500 text-white shadow-md' 
                                                     : 'bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600'
                                             }`}
                                         >
                                             불합격
                                         </button>
                                     </div>
                                 </td>
                             </tr>
                         ))
                     )}
                 </tbody>
             </table>
         </div>

         {/* AI 스크리닝 리포트 모달 */}
         {selectedApplicant && (
             <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
                 <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                     {/* 모달 헤더 */}
                     <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
                         <div className="flex justify-between items-start">
                             <div>
                                 <div className="flex items-center gap-2 mb-2">
                                     <Sparkles size={24} className="fill-white" />
                                     <h2 className="text-2xl font-bold">AI 스크리닝 리포트</h2>
                                 </div>
                                 <p className="text-blue-100 text-sm">{selectedApplicant.applicantName} · {selectedApplicant.jdTitle}</p>
                             </div>
                             <button onClick={closeModal} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                                 <X size={24} />
                             </button>
                         </div>
                     </div>

                     {/* 모달 본문 */}
                     <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                         {/* AI 요약 섹션 */}
                         <div className="mb-8">
                             <div className="flex items-center gap-2 mb-4">
                                 <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                     <Sparkles size={18} className="text-blue-600" />
                                 </div>
                                 <h3 className="text-lg font-bold text-gray-900">AI 자동 요약</h3>
                             </div>
                             
                             {summaryLoading ? (
                                 <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                     <div className="flex items-center gap-3">
                                         <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                         <p className="text-gray-600">AI가 지원자 답변을 분석하고 있습니다...</p>
                                     </div>
                                 </div>
                             ) : (
                                 <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                                     <div className="prose prose-sm max-w-none">
                                         <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                                             {aiSummary || 'AI 요약을 생성하는 중입니다...'}
                                         </div>
                                     </div>
                                 </div>
                             )}
                         </div>

                         {/* 전체 답변 내용 섹션 */}
                         <div>
                             <div className="flex items-center gap-2 mb-4">
                                 <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                     <FileText size={18} className="text-gray-600" />
                                 </div>
                                 <h3 className="text-lg font-bold text-gray-900">전체 답변 내용</h3>
                             </div>
                             
                             <div className="space-y-6">
                                 {/* 자격 요건 */}
                                 {selectedApplicant.requirementAnswers && selectedApplicant.requirementAnswers.length > 0 && (
                                     <div className="bg-white rounded-xl p-5 border border-gray-200">
                                         <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                             <span className="text-blue-600">✓</span> 자격 요건
                                         </h4>
                                         <div className="space-y-2">
                                             {selectedApplicant.requirementAnswers.map((answer, index) => (
                                                 <div key={index} className="flex items-center gap-2">
                                                     <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                                         answer.answer === 'Y' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                                                     }`}>
                                                         {answer.answer === 'Y' ? '✓' : '✗'}
                                                     </span>
                                                     <p className="text-gray-700">{answer.question}</p>
                                                 </div>
                                             ))}
                                         </div>
                                     </div>
                                 )}

                                 {/* 우대 사항 */}
                                 {selectedApplicant.preferredAnswers && selectedApplicant.preferredAnswers.length > 0 && (
                                     <div className="bg-white rounded-xl p-5 border border-gray-200">
                                         <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                             <span className="text-purple-600">★</span> 우대 사항
                                         </h4>
                                         <div className="space-y-2">
                                             {selectedApplicant.preferredAnswers.map((answer, index) => (
                                                 <div key={index} className="flex items-center gap-2">
                                                     <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                                         answer.answer === 'Y' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'
                                                     }`}>
                                                         {answer.answer === 'Y' ? '✓' : '✗'}
                                                     </span>
                                                     <p className="text-gray-700">{answer.question}</p>
                                                 </div>
                                             ))}
                                         </div>
                                     </div>
                                 )}
                             </div>
                         </div>
                     </div>

                     {/* 모달 푸터 */}
                     <div className="border-t border-gray-100 p-6 bg-gray-50">
                         <div className="flex justify-between items-center">
                             <div className="text-sm text-gray-500">
                                 <span className="font-medium">지원일:</span> {formatDate(selectedApplicant.appliedAt)}
                             </div>
                             <button onClick={closeModal} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                                 닫기
                             </button>
                         </div>
                     </div>
                 </div>
             </div>
         )}
     </div>
    );
};

