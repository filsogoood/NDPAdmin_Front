'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent } from '@/components/Card';
import { WorldMap, sampleNodes } from '@/components/WorldMap';
import { authService } from '@/lib/auth';
import { 
  Globe,
  ChevronDown,
  ChevronUp,
  MapPin
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [isNodeListCollapsed, setIsNodeListCollapsed] = useState(false);
  
  // 페이지 로드 시 인증 체크
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">네트워크 대시보드</h1>
          <p className="text-gray-400">
            NDP 네트워크의 실시간 현황과 성능 지표를 확인하세요
          </p>
        </div>

        {/* 네트워크 글로벌 현황 */}
        <div className="mb-8">
          <Card className="fade-in" style={{ animationDelay: '0.7s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-100 mb-2">글로벌 네트워크 현황</h2>
                  <p className="text-gray-400">
                    전 세계 노드 분포와 실시간 상태를 확인하세요
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gray-700 text-blue-400">
                  <Globe className="h-6 w-6" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 지도 영역 */}
                <div className="lg:col-span-2">
                  <div className="h-96 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                    <WorldMap className="h-full" />
                  </div>
                </div>

                {/* 노드 목록 카드 */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-800 border border-gray-700 rounded-lg h-96 flex flex-col overflow-hidden">
                    {/* 헤더 영역 - 고정 */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-700">
                      <div>
                        <h3 className="text-lg font-bold text-gray-100 mb-1">노드 목록</h3>
                        <p className="text-sm text-gray-400">
                          {sampleNodes.length}개 지역의 노드 분포
                        </p>
                      </div>
                      <button
                        onClick={() => setIsNodeListCollapsed(!isNodeListCollapsed)}
                        className="p-2 rounded-md hover:bg-gray-700 transition-colors"
                        title={isNodeListCollapsed ? "목록 펼치기" : "목록 접기"}
                      >
                        {isNodeListCollapsed ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>

                    {/* 컨텐츠 영역 - 스크롤 가능 */}
                    <div className="flex-1 p-4 overflow-hidden">
                      {isNodeListCollapsed && (
                        <div className="text-sm text-gray-400">
                          활성: {sampleNodes.filter(n => n.status === 'active').length}개 | 
                          경고: {sampleNodes.filter(n => n.status === 'warning').length}개 | 
                          비활성: {sampleNodes.filter(n => n.status === 'error').length}개
                        </div>
                      )}

                      {!isNodeListCollapsed && (
                        <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                          <div className="space-y-2">
                            {sampleNodes.map((node) => (
                              <div
                                key={node.id}
                                className="p-3 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-all duration-200 cursor-pointer"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-100 text-sm truncate">{node.name}</h4>
                                    <div className="flex items-center space-x-1 text-xs text-gray-400 mt-1">
                                      <MapPin className="h-3 w-3 flex-shrink-0" />
                                      <span className="truncate">{node.region}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 truncate">
                                      {node.district}
                                    </div>
                                  </div>
                                  <div className="flex items-center ml-3 space-x-2">
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                      node.status === 'active' ? 'bg-green-500' :
                                      node.status === 'warning' ? 'bg-yellow-500' :
                                      'bg-gray-500'
                                    }`}></div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                      node.status === 'active' ? 'bg-green-900/50 text-green-300' :
                                      node.status === 'warning' ? 'bg-yellow-900/50 text-yellow-300' :
                                      'bg-gray-600/50 text-gray-300'
                                    }`}>
                                      {node.nodeCount}개
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 범례 */}
              <div className="mt-6 flex items-center justify-center space-x-8">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-400">활성 노드</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm text-gray-400">경고 상태</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <span className="text-sm text-gray-400">비활성 노드</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
