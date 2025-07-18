import { NextRequest, NextResponse } from 'next/server';

interface GeocodeResponse {
  lat: number;
  lng: number;
  formatted_address: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🌐 지오코딩 API POST 요청 시작');
    
    const { address } = await request.json();
    console.log('🏠 요청 주소:', address);
    
    if (!address) {
      console.error('❌ 주소 파라미터 누락');
      return NextResponse.json({ error: 'address 파라미터가 필요합니다' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('❌ Google Maps API 키 누락');
      return NextResponse.json({ error: 'Google Maps API 키가 설정되지 않았습니다' }, { status: 500 });
    }

    // Google Geocoding API 호출
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    console.log('🔄 Google Geocoding API 호출 시작:', address);
    
    const startTime = Date.now();
    const response = await fetch(geocodingUrl);
    const endTime = Date.now();
    
    console.log(`📡 Google API 응답 완료 (${endTime - startTime}ms):`, response.status);
    
    const data = await response.json();
    console.log('📊 Google API 응답 데이터:', data);

    if (data.status !== 'OK') {
      console.warn(`⚠️ Google Geocoding 실패: ${data.status} - ${data.error_message || ''}`);
      return NextResponse.json(
        { error: `Geocoding 실패: ${data.status}`, details: data.error_message },
        { status: 400 }
      );
    }

    if (!data.results || data.results.length === 0) {
      console.warn(`⚠️ 주소를 찾을 수 없음: ${address}`);
      return NextResponse.json(
        { error: '주소를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    const result = data.results[0];
    const location = result.geometry.location;

    const geocodeResponse: GeocodeResponse = {
      lat: location.lat,
      lng: location.lng,
      formatted_address: result.formatted_address
    };

    console.log(`✅ Geocoding 성공: ${address} → [${location.lng}, ${location.lat}]`);
    
    return NextResponse.json(geocodeResponse);

  } catch (error) {
    console.error('❌ Geocoding API 오류:', error);
    console.error('❌ 오류 스택:', error instanceof Error ? error.stack : '스택 없음');
    
    return NextResponse.json(
      { error: 'Geocoding API 오류', details: error instanceof Error ? error.message : '알 수 없는 오류' },
      { status: 500 }
    );
  }
}

// GET 메서드도 지원 (쿼리 파라미터로)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    
    if (!address) {
      return NextResponse.json({ error: 'address 파라미터가 필요합니다' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Google Maps API 키가 설정되지 않았습니다' }, { status: 500 });
    }

    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    
    const response = await fetch(geocodingUrl);
    const data = await response.json();

    if (data.status !== 'OK') {
      return NextResponse.json(
        { error: `Geocoding 실패: ${data.status}`, details: data.error_message },
        { status: 400 }
      );
    }

    if (!data.results || data.results.length === 0) {
      return NextResponse.json(
        { error: '주소를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    const result = data.results[0];
    const location = result.geometry.location;

    const geocodeResponse: GeocodeResponse = {
      lat: location.lat,
      lng: location.lng,
      formatted_address: result.formatted_address
    };
    
    return NextResponse.json(geocodeResponse);

  } catch (error) {
    console.error('Geocoding API 오류:', error);
    
    return NextResponse.json(
      { error: 'Geocoding API 오류', details: error instanceof Error ? error.message : '알 수 없는 오류' },
      { status: 500 }
    );
  }
}
