import { ChevronRight } from 'lucide-react';
import { FONTS } from '@/constants/fonts';
import { FunnelCSS } from '@/components/common/FunnelCSS';

interface LandingPageProps {
  onLogin: () => void;
}

export const LandingPage = ({ onLogin }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: FONTS.sans }}>
      <FunnelCSS />
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/70 backdrop-blur-xl z-50 border-b border-gray-100/50">
        <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-blue-500/30">W</div>
            <span className="font-extrabold text-xl tracking-tight text-[#111827]">WINNOW</span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-[15px] font-medium text-gray-500">
            <a href="#" className="hover:text-blue-600 transition-colors">프로세스</a>
            <a href="#" className="hover:text-blue-600 transition-colors">주요기능</a>
            <button 
              onClick={onLogin}
              className="bg-[#0F172A] text-white px-6 py-2.5 rounded-full hover:bg-black transition-all shadow-lg hover:shadow-xl text-sm font-semibold"
            >
              무료로 시작하기
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-40 pb-24 text-center px-4 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-100/40 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        <h1 className="text-4xl md:text-[56px] font-bold leading-[1.2] mb-8 tracking-tight text-slate-900">
          채용의 <span className="relative inline-block text-gray-300">
            <span className="relative z-10 line-through decoration-gray-400/80 decoration-2">거품</span>
            <span className="absolute inset-0 bg-gray-100 blur-sm rounded-full -z-0 opacity-50"></span>
          </span> 을 걷어내고<br />
          <span className="text-blue-600 relative inline-block">
            핵심 인재
            <svg className="absolute w-full h-3 -bottom-1 left-0 text-blue-200/50 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" /></svg>
          </span> 만 남기세요
        </h1>
        <p className="text-gray-500 text-lg mb-12 font-medium">
          수백 개의 이력서를 검토하느라 지치셨나요?
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-24">
          <button onClick={onLogin} className="bg-blue-600 text-white px-8 py-3.5 rounded-full font-bold shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:scale-105 transition-all text-[15px]">
            스크리닝 체험하기
          </button>
          <button className="bg-white border border-gray-200 text-gray-700 px-8 py-3.5 rounded-full font-bold hover:bg-gray-50 hover:border-gray-300 transition-all text-[15px] shadow-sm">
            도입 사례 보기
          </button>
        </div>

        {/* 3D Funnel Graphic */}
        <div className="funnel-wrapper">
            <div className="funnel-main">
                <div className="funnel-arrows">
                    <div className="funnel-arrow"></div>
                    <div className="funnel-arrow"></div>
                    <div className="funnel-arrow"></div>
                </div>
                <div className="funnel-container">
                {/* Top Layer */}
                <div className="funnel-layer funnel-top" 
                     onMouseEnter={() => document.getElementById('desc-top')?.classList.add('active')}
                     onMouseLeave={() => document.getElementById('desc-top')?.classList.remove('active')}
                     style={{ width: '550px', height: '130px', marginBottom: '-5px', zIndex: 30 }}>
                    <svg width="550" height="130" viewBox="0 0 550 130" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="topGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
                                <stop offset="50%" style={{ stopColor: '#60A5FA', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
                            </linearGradient>
                            <radialGradient id="topRim" cx="50%" cy="50%">
                                <stop offset="0%" style={{ stopColor: '#BFDBFE', stopOpacity: 1 }} />
                                <stop offset="40%" style={{ stopColor: '#93C5FD', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#60A5FA', stopOpacity: 1 }} />
                            </radialGradient>
                        </defs>
                        {/* Top rim ellipse */}
                        <ellipse cx="275" cy="22" rx="273" ry="22" fill="url(#topRim)" opacity="0.95"/>
                        {/* Curved sides using quadratic bezier */}
                        <path d="M 2 22 Q 90 130, 178 130 L 372 130 Q 460 130, 548 22 L 548 22 Q 460 42, 275 42 Q 90 42, 2 22 Z" 
                              fill="url(#topGrad)" />
                        {/* Inner shadows for depth */}
                        <path d="M 2 22 Q 90 130, 178 130 L 200 130 Q 110 130, 25 22 Z" 
                              fill="black" opacity="0.15"/>
                        <path d="M 548 22 Q 460 130, 372 130 L 350 130 Q 440 130, 525 22 Z" 
                              fill="white" opacity="0.12"/>
                    </svg>
                    <span className="funnel-text">JD OPTIMIZATION</span>
                </div>

                {/* Middle Layer */}
                <div className="funnel-layer funnel-middle" 
                     onMouseEnter={() => document.getElementById('desc-middle')?.classList.add('active')}
                     onMouseLeave={() => document.getElementById('desc-middle')?.classList.remove('active')}
                     style={{ width: '465px', height: '125px', marginBottom: '-5px', zIndex: 20 }}>
                    <svg width="465" height="125" viewBox="0 0 465 125" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="midGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style={{ stopColor: '#2563EB', stopOpacity: 1 }} />
                                <stop offset="50%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#2563EB', stopOpacity: 1 }} />
                            </linearGradient>
                            <radialGradient id="midRim" cx="50%" cy="50%">
                                <stop offset="0%" style={{ stopColor: '#93C5FD', stopOpacity: 1 }} />
                                <stop offset="40%" style={{ stopColor: '#60A5FA', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
                            </radialGradient>
                        </defs>
                        <ellipse cx="232.5" cy="20" rx="230" ry="20" fill="url(#midRim)" opacity="0.95"/>
                        <path d="M 2.5 20 Q 75 125, 147.5 125 L 317.5 125 Q 390 125, 462.5 20 L 462.5 20 Q 390 38, 232.5 38 Q 75 38, 2.5 20 Z" 
                              fill="url(#midGrad)" />
                        <path d="M 2.5 20 Q 75 125, 147.5 125 L 167.5 125 Q 92 125, 22 20 Z" 
                              fill="black" opacity="0.18"/>
                        <path d="M 462.5 20 Q 390 125, 317.5 125 L 297.5 125 Q 373 125, 443 20 Z" 
                              fill="white" opacity="0.1"/>
                    </svg>
                    <span className="funnel-text">AI SCREENING</span>
                </div>

                {/* Bottom Layer */}
                <div className="funnel-layer funnel-bottom" 
                     onMouseEnter={() => document.getElementById('desc-bottom')?.classList.add('active')}
                     onMouseLeave={() => document.getElementById('desc-bottom')?.classList.remove('active')}
                     style={{ width: '370px', height: '115px', zIndex: 10 }}>
                    <svg width="370" height="115" viewBox="0 0 370 115" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="botGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style={{ stopColor: '#1D4ED8', stopOpacity: 1 }} />
                                <stop offset="50%" style={{ stopColor: '#2563EB', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#1D4ED8', stopOpacity: 1 }} />
                            </linearGradient>
                            <radialGradient id="botRim" cx="50%" cy="50%">
                                <stop offset="0%" style={{ stopColor: '#60A5FA', stopOpacity: 1 }} />
                                <stop offset="40%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#2563EB', stopOpacity: 1 }} />
                            </radialGradient>
                        </defs>
                        <ellipse cx="185" cy="18" rx="183" ry="18" fill="url(#botRim)" opacity="0.95"/>
                        <path d="M 2 18 Q 60 115, 118 115 L 252 115 Q 310 115, 368 18 L 368 18 Q 310 34, 185 34 Q 60 34, 2 18 Z" 
                              fill="url(#botGrad)" />
                        <path d="M 2 18 Q 60 115, 118 115 L 135 115 Q 75 115, 20 18 Z" 
                              fill="black" opacity="0.22"/>
                        <path d="M 368 18 Q 310 115, 252 115 L 235 115 Q 295 115, 350 18 Z" 
                              fill="white" opacity="0.08"/>
                    </svg>
                    <span className="funnel-text">SHORTLIST</span>
                </div>
            </div>
            </div>
            
            {/* Description Boxes */}
            <div className="funnel-descriptions">
                <div id="desc-top" className="funnel-description">
                    <h4>JD 최적화</h4>
                    <p>AI가 채용공고를 분석하여 최적의 인재를 찾을 수 있도록 개선합니다.</p>
                    <ul>
                        <li>직무 요구사항 명확화</li>
                        <li>키워드 최적화로 검색 노출 증대</li>
                        <li>매력적인 공고 문구 자동 생성</li>
                    </ul>
                </div>
                
                <div id="desc-middle" className="funnel-description">
                    <h4>AI 스크리닝</h4>
                    <p>수백 개의 지원서를 AI가 자동으로 분석하여 적합한 후보를 선별합니다.</p>
                    <ul>
                        <li>이력서 자동 파싱 및 분석</li>
                        <li>직무 적합도 AI 평가</li>
                        <li>허수 지원자 필터링</li>
                    </ul>
                </div>
                
                <div id="desc-bottom" className="funnel-description">
                    <h4>최종 후보 선정</h4>
                    <p>상위 매칭 후보들을 한눈에 확인하고 인터뷰를 진행하세요.</p>
                    <ul>
                        <li>Top 후보자 리스트 자동 생성</li>
                        <li>종합 평가 리포트 제공</li>
                        <li>일정 관리 및 알림</li>
                    </ul>
                </div>
            </div>
        </div>

        <h3 className="mt-20 text-2xl font-bold text-slate-800 tracking-tight">Unlock your Hiring Potential</h3>
        <div className="flex gap-2.5 mt-4">
            <div className="w-2 h-2 rounded-full bg-slate-800"></div>
            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
        </div>
      </section>

      {/* Dark Feature Section */}
      <section className="bg-[#020617] text-white py-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-900 to-transparent opacity-50"></div>
        
        <div className="max-w-[1100px] mx-auto relative z-10">
          <h2 className="text-[32px] md:text-[40px] font-bold mb-20 leading-tight">
            평가에 필요한 모든 도구를<br />
            <span className="text-blue-500">활용해보세요</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
                { title: '정교한 평가 지표', desc: '1,000개 이상의 직무 데이터를 기반으로 지원자의 핵심 역량을 정밀하게 분석하세요.', tags: ['직무 적합성', '성장 가능성', '기술 역량'] },
                { title: '간편한 평가 프로세스', desc: 'JD 생성부터 결과 분석까지, 채용의 전 과정을 원스톱으로 관리하세요.', tags: ['JD 생성', '자동화', '대시보드'] },
                { title: '다양한 분야 커버', desc: '개발, 디자인, 마케팅 등 기업에 필요한 모든 직군의 역량을 평가할 수 있습니다.', tags: ['전 직군', '맞춤형', '유연성'] }
            ].map((card, idx) => (
                <div key={idx} className="group bg-[#0F172A]/60 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm hover:border-blue-500/50 hover:bg-[#0F172A] transition-all duration-300">
                    <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors">{card.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-8 h-12">{card.desc}</p>
                    <div className="flex flex-wrap gap-2">
                        {card.tags.map(tag => (
                             <span key={tag} className="text-[11px] font-medium bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700 group-hover:border-blue-500/30 transition-colors">{tag}</span>
                        ))}
                    </div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-all pointer-events-none"></div>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-32 px-4 bg-white">
          <div className="max-w-[1000px] mx-auto bg-[#0F172A] rounded-[40px] px-8 py-20 text-center text-white relative overflow-hidden shadow-2xl shadow-slate-200">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="relative z-10 flex flex-col items-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">채용의 새로운 기준을<br/>만들어보세요</h2>
                <p className="text-slate-400 mb-10 text-sm md:text-base font-light">초기 설정 비용 0원. 지금 바로 우리 회사에 딱 맞는 인재 풀을 확인하실 수 있습니다.</p>
                <button onClick={onLogin} className="bg-white text-slate-900 px-10 py-4 rounded-full font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group shadow-xl">
                    지금 무료로 시작하기 
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
          </div>
      </section>
      
      <footer className="py-12 border-t border-gray-100 text-center text-[11px] text-gray-400 bg-gray-50 uppercase tracking-wider font-medium">
          WINNOW © 2026 Winnow Inc. All rights reserved.
      </footer>
    </div>
  );
};
