// API 클라이언트 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.100.102';

export interface LoginRequest {
  user_id: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // 프록시를 통해 로그인 요청
      const response = await fetch(`/api/proxy?target=/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('아이디 또는 비밀번호가 잘못되었습니다.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`서버에서 오류가 발생했습니다. (${response.status}) - ${errorData.error || errorData.details || ''}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('네트워크 연결을 확인해주세요.');
    }
  }

  async getUserData(token: string): Promise<any> {
    try {
      // 프록시를 통해 요청 (CORS 우회)
      const response = await fetch(`/api/proxy?target=/api/users/data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('인증이 만료되었거나 유효하지 않습니다.');
        }
        if (response.status === 403) {
          throw new Error('접근 권한이 없습니다.');
        }
        
        // 프록시에서 오는 에러 정보도 포함
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`서버에서 오류가 발생했습니다. (${response.status}) - ${errorData.error || errorData.details || ''}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('네트워크 연결을 확인해주세요.');
    }
  }

  async getUserDataPost(token: string, requestBody?: any): Promise<any> {
    try {
      // POST 메서드로 테스트
      const response = await fetch(`/api/proxy?target=/api/users/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody || {}),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('인증이 만료되었거나 유효하지 않습니다.');
        }
        if (response.status === 403) {
          throw new Error('접근 권한이 없습니다.');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`서버에서 오류가 발생했습니다. (${response.status}) - ${errorData.error || errorData.details || ''}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('네트워크 연결을 확인해주세요.');
    }
  }
}

// 싱글톤 인스턴스 생성
export const apiClient = new ApiClient();
