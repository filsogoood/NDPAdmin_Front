// Geocoding API 호출을 위한 서비스 클래스

interface GeocodeResult {
  lat: number;
  lng: number;
  formatted_address: string;
}

export class GeocodingService {
  private cache: Map<string, GeocodeResult> = new Map();

  async getCoordinatesFromAddress(address: string): Promise<[number, number] | null> {
    try {
      // 캐시 확인
      if (this.cache.has(address)) {
        const cached = this.cache.get(address)!;
        return [cached.lng, cached.lat];
      }

      // API 호출
      const response = await fetch('/api/geocoding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        console.warn(`Geocoding 실패 (${response.status}): ${address}`);
        return null;
      }

      const result: GeocodeResult = await response.json();
      
      // 캐시에 저장
      this.cache.set(address, result);
      
      console.log(`Geocoding 성공: ${address} → [${result.lng}, ${result.lat}]`);
      
      return [result.lng, result.lat]; // [경도, 위도] 순서
      
    } catch (error) {
      console.error(`Geocoding 오류: ${address}`, error);
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

  // 캐시 클리어
  clearCache(): void {
    this.cache.clear();
  }

  // 캐시 상태 확인
  getCacheSize(): number {
    return this.cache.size;
  }
}

// 싱글톤 인스턴스
export const geocodingService = new GeocodingService();
