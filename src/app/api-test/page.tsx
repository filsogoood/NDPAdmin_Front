'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';

export default function ApiTestPage() {
  const [token, setToken] = useState('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 로그인 관련 상태
  const [loginData, setLoginData] = useState({ user_id: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginResult, setLoginResult] = useState<any>(null);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('API GET 호출 시작...');
      console.log('토큰:', token);
      
      const data = await apiClient.getUserData(token);
      
      console.log('API GET 응답:', data);
      setResult(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      console.error('API GET 오류:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const testApiPost = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('API POST 호출 시작...');
      console.log('토큰:', token);
      
      const data = await apiClient.getUserDataPost(token);
      
      console.log('API POST 응답:', data);
      setResult(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      console.error('API POST 오류:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const doLogin = async () => {
    if (!loginData.user_id || !loginData.password) {
      alert('아이디와 패스워드를 입력해주세요.');
      return;
    }

    setLoginLoading(true);
    setError(null);
    setLoginResult(null);

    try {
      console.log('로그인 시도:', loginData.user_id);
      
      const response = await apiClient.login(loginData);
      
      console.log('로그인 성공:', response);
      setLoginResult(response);
      
      // 받은 토큰을 자동으로 설정
      if (response.token) {
        setToken(response.token);
        alert('로그인 성공! 토큰이 자동으로 설정되었습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '로그인 실패';
      console.error('로그인 오류:', err);
      setError(errorMessage);
    } finally {
      setLoginLoading(false);
    }
  };

  const testWithLocalStorageToken = () => {
    const localToken = localStorage.getItem('authToken');
    if (localToken) {
      setToken(localToken);
    } else {
      alert('localStorage에 authToken이 없습니다.');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto text-black">
      <h1 className="text-2xl font-bold mb-6 text-black">API 연결 테스트</h1>
      
      <div className="space-y-6">
        {/* 로그인 섹션 */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h2 className="text-lg font-semibold mb-4 text-black">1. 로그인해서 유효한 토큰 받기</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-black">아이디:</label>
              <input
                type="text"
                value={loginData.user_id}
                onChange={(e) => setLoginData({...loginData, user_id: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md text-black"
                placeholder="사용자 아이디"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-black">패스워드:</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md text-black"
                placeholder="패스워드"
              />
            </div>
          </div>
          
          <button
            onClick={doLogin}
            disabled={loginLoading}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-400"
          >
            {loginLoading ? '로그인 중...' : '로그인'}
          </button>
          
          {loginResult && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-semibold text-black mb-2">로그인 성공!</h3>
              <pre className="bg-white p-2 rounded border text-sm overflow-auto text-black">
                {JSON.stringify(loginResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* 토큰 섹션 */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h2 className="text-lg font-semibold mb-4 text-black">2. Bearer 토큰 확인/수정</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-black">Bearer Token:</label>
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm text-black"
              rows={3}
              placeholder="Bearer 토큰을 입력하세요"
            />
          </div>
          
          <button
            onClick={testWithLocalStorageToken}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            localStorage 토큰 사용
          </button>
        </div>

        {/* API 테스트 섹션 */}
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-md">
          <h2 className="text-lg font-semibold mb-4 text-black">3. API 테스트</h2>
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={testApi}
              disabled={loading || !token}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? '테스트 중...' : 'GET /api/users/data'}
            </button>
            
            <button
              onClick={testApiPost}
              disabled={loading || !token}
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-400"
            >
              {loading ? '테스트 중...' : 'POST /api/users/data'}
            </button>
          </div>
        </div>

        {/* 결과 섹션 */}
        {loading && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center text-black">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              API 요청 중...
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="font-semibold text-black mb-2">오류 발생:</h3>
            <p className="text-black">{error}</p>
          </div>
        )}

        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="font-semibold text-black mb-2">API 응답 성공:</h3>
            <pre className="bg-white p-3 rounded border overflow-auto text-sm text-black">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* 토큰 정보 */}
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h3 className="font-semibold mb-2 text-black">현재 토큰 정보:</h3>
          <div className="text-sm text-black">
            <p><strong>Algorithm:</strong> HS256</p>
            <p><strong>Subject:</strong> 1234</p>
            <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL}/api/users/data</p>
          </div>
        </div>
      </div>
    </div>
  );
}