import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.100.102:8080';

export async function GET(request: NextRequest) {
  try {
    // URL에서 target 파라미터 추출
    const { searchParams } = new URL(request.url);
    const target = searchParams.get('target');
    
    if (!target) {
      return NextResponse.json({ error: 'target 파라미터가 필요합니다' }, { status: 400 });
    }

    // Authorization 헤더 추출
    const authorization = request.headers.get('authorization');
    
    if (!authorization) {
      return NextResponse.json({ error: 'Authorization 헤더가 필요합니다' }, { status: 401 });
    }

    console.log(`프록시 요청: ${BACKEND_BASE_URL}${target}`);
    console.log(`Authorization: ${authorization}`);

    // 백엔드로 요청 전송
    const response = await fetch(`${BACKEND_BASE_URL}${target}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorization,
      },
    });

    console.log(`백엔드 응답 상태: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`백엔드 오류 응답: ${errorText}`);
      
      return NextResponse.json(
        { error: `백엔드 오류: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('백엔드 응답 데이터:', data);

    return NextResponse.json(data);

  } catch (error) {
    console.error('프록시 오류:', error);
    
    return NextResponse.json(
      { error: '프록시 서버 오류', details: error instanceof Error ? error.message : '알 수 없는 오류' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const target = searchParams.get('target');
    
    if (!target) {
      return NextResponse.json({ error: 'target 파라미터가 필요합니다' }, { status: 400 });
    }

    const authorization = request.headers.get('authorization');
    const body = await request.text();

    console.log(`프록시 POST 요청: ${BACKEND_BASE_URL}${target}`);

    const response = await fetch(`${BACKEND_BASE_URL}${target}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization && { 'Authorization': authorization }),
      },
      body: body,
    });

    console.log(`백엔드 응답 상태: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `백엔드 오류: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('프록시 POST 오류:', error);
    
    return NextResponse.json(
      { error: '프록시 서버 오류', details: error instanceof Error ? error.message : '알 수 없는 오류' },
      { status: 500 }
    );
  }
}