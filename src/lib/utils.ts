import { type ClassValue, clsx } from 'clsx';
import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Node } from './types';
import { MapNode } from './nodeLocationMapper';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDateTime(date: Date): string {
  return format(date, 'yyyy-MM-dd HH:mm:ss', { locale: ko });
}

export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true, locale: ko });
}

export function formatNumber(num: number, decimals: number = 1): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(decimals) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(decimals) + 'K';
  }
  return num.toFixed(decimals);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'online':
      return 'text-green-400';
    case 'offline':
      return 'text-red-400';
    case 'maintenance':
      return 'text-yellow-400';
    case 'error':
      return 'text-red-500';
    default:
      return 'text-gray-400';
  }
}

export function getStatusBgColor(status: string): string {
  switch (status) {
    case 'online':
      return 'bg-green-500';
    case 'offline':
      return 'bg-red-500';
    case 'maintenance':
      return 'bg-yellow-500';
    case 'error':
      return 'bg-red-600';
    default:
      return 'bg-gray-500';
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'success':
      return 'bg-green-500';
    case 'info':
      return 'bg-blue-500';
    case 'warning':
      return 'bg-yellow-500';
    case 'error':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

export function getPerformanceLevel(score: number): { level: string; color: string } {
  if (score >= 90) {
    return { level: 'Excellent', color: 'text-green-400' };
  }
  if (score >= 80) {
    return { level: 'Good', color: 'text-blue-400' };
  }
  if (score >= 70) {
    return { level: 'Average', color: 'text-yellow-400' };
  }
  return { level: 'Poor', color: 'text-red-400' };
}

// Node 상태를 MapNode 상태로 변환
function mapNodeStatusFromOriginal(status: string): 'active' | 'warning' | 'error' | 'pre' {
  switch (status.toLowerCase()) {
    case 'online':
      return 'active';
    case 'maintenance':
      return 'warning';
    case 'offline':
    case 'error':
      return 'error';
    default:
      return 'pre';
  }
}

// Node 타입을 MapNode 타입으로 변환하는 함수
export function convertNodeToMapNode(node: Node): MapNode {
  // 하드웨어 정보 추출
  const cpuHardware = node.hardware.find(h => h.type === 'CPU');
  const gpuHardware = node.hardware.find(h => h.type === 'GPU');
  const ramHardware = node.hardware.find(h => h.type === 'RAM');
  const storageHardware = node.hardware.find(h => h.type === 'Storage');

  return {
    id: node.id,
    name: node.name,
    coordinates: [node.location.coordinates.lng, node.location.coordinates.lat],
    status: mapNodeStatusFromOriginal(node.status.status),
    region: node.location.country,
    district: node.location.city,
    nodeCount: 1,
    address: `${node.location.city}, ${node.location.country}`,
    ip: 'N/A', // Node 타입에 IP 정보가 없으므로 기본값
    usage: {
      cpu: node.performance.cpuUsage,
      memory: node.performance.memoryUsage,
      gpu: node.performance.gpuUsage,
      temperature: node.performance.temperature.gpu,
      storage: 0 // Node 타입에 스토리지 사용량 정보가 없으므로 기본값
    },
    hardware: {
      cpu_model: cpuHardware?.model || 'Unknown',
      cpu_cores: cpuHardware?.specification || 'Unknown',
      gpu_model: gpuHardware?.model || 'Unknown',
      gpu_count: '1', // 기본값
      total_ram_gb: ramHardware?.capacity || 'Unknown',
      storage_total_gb: storageHardware?.capacity || 'Unknown'
    }
  };
}

// NodeSummary 타입을 MapNode 타입으로 변환하는 함수 (dashboard용)
export function convertNodeSummaryToMapNode(nodeSummary: any): MapNode {
  return {
    id: nodeSummary.id,
    name: nodeSummary.name,
    coordinates: [127.0, 37.5], // 기본 좌표 (한국 중심)
    status: mapNodeStatusFromOriginal(nodeSummary.status),
    region: nodeSummary.region,
    district: nodeSummary.address,
    nodeCount: 1,
    address: nodeSummary.address,
    ip: nodeSummary.ip,
    usage: nodeSummary.usage ? {
      cpu: parseFloat(nodeSummary.usage.cpu),
      memory: parseFloat(nodeSummary.usage.memory),
      gpu: parseFloat(nodeSummary.usage.gpu),
      temperature: parseFloat(nodeSummary.usage.temperature),
      storage: 0 // 기본값
    } : undefined,
    hardware: {
      cpu_model: 'Unknown',
      cpu_cores: 'Unknown', 
      gpu_model: 'Unknown',
      gpu_count: '1',
      total_ram_gb: 'Unknown',
      storage_total_gb: 'Unknown'
    }
  };
}
