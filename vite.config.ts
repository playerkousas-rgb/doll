import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 相對路徑，方便部署到 GitHub Pages 子目錄
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5173,
    // 允許 Arena 預覽網域（DNS rebinding 保護會擋下未知 Host）
    allowedHosts: true,
  },
})
