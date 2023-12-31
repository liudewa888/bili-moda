import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue()],
  optimizeDeps: {
  },
  server:{
    host:'0.0.0.0',
    proxy: {
      "/api": {
        // 选项写法
        target: "http://127.0.0.1:9080",
        changeOrigin: true,
        rewrite: (path) => {
          path = path.replace(/^\/api/, "");
          // 进行调试输出
          console.log('vite proxy url: ',path);
          return path;
        },
      },
      // "/api": {
      //   // 选项写法
      //   target: "http://www.yztpsg.cn/moda/",
      //   changeOrigin: true,
      //   rewrite: (path) => {
      //     path = path.replace(/^\/api/, "");
      //     // 进行调试输出
      //     console.log('vite proxy url: ',path);
      //     return path;
      //   },
      // },
    }
  }
})
