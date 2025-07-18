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

  // 🐛 스토리지 디버깅 로그 추가
  console.log('🔍 [Storage Debug] Node:', node.name || node.id);
  console.log('🔍 [Storage Debug] 전체 하드웨어 목록:', node.hardware);
  console.log('🔍 [Storage Debug] Storage 하드웨어 검색 결과:', storageHardware);
  console.log('🔍 [Storage Debug] Storage capacity:', storageHardware?.capacity);
  
  const finalStorageValue = storageHardware?.capacity || 'Unknown';
  console.log('🔍 [Storage Debug] 최종 storage_total_gb 값:', finalStorageValue);

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
      storage_total_gb: finalStorageValue
    }
  };
}

// NodeSummary 타입을 MapNode 타입으로 변환하는 함수 (dashboard용)
export function convertNodeSummaryToMapNode(nodeSummary: any): MapNode {
  // 🐛 Dashboard 하드웨어 변환 디버깅 로그
  console.log('🔍 [Dashboard Conversion Debug] nodeSummary:', nodeSummary);
  console.log('🔍 [Dashboard Conversion Debug] nodeSummary.hardware:', nodeSummary.hardware);
  
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
      storage: (() => {
        // 🐛 실제 스토리지 사용량 사용하도록 수정
        if (!nodeSummary.usage.storage) {
          console.log('🔍 [Dashboard Conversion Debug] ⚠️ storage 사용량 없음, 기본값 0 사용');
          return 0;
        }
        
        const storageUsage = parseInt(nodeSummary.usage.storage);
        if (isNaN(storageUsage) || storageUsage < 0) {
          console.log('🔍 [Dashboard Conversion Debug] ⚠️ storage 사용량이 유효하지 않음, 기본값 0 사용');
          return 0;
        }
        
        console.log('🔍 [Dashboard Conversion Debug] ✅ 유효한 storage 사용량:', storageUsage);
        return storageUsage;
      })()
    } : undefined,
    // 🐛 실제 하드웨어 정보 사용하도록 수정
    hardware: nodeSummary.hardware ? {
      cpu_model: nodeSummary.hardware.cpu_model || 'Unknown',
      cpu_cores: nodeSummary.hardware.cpu_cores || 'Unknown',
      gpu_model: nodeSummary.hardware.gpu_model || 'Unknown',
      gpu_count: nodeSummary.hardware.gpu_count || '1',
      total_ram_gb: nodeSummary.hardware.total_ram_gb || 'Unknown',
      storage_total_gb: (() => {
        // 🐛 스토리지 값 검증 로직 추가
        const rawValue = nodeSummary.hardware.storage_total_gb;
        console.log('🔍 [Dashboard Conversion Debug] 원본 storage_total_gb:', rawValue);
        
        if (!rawValue || rawValue === '' || rawValue === 'null' || rawValue === 'undefined') {
          console.log('🔍 [Dashboard Conversion Debug] ⚠️ storage_total_gb가 비어있음');
          return 'Unknown';
        }
        
        const numericValue = parseFloat(rawValue);
        if (isNaN(numericValue) || numericValue <= 0) {
          console.log('🔍 [Dashboard Conversion Debug] ⚠️ storage_total_gb가 유효하지 않은 값');
          return 'Unknown';
        }
        
        console.log('🔍 [Dashboard Conversion Debug] ✅ 유효한 storage_total_gb:', rawValue);
        return rawValue;
      })()
    } : {
      // 하드웨어 정보가 없는 경우 기본값
      cpu_model: 'Unknown',
      cpu_cores: 'Unknown', 
      gpu_model: 'Unknown',
      gpu_count: '1',
      total_ram_gb: 'Unknown',
      storage_total_gb: 'Unknown'
    }
  };
}
