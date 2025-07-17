'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Server, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { authService } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 가짜 토큰 자동 삭제 및 로그인 상태 확인
  useEffect(() => {
    // 가짜 토큰이 있다면 삭제
    const currentToken = localStorage.getItem('authToken');
    if (currentToken === 'test-token-for-development') {
      console.log('🧹 가짜 토큰 삭제 중...');
      localStorage.removeItem('authToken');
      setErrorMessage('테스트 토큰이 삭제되었습니다. 정상 로그인을 진행해주세요.');
      return;
    }
    
    // 이미 유효한 토큰이 있다면 대시보드로 리다이렉트
    if (authService.isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      await authService.login(formData.username, formData.password);
      // 로그인 성공 시 대시보드로 이동
      router.push('/dashboard');
    } catch (error) {
      // 로그인 실패 시 에러 메시지 표시
      setErrorMessage(error instanceof Error ? error.message : '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md fade-in">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center space-x-3 mb-4">
            <Server className="h-12 w-12 text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-100">NDP Admin</h1>
          </div>
          <p className="text-gray-400">
            탈중앙화 물리적 인프라 네트워크 관리 시스템
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">로그인</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-md">
                  {errorMessage}
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-gray-100">
                  사용자명
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="사용자명을 입력하세요"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-100">
                  비밀번호
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="비밀번호를 입력하세요"
                    className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-100 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>로그인 중...</span>
                  </div>
                ) : (
                  '로그인'
                )}
              </button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            © 2025 ZetaCube. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
