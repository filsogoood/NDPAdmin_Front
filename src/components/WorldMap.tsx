'use client';

import { useState, useMemo, useCallback } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { transformApiDataToMapNodes, MapNode } from '@/lib/nodeLocationMapper';
import { useAutoRefresh } from '@/lib/hooks/useAutoRefresh';
import { NodeDetailPanel } from '@/components/NodeDetailPanel';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface WorldMapProps {
  className?: string;
  authToken?: string; // 인증 토큰을 props로 받음
}

export function WorldMap({ className = '', authToken }: WorldMapProps) {
  const [nodes, setNodes] = useState<MapNode[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null); // 선택된 노드 ID 추가
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [zoom, setZoom] = useState(30);
  const [center, setCenter] = useState<[number, number]>([127.0, 37.5]);

  console.log('🗺️ WorldMap 컴포넌트 렌더링 시작');
  console.log('🔑 전달받은 authToken:', authToken ? `${authToken.substring(0, 20)}...` : 'null');
  console.log('📍 현재 nodes 상태:', nodes.length, '개');

  // 콜백 함수들을 useCallback으로 안정화 (무한 재렌더링 방지)
  const handleSuccess = useCallback(async (apiData: any) => {
    console.log('🎯🎯🎯 WorldMap onSuccess 콜백 호출됨!!!');
    console.log('📊 받은 데이터:', apiData);
    
    try {
      // API 데이터를 지도용 노드 데이터로 변환
      const transformedNodes = await transformApiDataToMapNodes(apiData);
      console.log('✅ 노드 변환 완료:', transformedNodes.length, '개');
      
      if (transformedNodes.length > 0) {
        setNodes(transformedNodes);
        
        // 선택된 노드가 있으면 새 데이터에서 같은 ID의 노드를 찾아서 업데이트
        setSelectedNodeId((currentSelectedNodeId) => {
          if (currentSelectedNodeId) {
            const updatedSelectedNode = transformedNodes.find(node => node.id === currentSelectedNodeId);
            if (updatedSelectedNode) {
              setSelectedNode(updatedSelectedNode);
              console.log('✅ 선택된 노드 업데이트:', updatedSelectedNode.name);
              return currentSelectedNodeId;
            } else {
              // 선택된 노드가 새 데이터에 없으면 패널 닫기
              console.log('⚠️ 선택된 노드가 새 데이터에 없음, 패널 닫기');
              setSelectedNode(null);
              setIsPanelOpen(false);
              return null;
            }
          }
          return currentSelectedNodeId;
        });
        
        console.log('✅ 노드 상태 업데이트 완료');
      } else {
        console.warn('⚠️ 변환된 노드가 없습니다');
      }
    } catch (error) {
      console.error('❌ 노드 데이터 변환 실패:', error);
    }
  }, []); // 의존성 배열을 비워서 함수가 재생성되지 않도록 함

  const handleError = useCallback((error: Error) => {
    console.error('❌ 지도 데이터 갱신 실패:', error.message);
    console.error('❌ 전체 오류 객체:', error);
  }, []);

  console.log('🔍 handleSuccess 함수 생성:', typeof handleSuccess);
  console.log('🔍 handleError 함수 생성:', typeof handleError);
  console.log('🔍 handleSuccess 함수 문자열:', handleSuccess.toString().substring(0, 50) + '...');

  // 30초마다 자동 갱신으로 노드 데이터 가져오기 (패널이 닫혀있을 때만)
  const { loading, error, refresh } = useAutoRefresh(authToken || null, {
    interval: 30000, // 30초
    enabled: !!authToken && !isPanelOpen, // 패널이 열려있을 때는 갱신 중지
    onSuccess: handleSuccess,
    onError: handleError
  });

  console.log('🔄 useAutoRefresh 상태:');
  console.log('  - loading:', loading);
  console.log('  - error:', error);
  console.log('  - nodes.length:', nodes.length);
  console.log('  - authToken 존재:', !!authToken);
  console.log('  - handleSuccess 함수:', typeof handleSuccess);
  console.log('  - handleError 함수:', typeof handleError);

  // 노드 겹침 방지를 위한 위치 조정
  const adjustedNodes = useMemo(() => {
    const positions = new Map();
    const gridSize = 0.01; // 더 세밀한 그리드
    
    return nodes.map((node, index) => {
      let [lng, lat] = node.coordinates;
      const key = `${Math.round(lng / gridSize)},${Math.round(lat / gridSize)}`;
      
      if (positions.has(key)) {
        const count = positions.get(key);
        const angle = (count * 45) * Math.PI / 180; // 45도씩 회전
        const distance = 0.008; // 더 작은 거리
        lng += Math.cos(angle) * distance;
        lat += Math.sin(angle) * distance;
        positions.set(key, count + 1);
      } else {
        positions.set(key, 1);
      }
      
      return { ...node, adjustedCoordinates: [lng, lat] as [number, number] };
    });
  }, [nodes]);

  const getMarkerColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'online':
      case 'running':
        return '#10B981'; // 녹색 - 정상 활성
      case 'warning':
      case 'caution':
      case 'degraded':
        return '#F59E0B'; // 주황색 - 경고
      case 'error':
      case 'failed':
      case 'offline':
      case 'down':
        return '#EF4444'; // 빨간색 - 오류/오프라인
      case 'pre':
      case 'preparing':
      case 'starting':
        return '#3B82F6'; // 파란색 - 준비 중
      case 'maintenance':
      case 'updating':
        return '#8B5CF6'; // 보라색 - 유지보수
      case 'idle':
      case 'standby':
        return '#F97316'; // 주황색 - 대기
      case 'unknown':
      case 'pending':
        return '#6B7280'; // 회색 - 알 수 없음
      default:
        return '#6B7280'; // 기본 회색
    }
  };

  // 애니메이션 제거 - 깔끔한 핀 마커만 사용
  const getMarkerAnimation = (status: string) => {
    return ''; // 모든 애니메이션 제거
  };

  const getMarkerSize = (nodeCount: number) => {
    const zoomFactor = Math.max(0.3, 1 - (zoom - 30) / 150);
    
    // 줌 40에서 적절한 크기가 되도록 조정 (기존 크기의 2배)
    return { 
      outer: 1.5 * zoomFactor / 2, // 줌 40에서 더 큰 크기
      inner: 0.6 * zoomFactor / 2,
      click: 2.5 * zoomFactor / 2 // 클릭 영역도 동일하게 조정
    };
  };

  const handleNodeClick = (nodeId: string, event: any) => {
    event.stopPropagation();
    const clickedNode = nodes.find(n => n.id === nodeId);
    if (clickedNode) {
      setSelectedNode(clickedNode);
      setSelectedNodeId(nodeId); // 노드 ID도 함께 저장
      setIsPanelOpen(true);
      console.log('🎯 노드 선택됨:', clickedNode.name, 'ID:', nodeId);
    }
  };

  const handlePanelClose = () => {
    setIsPanelOpen(false);
    setSelectedNodeId(null); // 선택된 노드 ID도 초기화
    setTimeout(() => setSelectedNode(null), 300); // 애니메이션 후 선택 해제
    console.log('🔒 패널 닫힘, 선택 노드 초기화');
  };

  const handleReset = () => {
    setZoom(30);
    setCenter([127.0, 37.5]);
    setSelectedNode(null);
    setSelectedNodeId(null); // 선택된 노드 ID도 초기화
    setIsPanelOpen(false);
  };

  const handleRefresh = async () => {
    if (authToken) {
      await refresh();
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-800 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-400">노드 데이터 로딩 중...</p>
          <p className="text-gray-500 text-sm mt-1">
            토큰: {authToken ? '✅ 있음' : '❌ 없음'} | 
            노드: {nodes.length}개
          </p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-800 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-2">⚠️</div>
          <p className="text-red-400 mb-2">{error}</p>
          <p className="text-gray-500 text-sm mb-4">
            토큰: {authToken ? '✅ 있음' : '❌ 없음'} | 
            노드: {nodes.length}개
          </p>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 노드가 없는 경우
  if (nodes.length === 0) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-800 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="text-yellow-500 text-4xl mb-2">📍</div>
          <p className="text-gray-400 mb-2">표시할 노드가 없습니다</p>
          <p className="text-gray-500 text-sm mb-4">
            토큰: {authToken ? '✅ 있음' : '❌ 없음'} | 
            로딩: {loading ? '진행 중' : '완료'}
          </p>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  console.log('🗺️ 지도 렌더링 시작 - 노드 수:', nodes.length);

  return (
    <div className={`w-full relative ${className}`}>
      {/* 상태 정보 */}
      <div className="absolute top-2 left-2 z-10 bg-gray-800 px-3 py-2 rounded-md space-y-1">
        <div className="text-xs text-gray-300">
          노드: {nodes.length}개 | Zoom: {zoom.toFixed(0)}x
        </div>
        <div className="text-xs text-gray-400 flex flex-wrap gap-2">
          <span className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            활성: {nodes.filter(n => ['active', 'online', 'running'].includes(n.status.toLowerCase())).length}
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
            준비: {nodes.filter(n => ['pre', 'preparing', 'starting'].includes(n.status.toLowerCase())).length}
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
            경고: {nodes.filter(n => ['warning', 'caution', 'degraded'].includes(n.status.toLowerCase())).length}
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
            오류: {nodes.filter(n => ['error', 'failed', 'offline', 'down'].includes(n.status.toLowerCase())).length}
          </span>
        </div>
        {selectedNode && (
          <div className="text-xs text-blue-400">
            선택: {selectedNode.name}
          </div>
        )}
      </div>

      {/* 컨트롤 버튼들 */}
      <div className="absolute top-2 right-2 z-10 flex flex-col space-y-2">
        <button
          onClick={() => setZoom(Math.min(zoom * 1.5, 150))}
          className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-md text-sm transition-colors shadow-lg"
          disabled={zoom >= 150}
        >
          +
        </button>
        <button
          onClick={() => setZoom(Math.max(zoom / 1.5, 5))}
          className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-md text-sm transition-colors shadow-lg"
          disabled={zoom <= 5}
        >
          -
        </button>
        <button
          onClick={handleReset}
          className="bg-gray-700 hover:bg-gray-600 text-white p-1 rounded-md text-xs transition-colors shadow-lg"
        >
          Reset
        </button>
        <button
          onClick={handleRefresh}
          className="bg-blue-700 hover:bg-blue-600 text-white p-1 rounded-md text-xs transition-colors shadow-lg"
          disabled={loading}
        >
          새로고침
        </button>
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 120,
          center: [127.0, 37.5],
        }}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <ZoomableGroup
          zoom={zoom}
          center={center}
          onMoveEnd={(position) => setCenter(position.coordinates)}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#2D3748"
                  stroke="#4A5568"
                  strokeWidth={0.5 / zoom}
                  style={{
                    default: { fill: '#2D3748', outline: 'none' },
                    hover: { fill: '#374151', outline: 'none' },
                    pressed: { fill: '#4A5568', outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>
          
          {/* 노드 마커들 */}
          {adjustedNodes
            .sort((a, b) => {
              if (selectedNode && a.id === selectedNode.id) return 1;
              if (selectedNode && b.id === selectedNode.id) return -1;
              if (a.id === hoveredNode) return 1;
              if (b.id === hoveredNode) return -1;
              return a.nodeCount - b.nodeCount;
            })
            .map((node) => {
              const markerColor = getMarkerColor(node.status);
              const markerAnimation = getMarkerAnimation(node.status);
              const markerSize = getMarkerSize(node.nodeCount);
              const isHovered = hoveredNode === node.id;
              const isSelected = selectedNode?.id === node.id;
              
              return (
                <Marker 
                  key={node.id} 
                  coordinates={node.adjustedCoordinates || node.coordinates}
                  style={{ cursor: 'pointer' }}
                >
                  <g
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={(e) => handleNodeClick(node.id, e)}
                  >
                    {/* 클릭 영역 */}
                    <circle
                      cx={0}
                      cy={-markerSize.outer * 0.8}
                      r={markerSize.click * 1.2}
                      fill="transparent"
                      style={{ cursor: 'pointer' }}
                    />
                    
                    {/* 선택 하이라이트 */}
                    {isSelected && (
                      <circle
                        cx={0}
                        cy={-markerSize.outer * 1.2}
                        r={markerSize.outer + 0.3}
                        fill="none"
                        stroke="#60A5FA"
                        strokeWidth={1.5 / zoom}
                        strokeDasharray="3,2"
                      />
                    )}
                    
                    {/* 클래식 핀 마커 */}
                    <g>
                      {/* 핀 마커 메인 형태 - 간단하고 표준적인 핀 */}
                      <path
                        d={`M 0,0 
                            L -${markerSize.outer * 0.6},-${markerSize.outer * 1.2}
                            A ${markerSize.outer * 0.6},${markerSize.outer * 0.6} 0 1,1 ${markerSize.outer * 0.6},-${markerSize.outer * 1.2}
                            Z`}
                        fill={markerColor}
                        stroke="#FFFFFF"
                        strokeWidth={0.8 / zoom}
                        opacity={0.95}
                      />
                      {/* 핀 마커 내부 원형 - 더 적절한 위치와 크기 */}
                      <circle
                        cx={0}
                        cy={-markerSize.outer * 1.2}
                        r={markerSize.inner * 0.7}
                        fill="#FFFFFF"
                        opacity={0.95}
                      />
                    </g>
                    
                    {/* 노드 라벨 */}
                    {(zoom > 40 || isHovered || isSelected) && (
                      <text
                        y={8 / zoom}
                        fontSize={9 / zoom}
                        fill="#FFFFFF"
                        textAnchor="middle"
                        stroke="#000000"
                        strokeWidth={0.3 / zoom}
                        paintOrder="stroke"
                        style={{ pointerEvents: 'none' }}
                      >
                        {node.name}
                      </text>
                    )}
                    
                    {/* 간단한 호버 툴팁 */}
                    {isHovered && !isSelected && (
                      <g style={{ pointerEvents: 'none' }}>
                        <rect
                          x={markerSize.outer + 5 / zoom}
                          y={-markerSize.outer * 2 - 20 / zoom}
                          width={200 / zoom}
                          height={60 / zoom}
                          rx={8 / zoom}
                          fill="#1A202C"
                          stroke="#4A5568"
                          strokeWidth={1 / zoom}
                          opacity={0.95}
                        />
                        <text
                          x={markerSize.outer + 14 / zoom}
                          y={-markerSize.outer * 2 + 5 / zoom}
                          fontSize={16 / zoom}
                          fill="#F7FAFC"
                          fontWeight="bold"
                        >
                          {node.name}
                        </text>
                        <text
                          x={markerSize.outer + 14 / zoom}
                          y={-markerSize.outer * 2 + 25 / zoom}
                          fontSize={14 / zoom}
                          fill="#A0AEC0"
                        >
                          {node.region}
                        </text>
                        <text
                          x={markerSize.outer + 14 / zoom}
                          y={-markerSize.outer * 2 + 45 / zoom}
                          fontSize={14 / zoom}
                          fill={markerColor}
                        >
                          {node.status.toUpperCase()}
                        </text>
                      </g>
                    )}
                  </g>
                </Marker>
              );
            })}
        </ZoomableGroup>
      </ComposableMap>
      
      {/* 노드 상세 정보 패널 */}
      <NodeDetailPanel 
        node={selectedNode}
        isOpen={isPanelOpen}
        onClose={handlePanelClose}
      />
    </div>
  );
}

// 노드 데이터를 외부에서 사용할 수 있도록 export
export type { MapNode };