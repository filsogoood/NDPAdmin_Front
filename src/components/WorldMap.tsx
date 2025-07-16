'use client';

import { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// 더 정확한 지역 좌표와 구체적인 위치 정보 (더미 데이터 제거됨)
const sampleNodes: any[] = [];

interface WorldMapProps {
  className?: string;
}

export function WorldMap({ className = '' }: WorldMapProps) {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [zoom, setZoom] = useState(30);
  const [center, setCenter] = useState<[number, number]>([127.0, 37.5]); // 한국 중심 좌표

  // 노드 겹침 방지를 위한 오프셋 계산
  const nodePositions = useMemo(() => {
    const positions = new Map();
    const gridSize = 0.02; // 그리드 크기 (도 단위)
    
    sampleNodes.forEach((node) => {
      let [lng, lat] = node.coordinates;
      const key = `${Math.round(lng / gridSize)},${Math.round(lat / gridSize)}`;
      
      // 같은 그리드에 이미 노드가 있으면 위치 조정
      if (positions.has(key)) {
        const count = positions.get(key);
        const angle = (count * 60) * Math.PI / 180; // 60도씩 회전
        const distance = 0.015; // 이동 거리
        lng += Math.cos(angle) * distance;
        lat += Math.sin(angle) * distance;
        positions.set(key, count + 1);
      } else {
        positions.set(key, 1);
      }
      
      return { ...node, adjustedCoordinates: [lng, lat] };
    });
    
    return sampleNodes.map((node, index) => {
      const [lng, lat] = node.coordinates;
      const key = `${Math.round(lng / gridSize)},${Math.round(lat / gridSize)}`;
      const count = Array.from(positions.keys()).indexOf(key);
      
      if (count > 0) {
        const angle = (index * 60) * Math.PI / 180;
        const distance = 0.015;
        return {
          ...node,
          adjustedCoordinates: [
            lng + Math.cos(angle) * distance,
            lat + Math.sin(angle) * distance
          ]
        };
      }
      
      return { ...node, adjustedCoordinates: node.coordinates };
    });
  }, []);

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'error':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  // 줌 레벨에 따라 노드 크기를 더 세밀하게 조정
  const getMarkerSize = (nodeCount: number, isOverlapped: boolean = false) => {
    // 줌이 높을수록 노드를 작게 표시
    const zoomFactor = Math.max(0.3, 1 - (zoom - 30) / 100);
    const baseSize = isOverlapped ? 0.8 : 1; // 겹친 노드는 더 작게
    
    if (nodeCount >= 15) {
      return { 
        outer: 2.5 * baseSize * zoomFactor, 
        inner: 1.2 * baseSize * zoomFactor,
        click: 3 * baseSize * zoomFactor // 클릭 영역
      };
    }
    if (nodeCount >= 10) {
      return { 
        outer: 2 * baseSize * zoomFactor, 
        inner: 1 * baseSize * zoomFactor,
        click: 2.5 * baseSize * zoomFactor
      };
    }
    return { 
      outer: 1.5 * baseSize * zoomFactor, 
      inner: 0.8 * baseSize * zoomFactor,
      click: 2 * baseSize * zoomFactor
    };
  };

  const handleNodeClick = (nodeId: number, event: any) => {
    event.stopPropagation(); // 이벤트 버블링 방지
    setSelectedNode(selectedNode === nodeId ? null : nodeId);
  };

  const handleReset = () => {
    setZoom(30);
    setCenter([127.0, 37.5]);
    setSelectedNode(null);
  };

  // 겹친 노드 찾기
  const findOverlappingNodes = (node: any) => {
    return nodePositions.filter(n => 
      n.id !== node.id &&
      Math.abs(n.coordinates[0] - node.coordinates[0]) < 0.02 &&
      Math.abs(n.coordinates[1] - node.coordinates[1]) < 0.02
    );
  };

  return (
    <div className={`w-full relative ${className}`}>
      {/* 현재 줌 레벨과 선택된 노드 정보 */}
      <div className="absolute top-2 left-2 z-10 bg-gray-800 px-3 py-2 rounded-md space-y-1">
        <div className="text-xs text-gray-300">Zoom: {zoom.toFixed(0)}x</div>
        {selectedNode && (
          <div className="text-xs text-blue-400">
            선택: {nodePositions.find(n => n.id === selectedNode)?.name}
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
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 120,
          center: [127.0, 37.5],  // 한국 중심 (서울)
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
                    default: {
                      fill: '#2D3748',
                      outline: 'none',
                    },
                    hover: {
                      fill: '#374151',
                      outline: 'none',
                    },
                    pressed: {
                      fill: '#4A5568',
                      outline: 'none',
                    },
                  }}
                />
              ))
            }
          </Geographies>
          
          {/* 노드 마커들 - z-index 순서 조정 */}
          {nodePositions
            .sort((a, b) => {
              // 선택된 노드를 맨 위로
              if (a.id === selectedNode) return 1;
              if (b.id === selectedNode) return -1;
              // 호버된 노드를 그 다음으로
              if (a.id === hoveredNode) return 1;
              if (b.id === hoveredNode) return -1;
              // 노드 수가 적은 것을 위로 (작은 노드가 위로)
              return a.nodeCount - b.nodeCount;
            })
            .map((node) => {
              const markerColor = getMarkerColor(node.status);
              const overlappingNodes = findOverlappingNodes(node);
              const markerSize = getMarkerSize(node.nodeCount, overlappingNodes.length > 0);
              const isHovered = hoveredNode === node.id;
              const isSelected = selectedNode === node.id;
              
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
                    {/* 클릭 가능한 투명 영역 */}
                    <circle
                      r={markerSize.click}
                      fill="transparent"
                      style={{ cursor: 'pointer' }}
                    />
                    
                    {/* 선택된 노드 하이라이트 */}
                    {isSelected && (
                      <circle
                        r={markerSize.outer + 4}
                        fill="none"
                        stroke="#60A5FA"
                        strokeWidth={2 / zoom}
                        strokeDasharray="4,2"
                        className="animate-pulse"
                      />
                    )}
                    
                    {/* 외부 원 */}
                    <circle
                      r={markerSize.outer}
                      fill={markerColor}
                      fillOpacity={isHovered || isSelected ? 0.5 : 0.3}
                      className={node.status === 'active' ? 'animate-pulse' : ''}
                    />
                    
                    {/* 내부 원 */}
                    <circle
                      r={markerSize.inner}
                      fill={markerColor}
                      stroke="#FFFFFF"
                      strokeWidth={(isHovered || isSelected ? 2 : 1) / zoom}
                    />
                    
                    {/* 노드 라벨 - 줌 레벨에 따라 표시 */}
                    {(zoom > 40 || isHovered || isSelected) && (
                      <text
                        y={markerSize.outer + 8 / zoom}
                        fontSize={10 / zoom}
                        fill="#FFFFFF"
                        textAnchor="middle"
                        stroke="#000000"
                        strokeWidth={0.3 / zoom}
                        paintOrder="stroke"
                        style={{ pointerEvents: 'none' }}
                      >
                        {node.district || node.name}
                      </text>
                    )}
                    
                    {/* 상세 툴팁 */}
                    {(isHovered || isSelected) && (
                      <g style={{ pointerEvents: 'none' }}>
                        <rect
                          x={markerSize.outer + 5 / zoom}
                          y={-30 / zoom}
                          width={160 / zoom}
                          height={65 / zoom}
                          rx={4 / zoom}
                          fill="#1A202C"
                          stroke="#4A5568"
                          strokeWidth={1 / zoom}
                          opacity={0.95}
                        />
                        <text
                          x={markerSize.outer + 10 / zoom}
                          y={-15 / zoom}
                          fontSize={12 / zoom}
                          fill="#F7FAFC"
                          fontWeight="bold"
                        >
                          {node.name}
                        </text>
                        <text
                          x={markerSize.outer + 10 / zoom}
                          y={-2 / zoom}
                          fontSize={10 / zoom}
                          fill="#A0AEC0"
                        >
                          {node.region} {node.district}
                        </text>
                        <text
                          x={markerSize.outer + 10 / zoom}
                          y={10 / zoom}
                          fontSize={10 / zoom}
                          fill="#A0AEC0"
                        >
                          노드: {node.nodeCount}개 • {node.status}
                        </text>
                        <text
                          x={markerSize.outer + 10 / zoom}
                          y={22 / zoom}
                          fontSize={9 / zoom}
                          fill="#718096"
                        >
                          좌표: {node.coordinates[0].toFixed(4)}, {node.coordinates[1].toFixed(4)}
                        </text>
                      </g>
                    )}
                  </g>
                </Marker>
              );
            })}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}

// 노드 데이터를 외부에서 사용할 수 있도록 export
export { sampleNodes };