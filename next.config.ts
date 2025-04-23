import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 이미지 도메인 설정 (Supabase Storage 사용 시 필요)
  images: {
    domains: ['jujrskehwsiomtexnhur.supabase.co'],
  },
  // ESLint 검사를 빌드 중에 무시
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;