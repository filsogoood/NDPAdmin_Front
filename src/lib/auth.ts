import { apiClient, LoginRequest, LoginResponse } from './api';

export class AuthService {
  async login(username: string, password: string): Promise<LoginResponse> {
    const credentials: LoginRequest = {
      user_id: username,
      password: password,
    };

    const response = await apiClient.login(credentials);
    
    // 로그인 성공 시 토큰을 localStorage에 저장
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  }

  async getUserData(): Promise<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }
    
    return apiClient.getUserData(token);
  }

  logout(): void {
    localStorage.removeItem('authToken');
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      
      // 가짜 토큰 감지 및 자동 삭제
      if (token === 'test-token-for-development') {
        console.log('🚫 가짜 토큰 감지됨. 자동 삭제 중...');
        localStorage.removeItem('authToken');
        return null;
      }
      
      return token;
    }
    return null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    // getToken()에서 이미 가짜 토큰을 처리하므로, null이 아닌 경우만 인증된 것으로 판단
    return token !== null && token.length > 0;
  }
}

// 싱글톤 인스턴스 생성
export const authService = new AuthService();
