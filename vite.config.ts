import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      // 브라우저에서는 /subway-api로 호출하고, 개발 서버가 서울 열린데이터 API로 전달합니다.
      "/subway-api": {
        target: "http://swopenapi.seoul.go.kr",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/subway-api/, "/api/subway"),
      },
    },
  },
});
