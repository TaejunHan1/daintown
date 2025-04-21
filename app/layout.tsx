// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "다인타운 - 쇼핑과 비즈니스의 중심",
  description: "다인타운은 지하 1층부터 지상 9층까지 다양한 상점과 비즈니스 공간을 제공합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* 서명에 사용할 한글 폰트 추가 */}
        <link href="https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&family=Nanum+Brush+Script&family=Jeju+Myeongjo&family=Gowun+Dodum&family=Song+Myung&family=Gaegu&family=Do+Hyeon&family=Jua&family=Gamja+Flower&family=Cute+Font&family=Yeon+Sung&family=Black+Han+Sans&family=Single+Day&family=Poor+Story&family=Hi+Melody&family=East+Sea+Dokdo&family=Stylish&family=Sunflower:wght@300&family=Gothic+A1:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}