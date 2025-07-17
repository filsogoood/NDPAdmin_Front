// API 데이터를 WorldMap 컴포넌트에서 사용할 수 있도록 변환하는 유틸리티
import { geocodingService } from './geocodingService';

interface ApiNodeData {
  hardware_specs: {
    id: number;
    node_id: string;
    cpu_model: string;
    cpucores: string;
    gpu_model: string;
    gpu_vram_gb: string;
    total_ram_gb: string;
    storage_type: string;
    storage_total_gb: string;
    cpu_count: string;
    gpu_count: string;
    nvme_count: string;
    nanodc_id: string;
  }[];
  nodes: {
    id: number;
    node_id: string;
    user_uuid: string;
    status: string;
    create_at: string;
    update_at: string;
    node_name: string;
    nanodc_id: string;
  }[];
  node_usage: {
    id: number;
    node_id: string;
    timestamp: string;
    cpu_usage_percent: string;
    mem_usage_percent: string;
    gpu_usage_percent: string;
    gpu_temp: string;
    used_storage_gb: string;
    ssd_health_percent: string;
  }[];
  nanodc: {
    id: number;
    nanodc_id: string;
    country: string;
    address: string;
    ip: string;
    latitude: string;
    longtitude: string | null;
    name: string;
  }[];
  ndp_list: any[];
}

export interface MapNode {
  id: string;
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  status: 'active' | 'warning' | 'error' | 'pre';
  region: string;
  district: string;
  nodeCount: number;
  address: string;
  ip: string;
  usage?: {
    cpu: number;
    memory: number;
    gpu: number;
    temperature: number;
    storage: number;
  };
  hardware?: {
    cpu_model: string;
    cpu_cores: string;
    gpu_model: string;
    gpu_count: string;
    total_ram_gb: string;
    storage_total_gb: string;
  };
}

// Fallback 좌표 (Geocoding API 실패 시 사용)
const FALLBACK_COORDINATES = {
  'gwangju': { lat: 35.1595, lng: 126.8526 },
  'goyang': { lat: 37.6564, lng: 126.8353 },
  'bucheon': { lat: 37.4989, lng: 126.7831 },
  'seoul': { lat: 37.5665, lng: 126.9780 },
  'busan': { lat: 35.1796, lng: 129.0756 },
  'incheon': { lat: 37.4563, lng: 126.7052 },
  'default': { lat: 36.2002, lng: 127.7669 } // 한국 중심
};

// 주소에서 도시명 추출
function extractCityFromAddress(address: string): string {
  const addressLower = address.toLowerCase();
  
  if (addressLower.includes('gwangju')) return 'gwangju';
  if (addressLower.includes('goyang')) return 'goyang';
  if (addressLower.includes('bucheon')) return 'bucheon';
  if (addressLower.includes('seoul')) return 'seoul';
  if (addressLower.includes('busan')) return 'busan';
  if (addressLower.includes('incheon')) return 'incheon';
  
  return 'default';
}

// 좌표 생성 함수 (Geocoding API + Fallback)
async function generateCoordinates(
  address: string, 
  existingLat?: string, 
  existingLng?: string
): Promise<[number, number]> {
  // 1. 기존 경위도가 모두 있으면 사용
  if (existingLat && existingLng && existingLng !== 'null') {
    return [parseFloat(existingLng), parseFloat(existingLat)];
  }
  
  // 2. Geocoding API 시도
  try {
    const coordinates = await geocodingService.getCoordinatesFromAddress(address);
    if (coordinates) {
      console.log(`✅ Geocoding 성공: ${address} → [${coordinates[0]}, ${coordinates[1]}]`);
      return coordinates;
    }
  } catch (error) {
    console.warn(`⚠️ Geocoding API 실패: ${address}`, error);
  }
  
  // 3. Fallback: 하드코딩된 도시 좌표 사용
  const cityKey = extractCityFromAddress(address);
  const fallbackCoords = FALLBACK_COORDINATES[cityKey] || FALLBACK_COORDINATES.default;
  
  // 기존 위도가 있으면 우선 사용
  const finalLat = existingLat ? parseFloat(existingLat) : fallbackCoords.lat;
  const finalLng = fallbackCoords.lng;
  
  // 겹침 방지를 위한 랜덤 오프셋
  const offsetLng = (Math.random() - 0.5) * 0.01; // ±500m
  const offsetLat = (Math.random() - 0.5) * 0.01;
  
  console.log(`🔄 Fallback 사용: ${address} → [${finalLng + offsetLng}, ${finalLat + offsetLat}]`);
  
  return [finalLng + offsetLng, finalLat + offsetLat];
}

// 지역 정보 추출
function extractRegionInfo(address: string): { region: string; district: string } {
  const parts = address.split(',').map(part => part.trim());
  
  if (parts.length >= 3) {
    return {
      region: parts[2], // "Jeollanam-do"
      district: parts[1] // "Gwangju"  
    };
  } else if (parts.length >= 2) {
    return {
      region: parts[1],
      district: parts[0]
    };
  }
  
  return {
    region: address,
    district: address
  };
}

// 노드 상태 매핑
function mapNodeStatus(status: string): 'active' | 'warning' | 'error' | 'pre' {
  switch (status.toLowerCase()) {
    case 'active':
      return 'active';
    case 'warning':
      return 'warning';
    case 'error':
    case 'failed':
      return 'error';
    case 'pre':
    case 'pending':
      return 'pre';
    default:
      return 'pre';
  }
}

// API 데이터를 지도용 노드 데이터로 변환 (비동기)
export async function transformApiDataToMapNodes(apiData: ApiNodeData): Promise<MapNode[]> {
  const { nodes, nanodc, node_usage, hardware_specs } = apiData;
  
  console.log(`🚀 ${nanodc.length}개 노드의 좌표 생성 시작...`);
  
  // 모든 노드의 좌표를 비동기로 생성
  const nodePromises = nanodc.map(async (location) => {
    // nanodc_id로 관련 노드 정보 찾기
    const nodeInfo = nodes.find(node => 
      node.nanodc_id === location.nanodc_id
    );
    
    if (!nodeInfo) {
      console.warn(`⚠️ nanodc_id ${location.nanodc_id}에 해당하는 노드를 찾을 수 없습니다.`);
      return null; // 노드 정보가 없으면 null 반환
    }
    
    // node_id로 사용량 정보 찾기
    const usageInfo = node_usage.find(usage => 
      usage.node_id === nodeInfo.node_id
    );
    
    // node_id로 하드웨어 정보 찾기
    const hardwareInfo = hardware_specs.find(hw => 
      hw.node_id === nodeInfo.node_id
    );
    
    // 좌표 생성 (Geocoding API 사용)
    const coordinates = await generateCoordinates(
      location.address,
      location.latitude,
      location.longtitude
    );
    
    const { region, district } = extractRegionInfo(location.address);
    
    return {
      id: nodeInfo.node_id,
      name: nodeInfo.node_name || location.name,
      coordinates,
      status: mapNodeStatus(nodeInfo.status),
      region,
      district,
      nodeCount: 1,
      address: location.address,
      ip: location.ip,
      usage: usageInfo ? {
        cpu: parseFloat(usageInfo.cpu_usage_percent),
        memory: parseFloat(usageInfo.mem_usage_percent),
        gpu: parseFloat(usageInfo.gpu_usage_percent),
        temperature: parseFloat(usageInfo.gpu_temp),
        storage: parseInt(usageInfo.used_storage_gb)
      } : undefined,
      hardware: hardwareInfo ? {
        cpu_model: hardwareInfo.cpu_model,
        cpu_cores: hardwareInfo.cpucores,
        gpu_model: hardwareInfo.gpu_model,
        gpu_count: hardwareInfo.gpu_count,
        total_ram_gb: hardwareInfo.total_ram_gb,
        storage_total_gb: hardwareInfo.storage_total_gb
      } : undefined
    };
  });
  
  // null 값 제거 후 유효한 노드만 반환
  const mapNodesWithNull = await Promise.all(nodePromises);
  const mapNodes = mapNodesWithNull.filter((node): node is MapNode => node !== null);
  
  console.log(`✅ ${mapNodes.length}개 노드 좌표 생성 완료`);
  
  return mapNodes;
}

// 동일 위치 노드 클러스터링 처리
export function processNodeClusters(nodes: MapNode[]): MapNode[] {
  const clusters = new Map<string, MapNode[]>();
  const threshold = 0.01; // 약 1km 반경
  
  // 비슷한 위치의 노드들을 클러스터링
  nodes.forEach(node => {
    let foundCluster = false;
    
    for (const [key, cluster] of clusters) {
      const [clusterLng, clusterLat] = cluster[0].coordinates;
      const [nodeLng, nodeLat] = node.coordinates;
      
      const distance = Math.sqrt(
        Math.pow(clusterLng - nodeLng, 2) + Math.pow(clusterLat - nodeLat, 2)
      );
      
      if (distance < threshold) {
        cluster.push(node);
        foundCluster = true;
        break;
      }
    }
    
    if (!foundCluster) {
      clusters.set(node.id, [node]);
    }
  });
  
  // 클러스터별로 노드 개수 설정 및 위치 조정
  const processedNodes: MapNode[] = [];
  
  clusters.forEach(cluster => {
    cluster.forEach((node, index) => {
      const updatedNode = {
        ...node,
        nodeCount: cluster.length
      };
      
      // 같은 위치에 여러 노드가 있으면 약간씩 위치 조정
      if (cluster.length > 1) {
        const angle = (index * 360 / cluster.length) * Math.PI / 180;
        const offset = 0.005; // 약 500m 오프셋
        
        updatedNode.coordinates = [
          node.coordinates[0] + Math.cos(angle) * offset,
          node.coordinates[1] + Math.sin(angle) * offset
        ];
      }
      
      processedNodes.push(updatedNode);
    });
  });
  
  return processedNodes;
}

// 메인 함수: API 호출 및 데이터 변환
export async function fetchAndTransformNodeData(authToken: string): Promise<MapNode[]> {
  try {
    console.log('🔄 노드 데이터 가져오기 시작...');
    
    // API 호출
    const response = await fetch('/api/proxy?target=/api/users/data', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('인증이 만료되었거나 유효하지 않습니다.');
      }
      throw new Error(`API 호출 실패: ${response.status}`);
    }

    const apiData: ApiNodeData = await response.json();
    console.log('✅ API 데이터 가져오기 성공');

    // 데이터 변환 (Geocoding API 사용)
    const mapNodes = await transformApiDataToMapNodes(apiData);

    // 클러스터링 처리
    const processedNodes = processNodeClusters(mapNodes);

    console.log(`🎯 최종 처리된 노드 수: ${processedNodes.length}`);
    
    return processedNodes;
    
  } catch (error) {
    console.error('❌ 노드 데이터 가져오기 실패:', error);
    throw error;
  }
}
