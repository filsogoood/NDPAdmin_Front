// NDP 프로토콜 관련 타입 정의

export interface Hardware {
  id: string;
  type: 'GPU' | 'CPU' | 'RAM' | 'Storage';
  model: string;
  specification: string;
  capacity?: string;
  temperature?: number;
  usage?: number;
}

export interface NodeStatus {
  status: 'online' | 'offline' | 'maintenance' | 'error';
  lastHeartbeat: Date;
  uptime: number; // 시간 단위
  responseTime: number; // ms
}

export interface PerformanceMetrics {
  cpuUsage: number;
  gpuUsage: number;
  memoryUsage: number;
  temperature: {
    cpu: number;
    gpu: number;
  };
  networkLatency: number;
}

export interface NodeScore {
  hardwareScore: number;
  performanceScore: number;
  totalScore: number;
  rank: number;
}

export interface HistoryLog {
  id: string;
  timestamp: Date;
  type: 'registration' | 'hardware_change' | 'status_update' | 'error' | 'maintenance';
  title: string;
  description: string;
  severity?: 'info' | 'warning' | 'error' | 'success';
}

export interface Node {
  id: string;
  name: string;
  location: {
    country: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  status: NodeStatus;
  hardware: Hardware[];
  performance: PerformanceMetrics;
  score: NodeScore;
  pricing: {
    pricePerHour: number;
    currency: 'NDP';
  };
  registrationDate: Date;
  historyLogs: HistoryLog[];
}

export interface NetworkStats {
  totalNodes: number;
  activeNodes: number;
  totalGpuPower: number; // TFLOPS
  averageScore: number;
  totalTransactions: number;
  networkUptime: number;
}

export interface DashboardMetrics {
  networkStats: NetworkStats;
  recentActivity: HistoryLog[];
  topPerformingNodes: Node[];
  geographicDistribution: {
    region: string;
    nodeCount: number;
    coordinates: { lat: number; lng: number };
  }[];
}
