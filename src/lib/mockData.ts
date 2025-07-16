import { Node, NetworkStats, DashboardMetrics, Hardware, HistoryLog } from './types';

// 하드웨어 템플릿 (더미 데이터 제거됨)
const hardwareTemplates: { [key: string]: Hardware[] } = {
  highEnd: [],
  midRange: []
};

// 이력 로그 생성 함수 (더미 데이터 제거됨)
const generateHistoryLogs = (nodeId: string): HistoryLog[] => {
  return [];
};

// 노드 데이터 생성 (더미 데이터 제거됨)
export const mockNodes: Node[] = [];

// 추가 노드들을 생성하는 함수 (더미 데이터 제거됨)
const generateAdditionalNodes = (): Node[] => {
  return [];
};

// 전체 노드 목록
export const allNodes = [...mockNodes, ...generateAdditionalNodes()];

// 네트워크 통계 (빈 노드 배열 기반)
export const networkStats: NetworkStats = {
  totalNodes: 0,
  activeNodes: 0,
  totalGpuPower: 0,
  averageScore: 0,
  totalTransactions: 0,
  networkUptime: 100.0
};

// 대시보드 메트릭 (빈 데이터)
export const dashboardMetrics: DashboardMetrics = {
  networkStats,
  recentActivity: [],
  topPerformingNodes: [],
  geographicDistribution: []
};
