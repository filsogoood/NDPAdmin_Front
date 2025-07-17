// 가짜 토큰 즉시 삭제 스크립트
// 브라우저 콘솔에서 실행하거나, 새 파일로 저장 후 import

export function cleanupFakeTokens() {
  const currentToken = localStorage.getItem('authToken');
  
  console.log('🔍 현재 토큰 확인:', currentToken);
  
  if (currentToken === 'test-token-for-development') {
    console.log('🚫 가짜 토큰 발견! 삭제 중...');
    localStorage.removeItem('authToken');
    console.log('✅ 가짜 토큰 삭제 완료');
    
    // 페이지 새로고침으로 상태 초기화
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  } else if (currentToken && currentToken.startsWith('eyJ')) {
    console.log('✅ 유효한 JWT 토큰 감지됨');
  } else if (!currentToken) {
    console.log('ℹ️ 토큰이 없습니다. 로그인이 필요합니다.');
  } else {
    console.log('⚠️ 알 수 없는 토큰 형식:', currentToken);
  }
}

// 즉시 실행
if (typeof window !== 'undefined') {
  cleanupFakeTokens();
}
