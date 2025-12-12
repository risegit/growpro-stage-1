import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const isLocal = mode === "development";

  // ✅ Automatically use correct base path depending on environment
  const base = isLocal ? "/" : "/growpro/";

  console.log("----------------------------------------------------");
  console.log("🚀 VITE CONFIG LOADED");
  console.log("Mode:", mode);
  console.log("Environment:", isLocal ? "Local" : "Production");
  console.log("Base path being used:", base);
  console.log("----------------------------------------------------");

  return {
    plugins: [react()],
    resolve: {
      alias: [{ find: "@", replacement: "/src" }],
    },
    base,
    
    // ✅ CRITICAL: Add proxy configuration to fix CORS
    server: {
      port: 5173,
      host: true, // Allows access from network if needed
      cors: true, // Enable CORS for dev server
      
      // Proxy configuration
      proxy: {
        // Proxy API requests
        '/api': {
          target: 'http://localhost/growpro-stage-1/backend/',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        
        // Proxy uploads folder - MOST IMPORTANT FOR IMAGES
        '/uploads': {
          target: 'http://localhost/growpro-stage-1/backend/',
          changeOrigin: true,
          secure: false,
        },
        
        // Proxy backend folder directly
        '/backend': {
          target: 'http://localhost/growpro-stage-1/',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    
    build: {
      assetsDir: "assets",
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && /\.(jpg|jpeg|png|gif|svg|webp)$/.test(assetInfo.name)) {
              return 'assets/images/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          }
        }
      }
    },
  };
});