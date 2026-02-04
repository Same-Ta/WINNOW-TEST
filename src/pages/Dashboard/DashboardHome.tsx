import { Plus, Users, FileText, ChevronRight, X } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { useState, useEffect } from 'react';
import { db, auth } from '@/config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface DashboardHomeProps {
  onNavigate: (page: string) => void;
}

interface JD {
  id: string;
  title: string;
  department?: string;
  location?: string;
  status?: string;
  createdAt?: any;
}

interface StatusStats {
    total: number;
    passed: number;
    pending: number;
    rejected: number;
    reviewing: number;
    thisMonth: number;
}

interface DailyCount {
    date: string;
    count: number;
}

export const DashboardHome = ({ onNavigate }: DashboardHomeProps) => {
    const [userName, setUserName] = useState('채용 담당자');
    const [userEmail, setUserEmail] = useState('');
    const [activeJDs, setActiveJDs] = useState<JD[]>([]);
    const [stats, setStats] = useState<StatusStats>({
        total: 0,
        passed: 0,
        pending: 0,
        rejected: 0,
        reviewing: 0,
        thisMonth: 0
    });
    const [dailyData, setDailyData] = useState<DailyCount[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            const name = currentUser.displayName || currentUser.email?.split('@')[0] || '채용 담당자';
            setUserName(name);
            setUserEmail(currentUser.email || '');
            
            fetchActiveJDs(currentUser.uid);
            fetchAnalytics();
        }
    }, []);

    const fetchActiveJDs = async (userId: string) => {
        try {
            const jdQuery = query(
                collection(db, 'jds'),
                where('userId', '==', userId)
            );

            const snapshot = await getDocs(jdQuery);
            const jds = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as JD[];

            const sortedJDs = jds.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
                return dateB.getTime() - dateA.getTime();
            }).slice(0, 4);

            setActiveJDs(sortedJDs);
        } catch (error) {
            console.error('JD 로딩 실패:', error);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                setLoading(false);
                return;
            }

            const applicationsQuery = query(
                collection(db, 'applications'),
                where('recruiterId', '==', currentUser.uid)
            );

            const snapshot = await getDocs(applicationsQuery);
            const applications = snapshot.docs.map(doc => doc.data());

            let passed = 0;
            let pending = 0;
            let rejected = 0;
            let reviewing = 0;
            let thisMonth = 0;

            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const last7Days: { [key: string]: number } = {};
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                last7Days[dateStr] = 0;
            }

            applications.forEach(app => {
                if (app.status === '합격') passed++;
                else if (app.status === '보류') pending++;
                else if (app.status === '불합격') rejected++;
                else if (app.status === '검토중') reviewing++;

                if (app.appliedAt) {
                    const appliedDate = app.appliedAt.toDate ? app.appliedAt.toDate() : new Date(app.appliedAt);
                    if (appliedDate.getMonth() === currentMonth && appliedDate.getFullYear() === currentYear) {
                        thisMonth++;
                    }

                    const dateStr = appliedDate.toISOString().split('T')[0];
                    if (last7Days.hasOwnProperty(dateStr)) {
                        last7Days[dateStr]++;
                    }
                }
            });

            setStats({
                total: applications.length,
                passed,
                pending,
                rejected,
                reviewing,
                thisMonth
            });

            const chartData = Object.keys(last7Days).map(date => ({
                date,
                count: last7Days[date]
            }));
            setDailyData(chartData);

        } catch (error) {
            console.error('통계 로딩 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const generatePath = () => {
        if (dailyData.length === 0) return "M0,130 L400,130";
        
        const maxCount = Math.max(...dailyData.map(d => d.count), 1);
        const points = dailyData.map((d, i) => {
            const x = (i / (dailyData.length - 1)) * 400;
            const y = 150 - (d.count / maxCount) * 120;
            return { x, y };
        });

        let path = `M${points[0].x},${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const cpX = (prev.x + curr.x) / 2;
            path += ` Q${cpX},${prev.y} ${curr.x},${curr.y}`;
        }
        return path;
    };

    const mainPath = generatePath();
    const areaPath = mainPath + " V150 H0 Z";

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">대시보드 로딩 중...</p>
                </div>
            </div>
        );
    }
    return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-10">
        <div className="flex justify-between items-end">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">안녕하세요, {userName}님!</h2>
                <p className="text-gray-500 text-sm mt-1.5 font-medium">오늘도 좋은 인재를 찾기 위한 준비가 되셨나요?</p>
            </div>
            <button onClick={() => onNavigate('chat')} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95">
                <Plus size={18} strokeWidth={3} /> 새 JD 만들기
            </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white p-7 rounded-3xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2.5 text-base">
                    <Users size={18} className="text-blue-600 fill-blue-600"/> 내 프로필
                </h3>
                <button className="text-[11px] font-bold bg-[#111827] text-white px-3.5 py-1.5 rounded-full hover:bg-black transition-colors">변경사항 저장</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-5">
                    <div>
                        <label className="text-[11px] font-bold text-gray-400 mb-1.5 block tracking-wide">이름</label>
                        <input type="text" value={userName} readOnly className="w-full h-11 px-3 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 focus:outline-none focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                        <label className="text-[11px] font-bold text-gray-400 mb-1.5 block tracking-wide">직책/소속</label>
                        <input type="text" placeholder="직책을 입력해주세요" className="w-full h-11 px-3 bg-white border border-gray-200 rounded-lg text-[13px] font-medium placeholder:text-gray-300 focus:outline-none focus:border-blue-500 transition-colors" />
                    </div>
                    <div className="bg-blue-50/80 h-11 px-3 rounded-lg flex items-center text-[12px] font-medium text-blue-600 truncate border border-blue-100">{userEmail}</div>
                </div>
                
                <div className="space-y-3">
                     <label className="text-[11px] font-bold text-gray-400 mb-1.5 block tracking-wide">보유 스킬</label>
                     <div className="flex flex-wrap gap-2">
                         {['채용 전략', '인터뷰', 'HR 데이터 분석'].map(skill => (
                             <span key={skill} className="bg-white h-9 px-3 rounded-lg text-[12px] font-medium text-gray-600 border border-gray-200 flex items-center gap-1.5 hover:border-blue-300 transition-colors cursor-default">
                                {skill} <X size={12} className="text-gray-300 cursor-pointer hover:text-red-500"/>
                             </span>
                         ))}
                         <button className="h-9 px-3 rounded-lg text-[12px] font-medium text-gray-400 border border-dashed border-gray-300 hover:border-blue-400 hover:text-blue-500 transition-all bg-gray-50/50">
                            + 추가
                         </button>
                     </div>
                     <div className="pt-4">
                        <label className="text-[11px] font-bold text-gray-400 mb-1.5 block tracking-wide">한줄 소개</label>
                         <textarea className="w-full h-[88px] p-3 bg-white border border-gray-200 rounded-lg text-[13px] resize-none focus:outline-none focus:border-blue-500 transition-colors"></textarea>
                     </div>
                </div>

                <div>
                    <label className="text-[11px] font-bold text-gray-400 mb-2 block tracking-wide">이력서 관리</label>
                    <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between mb-3 bg-white hover:border-blue-200 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center"><FileText size={20}/></div>
                            <div>
                                <div className="text-[13px] font-bold text-gray-800">kim_recruiter_resume.pdf</div>
                                <div className="text-[11px] text-gray-400 mt-0.5">4.5 MB • 2024.10.20 업데이트</div>
                            </div>
                        </div>
                        <button className="text-gray-300 hover:text-gray-500"><X size={16}/></button>
                    </div>
                    <button className="w-full h-12 border border-dashed border-gray-300 text-gray-500 rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-400 transition-all">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center"><Plus size={12}/></div>
                        새 이력서 업로드
                    </button>
                </div>
            </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { label: '진행 중인 공고', val: '4 개', inc: '+4건', icon: FileText },
                { label: '신규 지원자', val: '142 명', inc: '+12명', icon: Users },
            ].map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative group hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex justify-between items-start mb-6">
                        <div className="bg-gray-50 p-2.5 rounded-xl group-hover:bg-blue-50 transition-colors"><stat.icon size={22} className="text-gray-600 group-hover:text-blue-600"/></div>
                        <span className="text-green-600 text-[11px] font-bold bg-green-50 px-2 py-1 rounded-md">{stat.inc}</span>
                    </div>
                    <div className="text-gray-500 text-[13px] font-medium mb-1">{stat.label}</div>
                    <div className="text-[28px] font-bold text-gray-900 tracking-tight">{stat.val.split(' ')[0]} <span className="text-[16px] font-medium text-gray-400">{stat.val.split(' ')[1]}</span></div>
                </div>
            ))}
            
            {/* ===== <AI 스크리닝 리포트> ===== */}
            {/* Dark Report Card */}
            <div className="bg-[#111827] p-7 rounded-2xl text-white flex flex-col justify-between shadow-xl shadow-gray-200">
                <div>
                    <div className="text-[15px] font-bold mb-1">AI 스크리닝 리포트</div>
                    <p className="text-gray-400 text-xs">최근 지원자 분석이 완료되었습니다.</p>
                </div>
                <button 
                    onClick={() => onNavigate('applicants')}
                    className="w-full bg-white/10 hover:bg-white/15 transition-colors py-3 rounded-lg text-[13px] font-medium text-center border border-white/5 backdrop-blur-sm"
                >
                    리포트 확인하기
                </button>
            </div>
            {/* ===== </AI 스크리닝 리포트> ===== */}
        </div>

        {/* Active Jobs List */}
        <div>
            <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-lg text-gray-800">진행 중인 채용 공고</h3>
                <button onClick={() => onNavigate('my-jds')} className="text-[12px] text-gray-500 flex items-center gap-1 font-medium hover:text-blue-600 transition-colors">전체보기 <ChevronRight size={14}/></button>
            </div>
            {activeJDs.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-12 text-center border border-gray-100">
                    <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 mb-2 font-medium">아직 생성된 채용 공고가 없습니다</p>
                    <p className="text-gray-400 text-sm mb-6">AI와 함께 첫 번째 JD를 만들어보세요</p>
                    <button 
                        onClick={() => onNavigate('chat')} 
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                    >
                        <Plus size={16} /> 새 JD 만들기
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {activeJDs.map((jd) => (
                        <div key={jd.id} onClick={() => onNavigate('my-jds')} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-pointer flex flex-col h-full">
                            <div className="h-40 w-full relative overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                <div className="absolute top-3 left-3">
                                    <Badge type={jd.status || 'active'} text={jd.status || '진행중'} />
                                </div>
                                <div className="absolute bottom-3 left-3 right-3">
                                    <h4 className="font-bold text-white text-lg leading-tight line-clamp-2">{jd.title}</h4>
                                </div>
                            </div>
                            <div className="p-5 flex flex-col flex-1">
                                <div className="text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wide">
                                    {jd.department || '부서 미지정'} · {jd.location || '위치 미지정'}
                                </div>
                                
                                <div className="flex gap-1.5 mb-auto mt-3">
                                    <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">채용중</span>
                                </div>
                                
                                <div className="mt-5 pt-4 border-t border-gray-50 flex justify-end items-center text-[12px]">
                                    <button className="text-blue-600 font-medium hover:text-blue-700">상세보기 →</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Analytics Section */}
        <div>
            <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-lg text-gray-800">지원자 현황</h3>
                <button 
                    onClick={() => onNavigate('applicants')}
                    className="text-[12px] text-gray-500 flex items-center gap-1 font-medium hover:text-blue-600 transition-colors"
                >
                    전체보기 <ChevronRight size={14}/>
                </button>
            </div>

            <div className="space-y-6">
                {/* Graph and Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Graph Card */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-lg text-gray-800">총 지원자 추이</h3>
                            <div className="text-[12px] font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-gray-100">
                                최근 7일 <ChevronRight size={14}/>
                            </div>
                        </div>
                        <div className="h-[220px] w-full relative">
                            {/* SVG Wave Graph */}
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 400 150" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#818CF8" stopOpacity="0.2"/>
                                        <stop offset="100%" stopColor="#818CF8" stopOpacity="0"/>
                                    </linearGradient>
                                </defs>
                                {/* Grid lines */}
                                <line x1="0" y1="150" x2="400" y2="150" stroke="#F3F4F6" strokeWidth="1" />
                                <line x1="0" y1="100" x2="400" y2="100" stroke="#F3F4F6" strokeWidth="1" />
                                <line x1="0" y1="50" x2="400" y2="50" stroke="#F3F4F6" strokeWidth="1" />
                                
                                {/* Main Line */}
                                <path d={mainPath} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round"/>
                                <path d={areaPath} fill="url(#gradientArea)" stroke="none"/>
                            </svg>
                            
                            {/* Floating Tooltip */}
                            <div className="absolute top-[10%] left-[65%] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] px-4 py-2.5 rounded-xl border border-gray-100 text-center animate-bounce duration-[2000ms]">
                                <div className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">This Month</div>
                                <div className="font-extrabold text-xl text-gray-900 leading-none">{stats.thisMonth} <span className="text-[10px] font-medium text-gray-400">명</span></div>
                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-gray-100 rotate-45"></div>
                            </div>
                        </div>
                    </div>

                    {/* Donut Charts */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-around">
                        {/* Gender Chart */}
                        <div className="text-center">
                            <div className="text-[13px] font-bold mb-6 text-gray-600">성비</div>
                            <div className="relative w-36 h-36 mx-auto">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="72" cy="72" r="56" fill="transparent" stroke="#EEF2FF" strokeWidth="16" strokeLinecap="round" />
                                    <circle cx="72" cy="72" r="56" fill="transparent" stroke="#6366F1" strokeWidth="16" strokeDasharray="350" strokeDashoffset="120" strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-[18px] font-extrabold text-gray-900">-</span>
                                    <span className="text-[10px] text-gray-400 font-medium">정보 없음</span>
                                </div>
                            </div>
                            <div className="flex justify-center gap-4 mt-6">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                                    <span className="text-[11px] font-medium text-gray-500">남성 -</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-100"></div>
                                    <span className="text-[11px] font-medium text-gray-500">여성 -</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Grade Chart */}
                        <div className="text-center">
                            <div className="text-[13px] font-bold mb-6 text-gray-600">경력 분포</div>
                            <div className="relative w-36 h-36 mx-auto">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="72" cy="72" r="56" fill="transparent" stroke="#F3E8FF" strokeWidth="16" strokeLinecap="round" />
                                    <circle cx="72" cy="72" r="56" fill="transparent" stroke="#8B5CF6" strokeWidth="16" strokeDasharray="350" strokeDashoffset="80" strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-[18px] font-extrabold text-gray-900">-</span>
                                    <span className="text-[10px] text-gray-400 font-medium">정보 없음</span>
                                </div>
                            </div>
                            <div className="flex justify-center gap-4 mt-6">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-violet-500"></div>
                                    <span className="text-[11px] font-medium text-gray-500">5년+ -</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-violet-100"></div>
                                    <span className="text-[11px] font-medium text-gray-500">주니어 -</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Cards - Colored */}
                <div>
                    <h3 className="font-bold text-lg text-gray-800 mb-5">채용 진행 현황</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        {[
                            { label: '합격', count: stats.passed, bg: 'bg-[#4ADE80]', text: 'text-white' },
                            { label: '보류', count: stats.pending, bg: 'bg-[#FDE047]', text: 'text-yellow-800' },
                            { label: '불합격', count: stats.rejected, bg: 'bg-[#FCA5A5]', text: 'text-white' },
                            { label: '검토중', count: stats.reviewing, bg: 'bg-[#C4B5FD]', text: 'text-white' }
                        ].map(status => (
                            <div key={status.label} className={`h-[120px] p-6 rounded-2xl ${status.bg} shadow-sm transition-all hover:scale-105 cursor-pointer flex flex-col justify-between`}>
                                <div className={`font-bold text-lg ${status.text}`}>{status.label}</div>
                                <div className={`text-3xl font-extrabold ${status.text}`}>{status.count} <span className="text-sm font-normal opacity-80">명</span></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
};
