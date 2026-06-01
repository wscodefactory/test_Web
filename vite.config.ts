import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {

      "/subway-api": {
        target : "https://data.seoul.go.kr/dataList/OA-12764/A/1/datasetView.do", 
        changeOrigin: true,
        rewrite: (path) => 
          path.replace(
            /^\/subway-api/,
            "/api/subway"),
      },
    },
  },
});
