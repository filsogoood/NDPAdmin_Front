import { NextRequest, NextResponse } from 'next/server';
import { geocodingService } from '@/lib/geocodingService';

// Geocoding API 테스트용 엔드포인트
export async function GET(request: NextRequest) {
  try {
    // 테스트용 주소들
    const testAddresses = [
      "Ok-dong, Gwangju, Jeollanam-do",
      "Hyangdong, Goyang-si, Gyeonggi-do", 
      "Ok-Gil-dong, Bucheon, Gyeonggi-do"
    ];

    console.log('🧪 Geocoding API 테스트 시작...');

    const results: any[] = [];

    for (const address of testAddresses) {
      try {
        const coordinates = await geocodingService.getCoordinatesFromAddress(address);
        
        results.push({
          address,
          success: coordinates !== null,
          coordinates: coordinates || null,
          timestamp: new Date().toISOString()
        });

        console.log(`✅ ${address} → ${coordinates ? `[${coordinates[0]}, ${coordinates[1]}]` : 'FAILED'}`);
        
      } catch (error) {
        console.error(`❌ ${address} 실패:`, error);
        results.push({
          address,
          success: false,
          coordinates: null,
          error: error instanceof Error ? error.message : '알 수 없는 오류',
          timestamp: new Date().toISOString()
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    return NextResponse.json({
      message: `Geocoding 테스트 완료: ${successCount}/${results.length} 성공`,
      results,
      summary: {
        total: results.length,
        success: successCount,
        failed: results.length - successCount,
        successRate: `${((successCount / results.length) * 100).toFixed(1)}%`
      },
      cacheInfo: {
        cacheSize: geocodingService.getCacheSize()
      }
    });

  } catch (error) {
    console.error('Geocoding 테스트 오류:', error);
    
    return NextResponse.json(
      { 
        error: 'Geocoding 테스트 실패', 
        details: error instanceof Error ? error.message : '알 수 없는 오류' 
      },
      { status: 500 }
    );
  }
}

// POST로 개별 주소 테스트
export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();
    
    if (!address) {
      return NextResponse.json({ error: 'address 파라미터가 필요합니다' }, { status: 400 });
    }

    console.log(`🧪 개별 주소 테스트: ${address}`);

    const coordinates = await geocodingService.getCoordinatesFromAddress(address);
    
    const result = {
      address,
      success: coordinates !== null,
      coordinates: coordinates || null,
      timestamp: new Date().toISOString(),
      cacheSize: geocodingService.getCacheSize()
    };

    if (coordinates) {
      console.log(`✅ 성공: ${address} → [${coordinates[0]}, ${coordinates[1]}]`);
    } else {
      console.log(`❌ 실패: ${address}`);
    }
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('개별 주소 테스트 오류:', error);
    
    return NextResponse.json(
      { 
        error: '개별 주소 테스트 실패', 
        details: error instanceof Error ? error.message : '알 수 없는 오류' 
      },
      { status: 500 }
    );
  }
}
