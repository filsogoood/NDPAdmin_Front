'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Server, Cpu, HardDrive, Gauge, Thermometer, Database } from 'lucide-react';
import type { MapNode } from '@/lib/nodeLocationMapper';

interface NodeDetailPanelProps {
  node: MapNode | null;
  isOpen: boolean;
  onClose: () => void;
}

export function NodeDetailPanel({ node, isOpen, onClose }: NodeDetailPanelProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const prevIsOpenRef = useRef(isOpen);

  // 클라이언트에서만 Portal 렌더링
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // isOpen이 처음 true로 변경될 때만 애니메이션 실행
  useEffect(() => {
    const prevIsOpen = prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;
    
    // 이전 상태가 false이고 현재 상태가 true일 때만 애니메이션 시작
    if (!prevIsOpen && isOpen && !isAnimating) {
      setIsAnimating(true);
      // 애니메이션이 완료된 후 상태 업데이트
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    } else if (!isOpen) {
      // 패널이 닫힐 때는 애니메이션 상태 리셋
      setIsAnimating(false);
    }
  }, [isOpen]);

  // ESC 키로 패널 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // 스크롤 방지
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!node || !isMounted) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      case 'pre': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-500/20 border-green-500/50';
      case 'warning': return 'bg-yellow-500/20 border-yellow-500/50';
      case 'error': return 'bg-red-500/20 border-red-500/50';
      case 'pre': return 'bg-blue-500/20 border-blue-500/50';
      default: return 'bg-gray-500/20 border-gray-500/50';
    }
  };

  const panelContent = (
    <>
      {/* 오버레이 */}
      <div 
        className={`fixed inset-0 backdrop-blur-sm transition-all duration-500 ease-out ${
          isOpen 
            ? 'bg-black/60 opacity-100 z-[9998] backdrop-fade-in' 
            : 'bg-black/0 opacity-0 pointer-events-none z-[-1] backdrop-fade-out'
        }`}
        onClick={onClose}
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh'
        }}
      />

      {/* 슬라이드 패널 */}
      <div 
        className={`fixed top-0 right-0 h-full bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 shadow-2xl border-l border-gray-600/50 transition-all duration-500 ease-out ${
          isOpen 
            ? 'translate-x-0 z-[9999] slide-panel-enter' 
            : 'translate-x-full z-[-1] slide-panel-exit'
        }`}
        style={{ 
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: 'min(500px, 90vw)',
          minWidth: '320px',
          maxWidth: '500px',
          zIndex: isOpen ? 9999 : -1,
          boxShadow: isOpen ? '-10px 0 30px rgba(0, 0, 0, 0.3)' : 'none',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="h-full overflow-y-auto custom-scrollbar">
          {/* 헤더 */}
          <div className="sticky top-0 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800 border-b border-gray-700/50 p-6 flex items-center justify-between backdrop-blur-sm">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                  <Server className="w-6 h-6 text-blue-400" />
                </div>
                <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  {node.name}
                </span>
              </h2>
              <div className="flex items-center gap-3 mt-3">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusBgColor(node.status)} backdrop-blur-sm`}>
                  <span className={`w-2.5 h-2.5 rounded-full mr-2 ${getStatusColor(node.status)} animate-pulse`} />
                  <span className={getStatusColor(node.status)}>{node.status.toUpperCase()}</span>
                </span>
                <span className="text-gray-300 text-sm bg-gray-800/50 px-3 py-1 rounded-full border border-gray-600/30">
                  📍 {node.region}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-gray-800/50 rounded-xl transition-all duration-200 border border-gray-700/50 hover:border-gray-600/50 ml-4"
              title="패널 닫기"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
            </button>
          </div>

          {/* 컨텐츠 */}
          <div className="p-6 space-y-6">
            {/* 기본 정보 */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5 space-y-4 hover:bg-gray-800/70 transition-all duration-300">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                노드 정보
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600/30">
                  <span className="text-gray-400 block mb-1">IP 주소</span>
                  <p className="text-white font-mono text-base font-semibold">{node.ip}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600/30">
                  <span className="text-gray-400 block mb-1">위치</span>
                  <p className="text-white font-semibold">{node.district}</p>
                </div>
                <div className="col-span-2 bg-gray-900/50 rounded-lg p-3 border border-gray-600/30">
                  <span className="text-gray-400 block mb-1">주소</span>
                  <p className="text-white text-sm leading-relaxed">{node.address}</p>
                </div>
              </div>
            </div>

            {/* 하드웨어 스펙 */}
            {node.hardware && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5 hover:bg-gray-800/70 transition-all duration-300">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-green-500 rounded-full"></div>
                  <Cpu className="w-5 h-5 text-green-400" />
                  하드웨어 스펙
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600/30 flex justify-between items-center">
                    <span className="text-gray-400 flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      CPU
                    </span>
                    <span className="text-white font-semibold">{node.hardware.cpu_model} ({node.hardware.cpu_cores} cores)</span>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600/30 flex justify-between items-center">
                    <span className="text-gray-400 flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      GPU
                    </span>
                    <span className="text-white font-semibold">{node.hardware.gpu_model} x{node.hardware.gpu_count}</span>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600/30 flex justify-between items-center">
                    <span className="text-gray-400 flex items-center gap-2">
                      <HardDrive className="w-4 h-4" />
                      RAM
                    </span>
                    <span className="text-white font-semibold">{node.hardware.total_ram_gb} GB</span>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600/30 flex justify-between items-center">
                    <span className="text-gray-400 flex items-center gap-2">
                      <HardDrive className="w-4 h-4" />
                      Storage
                    </span>
                    <span className="text-white font-semibold">{node.hardware.storage_total_gb} GB</span>
                  </div>
                </div>
              </div>
            )}

            {/* 실시간 사용량 게이지 */}
            {node.usage && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5 hover:bg-gray-800/70 transition-all duration-300">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-yellow-500 rounded-full"></div>
                  <Gauge className="w-5 h-5 text-yellow-400" />
                  실시간 사용량
                </h3>
                <div className="space-y-5">
                  {/* CPU 사용률 */}
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600/30">
                    <div className="flex justify-between items-center text-sm mb-3">
                      <span className="text-gray-400 flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-blue-400" />
                        CPU 사용률
                      </span>
                      <span className="text-white font-bold text-lg">{node.usage.cpu}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-blue-400 h-3 rounded-full transition-all duration-700 ease-out shadow-lg"
                        style={{ width: `${node.usage.cpu}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* 메모리 사용률 */}
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600/30">
                    <div className="flex justify-between items-center text-sm mb-3">
                      <span className="text-gray-400 flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-green-400" />
                        메모리 사용률
                      </span>
                      <span className="text-white font-bold text-lg">{node.usage.memory}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-green-600 to-green-400 h-3 rounded-full transition-all duration-700 ease-out shadow-lg"
                        style={{ width: `${node.usage.memory}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* GPU 사용률 */}
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600/30">
                    <div className="flex justify-between items-center text-sm mb-3">
                      <span className="text-gray-400 flex items-center gap-2">
                        <Database className="w-4 h-4 text-yellow-400" />
                        GPU 사용률
                      </span>
                      <span className="text-white font-bold text-lg">{node.usage.gpu}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-3 rounded-full transition-all duration-700 ease-out shadow-lg"
                        style={{ width: `${node.usage.gpu}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* 온도 */}
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-orange-500/20 border border-orange-500/30">
                          <Thermometer className="w-5 h-5 text-orange-400" />
                        </div>
                        <span className="text-gray-300 font-medium">GPU 온도</span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-bold text-2xl">{node.usage.temperature}°C</span>
                        <div className={`text-xs mt-1 ${
                          parseInt(node.usage.temperature) > 80 ? 'text-red-400' :
                          parseInt(node.usage.temperature) > 60 ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>
                          {parseInt(node.usage.temperature) > 80 ? '⚠️ 주의' :
                           parseInt(node.usage.temperature) > 60 ? '🔥 보통' :
                           '❄️ 양호'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 스토리지 사용량 */}
            {node.usage && node.hardware && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5 hover:bg-gray-800/70 transition-all duration-300">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                  <HardDrive className="w-5 h-5 text-purple-400" />
                  스토리지 사용량
                </h3>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600/30">
                  <div className="flex justify-between items-center text-sm mb-3">
                    <span className="text-gray-400">사용 중</span>
                    <span className="text-white font-bold text-lg">
                      {node.usage.storage} GB / {node.hardware.storage_total_gb} GB
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-purple-400 h-3 rounded-full transition-all duration-700 ease-out shadow-lg"
                      style={{ width: `${(node.usage.storage / parseInt(node.hardware.storage_total_gb)) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>여유 공간: {parseInt(node.hardware.storage_total_gb) - node.usage.storage} GB</span>
                    <span>사용률: {Math.round((node.usage.storage / parseInt(node.hardware.storage_total_gb)) * 100)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  // Portal을 사용하여 document.body에 직접 렌더링
  return createPortal(panelContent, document.body);
}