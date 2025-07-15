'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent } from '@/components/Card';
import { dashboardMetrics } from '@/lib/mockData';
import { formatNumber } from '@/lib/utils';
import { authService } from '@/lib/auth';
import { 
  Server, 
  Activity, 
  TrendingUp, 
  Zap,
  Clock,
  DollarSign
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  
  // 페이지 로드 시 인증 체크
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/');
    }
  }, [router]);
  const { networkStats } = dashboardMetrics;

  const kpiCards = [
    {
      title: '총 등록 노드',
      value: networkStats.totalNodes,
      unit: '개',
      icon: Server,
      color: 'text-blue-400',
      description: '네트워크에 등록된 전체 노드 수'
    },
    {
      title: '활성 노드',
      value: networkStats.activeNodes,
      unit: '개',
      icon: Activity,
      color: 'text-green-400',
      description: '현재 온라인 상태인 노드 수'
    },
    {
      title: 'GPU 연산 능력',
      value: networkStats.totalGpuPower,
      unit: 'TFLOPS',
      icon: Zap,
      color: 'text-purple-400',
      description: '전체 네트워크 GPU 성능'
    },
    {
      title: '평균 노드 점수',
      value: networkStats.averageScore,
      unit: '점',
      icon: TrendingUp,
      color: 'text-cyan-400',
      description: '네트워크 전체 노드 평균 품질 점수'
    },
    {
      title: '총 거래 수',
      value: networkStats.totalTransactions,
      unit: '건',
      icon: DollarSign,
      color: 'text-orange-400',
      description: '누적 컴퓨팅 거래 건수'
    },
    {
      title: '네트워크 가동률',
      value: networkStats.networkUptime,
      unit: '%',
      icon: Clock,
      color: 'text-emerald-400',
      description: '전체 네트워크 안정성 지표'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">네트워크 대시보드</h1>
          <p className="text-gray-400">
            NDP 네트워크의 실시간 현황과 성능 지표를 확인하세요
          </p>
        </div>

        {/* KPI 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {kpiCards.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card key={index} hover className="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-400 mb-1">
                        {kpi.title}
                      </p>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-2xl font-bold text-gray-100">
                          {typeof kpi.value === 'number' && kpi.value > 1000 
                            ? formatNumber(kpi.value) 
                            : kpi.value.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-400">
                          {kpi.unit}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {kpi.description}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full bg-gray-700 ${kpi.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
