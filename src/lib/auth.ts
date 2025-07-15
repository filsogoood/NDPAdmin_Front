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

  logout(): void {
    localStorage.removeItem('authToken');
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}

// 싱글톤 인스턴스 생성
export const authService = new AuthService();
