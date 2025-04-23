import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 이미지 도메인 설정
  images: {
    domains: ['jujrskehwsiomtexnhur.supabase.co'],
  },
  // ESLint 검사 건너뛰기
  eslint: {
    ignoreDuringBuilds: true,
  },
  // TypeScript 타입 체크 건너뛰기 추가
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;