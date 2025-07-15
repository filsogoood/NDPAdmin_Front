import { Node, NetworkStats, DashboardMetrics, Hardware, HistoryLog } from './types';

// 하드웨어 템플릿
const hardwareTemplates: { [key: string]: Hardware[] } = {
  highEnd: [
    {
      id: 'gpu-1',
      type: 'GPU',
      model: 'NVIDIA RTX 4090',
      specification: '24GB VRAM',
      capacity: '24 GB',
      temperature: 72,
      usage: 45
    },
    {
      id: 'cpu-1',
      type: 'CPU',
      model: 'Intel Xeon E5-2690',
      specification: '24 Cores',
      capacity: '24 Cores',
      temperature: 58,
      usage: 32
    },
    {
      id: 'ram-1',
      type: 'RAM',
      model: 'DDR4 ECC',
      specification: '128GB',
      capacity: '128 GB',
      usage: 67
    }
  ],
  midRange: [
    {
      id: 'gpu-2',
      type: 'GPU',
      model: 'NVIDIA RTX 3080',
      specification: '12GB VRAM',
      capacity: '12 GB',
      temperature: 68,
      usage: 52
    },
    {
      id: 'cpu-2',
      type: 'CPU',
      model: 'AMD Ryzen 9 5950X',
      specification: '16 Cores',
      capacity: '16 Cores',
      temperature: 62,
      usage: 28
    },
    {
      id: 'ram-2',
      type: 'RAM',
      model: 'DDR4',
      specification: '64GB',
      capacity: '64 GB',
      usage: 45
    }
  ]
};

// 이력 로그 생성 함수 (정적 데이터)
const generateHistoryLogs = (nodeId: string): HistoryLog[] => {
  const logs: HistoryLog[] = [
    {
      id: `${nodeId}-log-1`,
      timestamp: new Date('2025-07-10T14:00:00Z'),
      type: 'registration',
      title: '등록 완료',
      description: 'NVIDIA RTX 4090, 128GB RAM으로 최초 등록됨',
      severity: 'success'
    },
    {
      id: `${nodeId}-log-2`,
      timestamp: new Date('2025-07-12T09:30:00Z'),
      type: 'status_update',
      title: '성능 최적화',
      description: 'GPU 드라이버 업데이트 완료. 성능 점수 5% 향상',
      severity: 'info'
    },
    {
      id: `${nodeId}-log-3`,
      timestamp: new Date('2025-07-15T11:30:00Z'),
      type: 'hardware_change',
      title: '변경 감지',
      description: 'RAM 64GB → 128GB 업그레이드 확인. 하드웨어 점수 재계산 적용',
      severity: 'info'
    },
    {
      id: `${nodeId}-log-4`,
      timestamp: new Date('2025-07-15T11:32:15Z'),
      type: 'status_update',
      title: '상태 보고',
      description: '시스템 안정, 정상 작동 중 (하트비트 수신)',
      severity: 'success'
    }
  ];
  
  return logs.reverse(); // 최신순으로 정렬
};

// 노드 데이터 생성
export const mockNodes: Node[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'Seoul-Node-01',
    location: {
      country: 'South Korea',
      city: 'Seoul',
      coordinates: { lat: 37.5665, lng: 126.9780 }
    },
    status: {
      status: 'online',
      lastHeartbeat: new Date('2025-07-15T12:30:00Z'),
      uptime: 168.5,
      responseTime: 45
    },
    hardware: hardwareTemplates.highEnd,
    performance: {
      cpuUsage: 32,
      gpuUsage: 45,
      memoryUsage: 67,
      temperature: { cpu: 58, gpu: 72 },
      networkLatency: 45
    },
    score: {
      hardwareScore: 95,
      performanceScore: 88,
      totalScore: 91.5,
      rank: 1
    },
    pricing: {
      pricePerHour: 0.85,
      currency: 'NDP'
    },
    registrationDate: new Date('2025-07-10T14:00:00Z'),
    historyLogs: generateHistoryLogs('a1b2c3d4-e5f6-7890-abcd-ef1234567890')
  },
  {
    id: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
    name: 'Tokyo-Node-02',
    location: {
      country: 'Japan',
      city: 'Tokyo',
      coordinates: { lat: 35.6762, lng: 139.6503 }
    },
    status: {
      status: 'online',
      lastHeartbeat: new Date('2025-07-15T12:29:30Z'),
      uptime: 156.2,
      responseTime: 32
    },
    hardware: hardwareTemplates.midRange,
    performance: {
      cpuUsage: 28,
      gpuUsage: 52,
      memoryUsage: 45,
      temperature: { cpu: 62, gpu: 68 },
      networkLatency: 32
    },
    score: {
      hardwareScore: 82,
      performanceScore: 91,
      totalScore: 86.5,
      rank: 2
    },
    pricing: {
      pricePerHour: 0.65,
      currency: 'NDP'
    },
    registrationDate: new Date('2025-07-08T10:30:00Z'),
    historyLogs: generateHistoryLogs('b2c3d4e5-f6g7-8901-bcde-f23456789012')
  }
];

// 추가 노드들을 생성하는 함수 (정적 데이터)
const generateAdditionalNodes = (): Node[] => {
  const locations = [
    { country: 'USA', city: 'New York', lat: 40.7128, lng: -74.0060 },
    { country: 'Germany', city: 'Berlin', lat: 52.5200, lng: 13.4050 },
    { country: 'Singapore', city: 'Singapore', lat: 1.3521, lng: 103.8198 },
    { country: 'Canada', city: 'Toronto', lat: 43.6532, lng: -79.3832 },
    { country: 'UK', city: 'London', lat: 51.5074, lng: -0.1278 }
  ];

  const staticNodes = [
    {
      status: 'online' as const,
      lastHeartbeat: new Date('2025-07-15T12:00:00Z'),
      uptime: 156.2,
      responseTime: 32,
      performance: {
        cpuUsage: 28,
        gpuUsage: 52,
        memoryUsage: 45,
        temperature: { cpu: 58, gpu: 68 },
        networkLatency: 32
      },
      score: { hardwareScore: 85, performanceScore: 88, totalScore: 86.5, rank: 3 },
      pricing: { pricePerHour: 0.65, currency: 'NDP' as const },
      registrationDate: new Date('2025-07-08T10:30:00Z'),
      hardware: hardwareTemplates.highEnd
    },
    {
      status: 'offline' as const,
      lastHeartbeat: new Date('2025-07-15T10:30:00Z'),
      uptime: 128.5,
      responseTime: 45,
      performance: {
        cpuUsage: 35,
        gpuUsage: 60,
        memoryUsage: 55,
        temperature: { cpu: 62, gpu: 75 },
        networkLatency: 45
      },
      score: { hardwareScore: 78, performanceScore: 82, totalScore: 80.0, rank: 4 },
      pricing: { pricePerHour: 0.55, currency: 'NDP' as const },
      registrationDate: new Date('2025-07-06T14:15:00Z'),
      hardware: hardwareTemplates.midRange
    }
    // 더 많은 정적 노드들...
  ];

  return locations.map((location, index) => ({
    id: `node-${String(index + 3).padStart(2, '0')}-static${index}`,
    name: `${location.city}-Node-${String(index + 3).padStart(2, '0')}`,
    location: {
      country: location.country,
      city: location.city,
      coordinates: { lat: location.lat, lng: location.lng }
    },
    status: {
      status: (staticNodes[index]?.status || 'online') as 'online' | 'offline' | 'maintenance' | 'error',
      lastHeartbeat: staticNodes[index]?.lastHeartbeat || new Date('2025-07-15T12:00:00Z'),
      uptime: staticNodes[index]?.uptime || 120.0,
      responseTime: staticNodes[index]?.responseTime || 35
    },
    hardware: staticNodes[index]?.hardware || hardwareTemplates.midRange,
    performance: staticNodes[index]?.performance || {
      cpuUsage: 30,
      gpuUsage: 40,
      memoryUsage: 50,
      temperature: { cpu: 55, gpu: 65 },
      networkLatency: 35
    },
    score: staticNodes[index]?.score || {
      hardwareScore: 75,
      performanceScore: 80,
      totalScore: 77.5,
      rank: index + 3
    },
    pricing: staticNodes[index]?.pricing || {
      pricePerHour: 0.5,
      currency: 'NDP' as const
    },
    registrationDate: staticNodes[index]?.registrationDate || new Date('2025-07-07T12:00:00Z'),
    historyLogs: generateHistoryLogs(`node-${String(index + 3).padStart(2, '0')}`)
  }));
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
