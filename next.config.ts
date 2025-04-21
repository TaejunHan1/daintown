import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 이미지 도메인 설정 (Supabase Storage 사용 시 필요)
  images: {
    domains: ['jujrskehwsiomtexnhur.supabase.co'],
  },
};

export default nextConfig;