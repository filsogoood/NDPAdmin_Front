'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent } from '@/components/Card';
import { WorldMap } from '@/components/WorldMap';
import { NodeDetailPanel } from '@/components/NodeDetailPanel';
import { authService } from '@/lib/auth';
import { useAutoRefresh } from '@/lib/hooks/useAutoRefresh';
import { apiClient } from '@/lib/api';
import { convertNodeSummaryToMapNode } from '@/lib/utils';
import { MapNode } from '@/lib/nodeLocationMapper';
import { 
  Globe,
  ChevronDown,
  ChevronUp,
  MapPin,
  Cpu,
  HardDrive,
  Thermometer,
  Activity,
  RefreshCw,
  Pause,
  Play
} from 'lucide-react';

interface NodeSummary {
  id: string;
  name: string;
  status: string;
  region: string;
  address: string;
  ip: string;
  usage?: {
    cpu: string;
    memory: string;
    gpu: string;
    temperature: string;
    storage: string; // 🐛 스토리지 사용량 추가
  };
  // 🐛 하드웨어 정보 인터페이스 추가
  hardware?: {
    cpu_model: string;
    cpu_cores: string;
    gpu_model: string;
    gpu_count: string;
    total_ram_gb: string;
    storage_total_gb: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [isNodeListCollapsed, setIsNodeListCollapsed] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [nodesSummary, setNodesSummary] = useState<NodeSummary[]>([]);
  const [networkStats, setNetworkStats] = useState({
    totalNodes: 0,
    activeNodes: 0,
    preNodes: 0,
    errorNodes: 0
  });
  
  // 노드 상세 패널 상태
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  // 페이지 로드 시 인증 체크 및 토큰 설정
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/');
      return;
    }
    
    const token = localStorage.getItem('authToken');
    setAuthToken(token);
  }, [router]);

  // 콜백 함수들을 useCallback으로 안정화
  const handleSuccess = useCallback((data: any) => {
    // 🐛 Dashboard 하드웨어 매핑 디버깅 로그 추가
    console.log('🔍 [Dashboard Debug] 받은 전체 데이터:', data);
    console.log('🔍 [Dashboard Debug] hardware_specs:', data.hardware_specs);
    
    // 노드 요약 정보 생성
    const summaryData: NodeSummary[] = data.nanodc.map((location: any) => {
      // nanodc_id로 해당하는 노드 찾기
      const nodeInfo = data.nodes.find((node: any) => 
        node.nanodc_id === location.nanodc_id
      );
      
      // node_id로 사용량 정보 찾기
      const usageInfo = nodeInfo ? data.node_usage.find((usage: any) => 
        usage.node_id === nodeInfo.node_id
      ) : undefined;
      
      // 🐛 node_id로 하드웨어 정보 찾기 (추가됨)
      const hardwareInfo = nodeInfo ? data.hardware_specs.find((hw: any) => 
        hw.node_id === nodeInfo.node_id
      ) : undefined;
      
      // 🐛 하드웨어 매핑 디버깅 로그
      console.log(`🔍 [Dashboard Debug] 노드 "${nodeInfo?.node_name}" 처리:`);
      console.log(`🔍 [Dashboard Debug] node_id: ${nodeInfo?.node_id}`);
      console.log(`🔍 [Dashboard Debug] hardwareInfo:`, hardwareInfo);
      if (hardwareInfo) {
        console.log(`🔍 [Dashboard Debug] storage_total_gb: ${hardwareInfo.storage_total_gb}`);
      } else {
        console.log(`🔍 [Dashboard Debug] ❌ 하드웨어 정보 없음`);
      }
      
      const result = {
        id: nodeInfo?.node_id || location.nanodc_id,
        name: nodeInfo?.node_name || location.name,
        status: nodeInfo?.status || 'unknown',
        region: location.address,
        address: location.address,
        ip: location.ip,
        usage: usageInfo ? {
          cpu: usageInfo.cpu_usage_percent,
          memory: usageInfo.mem_usage_percent,
          gpu: usageInfo.gpu_usage_percent,
          temperature: usageInfo.gpu_temp,
          storage: usageInfo.used_storage_gb // 🐛 실제 스토리지 사용량 추가
        } : undefined,
        // 🐛 하드웨어 정보 추가
        hardware: hardwareInfo ? {
          cpu_model: hardwareInfo.cpu_model,
          cpu_cores: hardwareInfo.cpucores,
          gpu_model: hardwareInfo.gpu_model,
          gpu_count: hardwareInfo.gpu_count,
          total_ram_gb: hardwareInfo.total_ram_gb,
          storage_total_gb: hardwareInfo.storage_total_gb
        } : undefined
      };
      
      console.log(`🔍 [Dashboard Debug] 최종 결과:`, result);
      return result;
    }).filter((summary: NodeSummary) => summary.id); // 유효한 노드만 필터링
    
    setNodesSummary(summaryData);
    
    // 네트워크 통계 계산
    const stats = {
      totalNodes: summaryData.length,
      activeNodes: summaryData.filter(n => n.status === 'active').length,
      preNodes: summaryData.filter(n => n.status === 'pre').length,
      errorNodes: summaryData.filter(n => n.status === 'error').length
    };
    setNetworkStats(stats);
  }, []);

  const handleError = useCallback((error: Error) => {
    console.error('❌ 데이터 갱신 실패:', error.message);
    
    // 401 오류인 경우 토큰 만료로 판단하고 로그인 페이지로 리다이렉트
    if (error.message.includes('401') || error.message.includes('인증이 만료')) {
      authService.logout();
      router.push('/');
    }
  }, [router]);

  // 30초마다 자동 갱신 훅 사용
  const { 
    data: apiData, 
    loading, 
    error, 
    lastUpdated, 
    refresh,
    isAutoRefreshEnabled,
    toggleAutoRefresh
  } = useAutoRefresh(authToken, {
    interval: 10000, // 10초 (테스트용)
    enabled: true,
    onSuccess: handleSuccess,
    onError: handleError
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return '활성';
      case 'pre':
        return '대기';
      case 'error':
        return '오류';
      default:
        return '알 수 없음';
    }
  };

  // 노드 클릭 핸들러
  const handleNodeClick = (node: NodeSummary) => {
    const mapNode = convertNodeSummaryToMapNode(node);
    setSelectedNode(mapNode);
    setIsPanelOpen(true);
  };

  // 패널 닫기 핸들러
  const closePanel = () => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedNode(null), 300); // 애니메이션 후 선택 해제
  };

  // 토큰 유효성 테스트 함수
  const testTokenValidity = async () => {
    if (!authToken) {
      alert('토큰이 없습니다. 다시 로그인해주세요.');
      return;
    }

    try {
      const data = await apiClient.getUserData(authToken);
      alert(`토큰이 유효합니다! (${data.nodes?.length || 0}개 노드)`);
    } catch (error) {
      console.error('❌ 토큰 유효성 테스트 실패:', error);
      alert(`토큰 테스트 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-100 mb-2">네트워크 대시보드</h1>
              <p className="text-gray-400">
                NDP 네트워크의 실시간 현황과 성능 지표를 확인하세요
              </p>
            </div>
            
            {/* 자동 갱신 제어 패널 */}
            <div className="flex items-center space-x-4">
              {/* 마지막 갱신 시간 */}
              {lastUpdated && (
                <div className="text-sm text-gray-500">
                  마지막 갱신: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
              
              {/* 자동 갱신 상태 표시 */}
              <div className="flex items-center space-x-2">
                {/* <div className={`w-2 h-2 rounded-full ${
                  isAutoRefreshEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                }`}></div> */}
                {/* <span className="text-sm text-gray-400">
                  자동 갱신 {isAutoRefreshEnabled ? '활성' : '비활성'}
                </span> */}
              </div>
              
              {/* 제어 버튼 */}
              <div className="flex items-center space-x-2">
                {/* <button
                  onClick={testTokenValidity}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors"
                  title="토큰 유효성 테스트"
                >
                  토큰 테스트
                </button> */}
                
                <button
                  onClick={toggleAutoRefresh}
                  className={`p-2 rounded-md transition-colors ${
                    isAutoRefreshEnabled 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-600 hover:bg-gray-700 text-gray-200'
                  }`}
                  title={isAutoRefreshEnabled ? '자동 갱신 중지' : '자동 갱신 시작'}
                >
                  {isAutoRefreshEnabled ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </button>
                
                <button
                  onClick={refresh}
                  disabled={loading}
                  className="p-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
                  title="수동 새로고침"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
          
          {/* 에러 메시지 표시 */}
          {error && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
                <p className="text-red-400 text-sm">
                  {error}
                </p>
                <button
                  onClick={refresh}
                  className="ml-auto px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md transition-colors"
                >
                  다시 시도
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 네트워크 요약 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="fade-in">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">전체 노드</p>
                  <p className="text-2xl font-bold text-gray-100">{networkStats.totalNodes}</p>
                </div>
                <Globe className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="fade-in" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">활성 노드</p>
                  <p className="text-2xl font-bold text-green-400">{networkStats.activeNodes}</p>
                </div>
                <Activity className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="fade-in" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">대기 노드</p>
                  <p className="text-2xl font-bold text-yellow-400">{networkStats.preNodes}</p>
                </div>
                <Cpu className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="fade-in" style={{ animationDelay: '0.3s' }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">가동률</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {networkStats.totalNodes > 0 ? 
                      Math.round((networkStats.activeNodes / networkStats.totalNodes) * 100) : 0}%
                  </p>
                </div>
                <HardDrive className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 네트워크 글로벌 현황 */}
        <div className="mb-8">
          <Card className="fade-in" style={{ animationDelay: '0.7s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-100 mb-2">글로벌 네트워크 현황</h2>
                  <p className="text-gray-400">
                    실시간 NANO DC 상태를 확인하세요
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gray-700 text-blue-400">
                  <Globe className="h-6 w-6" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 지도 영역 */}
                <div className="lg:col-span-2">
                  <div className="h-96 bg-gray-800 rounded-lg border border-gray-700">
                    {authToken ? (
                      <WorldMap className="h-full" authToken={authToken} />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">
                        인증이 필요합니다
                      </div>
                    )}
                  </div>
                </div>

                {/* 노드 목록 카드 */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-800 border border-gray-700 rounded-lg h-96 flex flex-col overflow-hidden">
                    {/* 헤더 영역 */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-700">
                      <div>
                        <h3 className="text-lg font-bold text-gray-100 mb-1">NANO DC 목록</h3>
                        <p className="text-sm text-gray-400">
                          {nodesSummary.length}개 노드 현황
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

                    {/* 컨텐츠 영역 */}
                    <div className="flex-1 p-4 overflow-hidden">
                      {loading ? (
                        <div className="text-center text-gray-400">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                          로딩 중...
                        </div>
                      ) : isNodeListCollapsed ? (
                        <div className="text-sm text-gray-400">
                          활성: {networkStats.activeNodes}개 | 
                          대기: {networkStats.preNodes}개 | 
                          오류: {networkStats.errorNodes}개
                        </div>
                      ) : (
                        <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                          <div className="space-y-2">
                            {nodesSummary.map((node) => (
                              <div
                                key={node.id}
                                className="p-3 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-all duration-200 cursor-pointer"
                                onClick={() => handleNodeClick(node)}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-100 text-sm truncate">
                                      {node.name}
                                    </h4>
                                    <div className="flex items-center space-x-1 text-xs text-gray-400 mt-1">
                                      <MapPin className="h-3 w-3 flex-shrink-0" />
                                      <span className="truncate">{node.region}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      IP: {node.ip}
                                    </div>
                                    
                                    {/* 사용량 정보 */}
                                    {node.usage && (
                                      <div className="mt-2 space-y-1">
                                        <div className="flex items-center text-xs space-x-2">
                                          <Cpu className="h-3 w-3 text-blue-400" />
                                          <span className="text-gray-400">CPU: {node.usage.cpu}%</span>
                                        </div>
                                        <div className="flex items-center text-xs space-x-2">
                                          <HardDrive className="h-3 w-3 text-green-400" />
                                          <span className="text-gray-400">GPU: {node.usage.gpu}%</span>
                                        </div>
                                        <div className="flex items-center text-xs space-x-2">
                                          <Thermometer className="h-3 w-3 text-orange-400" />
                                          <span className="text-gray-400">온도: {node.usage.temperature}°C</span>
                                        </div>
                                        <div className="flex items-center text-xs space-x-2">
                                          <HardDrive className="h-3 w-3 text-purple-400" />
                                          <span className="text-gray-400">스토리지: {node.usage.storage} GB</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center ml-3 space-x-2">
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(node.status)}`}></div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                      node.status === 'active' ? 'bg-green-900/50 text-green-300' :
                                      node.status === 'warning' ? 'bg-yellow-900/50 text-yellow-300' :
                                      node.status === 'pre' ? 'bg-blue-900/50 text-blue-300' :
                                      'bg-gray-600/50 text-gray-300'
                                    }`}>
                                      {getStatusText(node.status)}
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
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-400">대기 상태</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm text-gray-400">경고 상태</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-400">오류 상태</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 노드 상세 패널 */}
      <NodeDetailPanel 
        node={selectedNode}
        isOpen={isPanelOpen}
        onClose={closePanel}
      />
    </div>
  );
}