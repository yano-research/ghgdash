import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',     // 외부 접속 허용
    port: 5173,           // 기본 포트
  }
})