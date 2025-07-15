'use client';

import { Node } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDateTime, getPerformanceLevel, getSeverityColor } from '@/lib/utils';
import { 
  X, 
  Cpu, 
  Monitor, 
  HardDrive, 
  Thermometer,
  Activity,
  Clock,
  MapPin,
  Coins
} from 'lucide-react';

interface NodeDetailModalProps {
  node: Node | null;
  isOpen: boolean;
  onClose: () => void;
}

export function NodeDetailModal({ node, isOpen, onClose }: NodeDetailModalProps) {
  if (!isOpen || !node) return null;

  const performanceLevel = getPerformanceLevel(node.score.totalScore);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card-dark rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Monitor className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{node.name}</h2>
              <p className="text-sm text-muted-foreground flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>{node.location.city}, {node.location.country}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 내용 */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            {/* 상태 및 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">노드 상태</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">현재 상태</span>
                    <StatusBadge status={node.status.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">가동 시간</span>
                    <span className="text-sm font-medium text-foreground">
                      {node.status.uptime.toFixed(1)}시간
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">응답 시간</span>
                    <span className="text-sm font-medium text-foreground">
                      {node.status.responseTime}ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">마지막 하트비트</span>
                    <span className="text-sm font-mono text-foreground">
                      {formatDateTime(node.status.lastHeartbeat)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">성능 점수</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">하드웨어 점수</span>
                    <span className="text-sm font-bold text-foreground">
                      {node.score.hardwareScore}/100
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">성능 점수</span>
                    <span className="text-sm font-bold text-foreground">
                      {node.score.performanceScore}/100
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">총점</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-primary">
                        {node.score.totalScore.toFixed(1)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${performanceLevel.color} bg-current/10`}>
                        {performanceLevel.level}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">순위</span>
                    <span className="text-sm font-medium text-foreground">
                      #{node.score.rank}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 하드웨어 프로필 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="h-4 w-4 text-primary" />
                  <span>하드웨어 프로필</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {node.hardware.map((hw) => {
                    const getIcon = (type: string) => {
                      switch (type) {
                        case 'GPU': return Monitor;
                        case 'CPU': return Cpu;
                        case 'RAM': return Activity;
                        default: return HardDrive;
                      }
                    };
                    
                    const Icon = getIcon(hw.type);
                    
                    return (
                      <div key={hw.id} className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center space-x-2 mb-2">
                          <Icon className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">{hw.type}</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{hw.model}</p>
                        <p className="text-xs text-muted-foreground mt-1">{hw.specification}</p>
                        {hw.usage !== undefined && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>사용률</span>
                              <span>{hw.usage}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5">
                              <div 
                                className="bg-primary rounded-full h-1.5 transition-all duration-300"
                                style={{ width: `${hw.usage}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 실시간 상태 (시뮬레이션) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span>실시간 모니터링</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Cpu className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">CPU 사용률</p>
                    <p className="text-lg font-bold text-foreground">{node.performance.cpuUsage}%</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Monitor className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">GPU 사용률</p>
                    <p className="text-lg font-bold text-foreground">{node.performance.gpuUsage}%</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Thermometer className="h-6 w-6 text-red-500 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">GPU 온도</p>
                    <p className="text-lg font-bold text-foreground">{node.performance.temperature.gpu}°C</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Activity className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">네트워크 지연</p>
                    <p className="text-lg font-bold text-foreground">{node.performance.networkLatency}ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 이력 로그 (데모의 핵심) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>투명한 이력 추적 (Provenance Log)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {node.historyLogs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getSeverityColor(log.severity || 'info')}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">{log.title}</span>
                          <span className="text-xs font-mono text-muted-foreground">
                            {formatDateTime(log.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{log.description}</p>
                        <div className="mt-1 flex items-center space-x-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">
                            {log.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-xs text-primary">
                    💡 <strong>투명성 보장:</strong> 모든 하드웨어 변경사항과 상태 업데이트가 
                    암호학적으로 서명되어 불변의 기록으로 관리됩니다. 
                    이를 통해 컴퓨팅 리소스의 출처와 품질을 완전히 검증할 수 있습니다.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 가격 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Coins className="h-4 w-4 text-primary" />
                  <span>가격 정보</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">시간당 가격</p>
                    <p className="text-2xl font-bold text-foreground">
                      {node.pricing.pricePerHour} <span className="text-lg text-primary">NDP</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">등록일</p>
                    <p className="text-sm font-mono text-foreground">
                      {formatDateTime(node.registrationDate)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
