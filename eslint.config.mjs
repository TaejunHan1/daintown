import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',      // 사용하지 않는 변수 경고
      '@typescript-eslint/no-explicit-any': 'warn',     // any 타입 사용 경고
      'react-hooks/exhaustive-deps': 'warn',            // useEffect 의존성 경고
      '@next/next/no-img-element': 'warn',              // img 태그 사용 경고
      '@typescript-eslint/no-unsafe-function-type': 'warn' // Function 타입 관련 경고
    }
  }
];

export default eslintConfig;