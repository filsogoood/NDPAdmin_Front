// Geocoding API 호출을 위한 서비스 클래스

interface GeocodeResult {
  lat: number;
  lng: number;
  formatted_address: string;
}

export class GeocodingService {
  private cache: Map<string, GeocodeResult> = new Map();

  async getCoordinatesFromAddress(address: string): Promise<[number, number] | null> {
    console.log(`🌍 GeocodingService.getCoordinatesFromAddress 시작: ${address}`);
    
    try {
      // 캐시 확인
      if (this.cache.has(address)) {
        const cached = this.cache.get(address)!;
        console.log(`✅ 캐시에서 찾음: ${address} → [${cached.lng}, ${cached.lat}]`);
        return [cached.lng, cached.lat];
      }

      console.log(`🔄 지오코딩 API 호출 시작: ${address}`);
      
      // API 호출
      const response = await fetch('/api/geocoding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      console.log(`📡 지오코딩 API 응답 상태: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        console.warn(`⚠️ 지오코딩 API 실패 (${response.status}): ${address}`);
        return null;
      }

      const result: GeocodeResult = await response.json();
      console.log(`✅ 지오코딩 API 응답 받음:`, result);
      
      // 캐시에 저장
      this.cache.set(address, result);
      console.log(`💾 캐시에 저장: ${address}`);
      
      console.log(`✅ 지오코딩 성공: ${address} → [${result.lng}, ${result.lat}]`);
      
      return [result.lng, result.lat]; // [경도, 위도] 순서
      
    } catch (error) {
      console.error(`❌ 지오코딩 오류: ${address}`, error);
      console.error(`❌ 오류 스택:`, error instanceof Error ? error.stack : '스택 없음');
      return null;
    }
  }

  // 배치 처리 (여러 주소 동시 처리)
  async batchGeocode(addresses: string[]): Promise<Map<string, [number, number] | null>> {
    const results = new Map<string, [number, number] | null>();
    
    // 병렬 처리 (API 제한을 고려해 5개씩 처리)
    const batchSize = 5;
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize);
      const promises = batch.map(address => 
        this.getCoordinatesFromAddress(address)
          .then(coords => ({ address, coords }))
      );
      
      const batchResults = await Promise.all(promises);
      batchResults.forEach(({ address, coords }) => {
        results.set(address, coords);
      });
      
      // API 제한을 고려한 딜레이 (필요시)
      if (i + batchSize < addresses.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }

  clearCache() {
    console.log('🗑️ 지오코딩 캐시 클리어');
    this.cache.clear();
  }

  getCacheSize() {
    const size = this.cache.size;
    console.log(`📊 현재 캐시 크기: ${size}개`);
    return size;
  }
}

// 싱글톤 인스턴스
export const geocodingService = new GeocodingService();
