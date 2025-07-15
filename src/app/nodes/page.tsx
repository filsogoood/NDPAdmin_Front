'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { StatusBadge } from '@/components/StatusBadge';
import { NodeDetailModal } from '@/components/NodeDetailModal';
import { Node } from '@/lib/types';
import { formatRelativeTime, getPerformanceLevel } from '@/lib/utils';
import { authService } from '@/lib/auth';
import { 
  Search, 
  Filter, 
  RefreshCw,
  Monitor,
  Cpu,
  HardDrive,
  Clock,
  MapPin,
  TrendingUp,
  Eye
} from 'lucide-react';

export default function NodesPage() {
  const router = useRouter();
  
  // 페이지 로드 시 인증 체크
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/');
    }
  }, [router]);
  // 빈 노드 배열을 useMemo로 메모이제이션
  const nodes = useMemo(() => {
    const emptyNodes: Node[] = [];
    return emptyNodes;
  }, []);
  
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'status' | 'location'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 필터링 및 정렬된 노드 목록
  const filteredAndSortedNodes = useMemo(() => {
    let filtered = nodes;

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(node => 
        node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.location.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 상태 필터
    if (statusFilter !== 'all') {
      filtered = filtered.filter(node => node.status.status === statusFilter);
    }

    // 정렬
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'score':
          aValue = a.score.totalScore;
          bValue = b.score.totalScore;
          break;
        case 'status':
          aValue = a.status.status;
          bValue = b.status.status;
          break;
        case 'location':
          aValue = a.location.city;
          bValue = b.location.city;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [nodes, searchTerm, statusFilter, sortBy, sortOrder]);

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNode(null);
  };

  const getHardwareSpec = (node: Node, type: string) => {
    const hardware = node.hardware.find(h => h.type === type);
    return hardware ? hardware.specification : 'N/A';
  };

  const statusCounts = {
    all: nodes.length,
    online: nodes.filter(n => n.status.status === 'online').length,
    offline: nodes.filter(n => n.status.status === 'offline').length,
    maintenance: nodes.filter(n => n.status.status === 'maintenance').length
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">노드 관리</h1>
          <p className="text-muted-foreground">
            네트워크에 등록된 모든 하드웨어 노드의 상태와 성능을 실시간으로 모니터링하세요
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(statusCounts).map(([status, count]) => (
            <Card key={status} className="cursor-pointer hover:shadow-md transition-shadow" 
                  onClick={() => setStatusFilter(status)}>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  {status === 'all' ? '전체' : 
                   status === 'online' ? '온라인' :
                   status === 'offline' ? '오프라인' : '점검중'}
                </p>
                <p className="text-2xl font-bold text-foreground">{count}</p>
                {status !== 'all' && (
                  <StatusBadge status={status} size="sm" className="mt-1" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 컨트롤 바 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* 검색 */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="노드명, 위치로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* 상태 필터 */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">모든 상태</option>
                  <option value="online">온라인</option>
                  <option value="offline">오프라인</option>
                  <option value="maintenance">점검중</option>
                </select>
              </div>

              {/* 정렬 */}
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <select
                  value={`${sortBy}_${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('_');
                    setSortBy(field as 'name' | 'score' | 'status' | 'location');
                    setSortOrder(order as 'asc' | 'desc');
                  }}
                  className="px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="score_desc">점수 높은순</option>
                  <option value="score_asc">점수 낮은순</option>
                  <option value="name_asc">이름순</option>
                  <option value="location_asc">위치순</option>
                </select>
              </div>

              {/* 새로고침 */}
              <button className="flex items-center space-x-2 px-3 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                <RefreshCw className="h-4 w-4" />
                <span className="hidden md:inline">새로고침</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* 노드 테이블 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>노드 목록 ({filteredAndSortedNodes.length}개)</span>
              <Monitor className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">상태</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">노드 정보</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">하드웨어</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">성능 점수</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">마지막 하트비트</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedNodes.map((node) => {
                    const performanceLevel = getPerformanceLevel(node.score.totalScore);
                    
                    return (
                      <tr key={node.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4">
                          <StatusBadge status={node.status.status} variant="dot" />
                        </td>
                        
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-foreground">{node.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{node.location.city}, {node.location.country}</span>
                            </p>
                            <p className="text-xs font-mono text-muted-foreground mt-1">
                              {node.id.substring(0, 8)}...
                            </p>
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1 text-sm">
                              <Monitor className="h-3 w-3 text-purple-500" />
                              <span className="text-foreground">{getHardwareSpec(node, 'GPU')}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm">
                              <Cpu className="h-3 w-3 text-blue-500" />
                              <span className="text-foreground">{getHardwareSpec(node, 'CPU')}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm">
                              <HardDrive className="h-3 w-3 text-green-500" />
                              <span className="text-foreground">{getHardwareSpec(node, 'RAM')}</span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-primary">
                              {node.score.totalScore.toFixed(1)}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${performanceLevel.color} bg-current/10`}>
                              {performanceLevel.level}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            순위 #{node.score.rank}
                          </p>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-1 text-sm">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-foreground">
                              {formatRelativeTime(node.status.lastHeartbeat)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            응답시간: {node.status.responseTime}ms
                          </p>
                        </td>
                        
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleNodeClick(node)}
                            className="flex items-center space-x-1 px-3 py-1 bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors text-sm"
                          >
                            <Eye className="h-3 w-3" />
                            <span>상세보기</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {filteredAndSortedNodes.length === 0 && (
                <div className="text-center py-12">
                  <Monitor className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">
                    등록된 노드가 없습니다
                  </h3>
                  <p className="text-gray-500">
                    NDP 네트워크에 하드웨어 노드를 등록하여 시작하세요
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>


      </main>

      {/* 노드 상세 모달 */}
      <NodeDetailModal 
        node={selectedNode}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}
