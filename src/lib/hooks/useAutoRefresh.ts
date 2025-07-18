import { useEffect, useState, useRef, useCallback } from 'react';
import { apiClient } from '@/lib/api';

export interface AutoRefreshOptions {
  interval?: number; // 갱신 주기 (밀리초)
  enabled?: boolean; // 자동 갱신 활성화 여부
  onError?: (error: Error) => void; // 에러 핸들러
  onSuccess?: (data: any) => void; // 성공 핸들러
}

export interface AutoRefreshResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  isAutoRefreshEnabled: boolean;
  toggleAutoRefresh: () => void;
}

export function useAutoRefresh<T = any>(
  authToken: string | null,
  options: AutoRefreshOptions = {}
): AutoRefreshResult<T> {
  const {
    interval = 30000, // 기본값: 30초
    enabled = true,
    onError,
    onSuccess
  } = options;

  console.log('🔧 useAutoRefresh 훅 초기화');
  console.log('  - authToken:', authToken ? `${authToken.substring(0, 20)}...` : 'null');
  console.log('  - interval:', interval);
  console.log('  - enabled:', enabled);
  console.log('  - onSuccess 타입:', typeof onSuccess);
  console.log('  - onError 타입:', typeof onError);

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(enabled);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // 데이터 가져오기 함수
  const fetchData = useCallback(async () => {
    if (!authToken) {
      setError('인증 토큰이 필요합니다.');
      return;
    }

    if (!mountedRef.current) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('🌐 API 호출 시작:', new Date().toISOString());
      const result = await apiClient.getUserData(authToken);
      console.log('✅ API 호출 성공:', result);
      
      if (mountedRef.current) {
        setData(result);
        setLastUpdated(new Date());
        
        // onSuccess 콜백 실행 - 직접 호출
        if (onSuccess) {
          console.log('🎯 onSuccess 콜백 실행');
          console.log('  - 콜백 함수:', onSuccess);
          console.log('  - 전달할 데이터:', result);
          try {
            await onSuccess(result);
            console.log('✅ onSuccess 콜백 실행 완료');
          } catch (callbackError) {
            console.error('❌ onSuccess 콜백 실행 중 오류:', callbackError);
          }
        } else {
          console.warn('⚠️ onSuccess 콜백이 없습니다');
        }
      }
    } catch (err) {
      console.error('❌ API 호출 실패:', err);
      if (mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : '데이터를 가져오는 중 오류가 발생했습니다.';
        setError(errorMessage);
        
        // onError 콜백 실행 - 직접 호출
        if (onError) {
          console.log('🎯 onError 콜백 실행');
          try {
            onError(err instanceof Error ? err : new Error(errorMessage));
          } catch (callbackError) {
            console.error('❌ onError 콜백 실행 중 오류:', callbackError);
          }
        }
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [authToken, onSuccess, onError]); // 의존성 배열에 추가

  // 자동 갱신 토글
  const toggleAutoRefresh = useCallback(() => {
    setIsAutoRefreshEnabled(prev => !prev);
  }, []);

  // enabled prop이 변경될 때 isAutoRefreshEnabled 업데이트
  useEffect(() => {
    setIsAutoRefreshEnabled(enabled);
  }, [enabled]);

  // 수동 새로고침
  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // 초기 데이터 로드
  useEffect(() => {
    if (authToken) {
      console.log('🚀 초기 데이터 로드 시작');
      fetchData();
    }
  }, [authToken, fetchData]);

  // 자동 갱신 설정
  useEffect(() => {
    // 이전 interval 정리
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isAutoRefreshEnabled && authToken) {
      intervalRef.current = setInterval(() => {
        if (mountedRef.current) {
          console.log('⏰ 자동 갱신 타이머 실행');
          fetchData();
        }
      }, interval);
      
      console.log(`🔄 자동 갱신 활성화 (${interval / 1000}초 간격)`);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAutoRefreshEnabled, authToken, interval, fetchData]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    isAutoRefreshEnabled,
    toggleAutoRefresh
  };
}
