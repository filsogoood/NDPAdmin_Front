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
      const response = await fetch(`${this.baseUrl}/api/users/login`, {
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
        throw new Error('서버에서 오류가 발생했습니다.');
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
