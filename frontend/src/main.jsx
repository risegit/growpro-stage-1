
// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App";
// import { BrowserRouter } from "react-router-dom";
// import { ThemeProvider } from "@material-tailwind/react";
// import { MaterialTailwindControllerProvider } from "@/context";

// // Import global styles
// import "../public/css/tailwind.css";  // Tailwind base styles
// import "./global.css";               // ✅ Your custom global styles

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <ThemeProvider>
//         <MaterialTailwindControllerProvider>
//           <App />
//         </MaterialTailwindControllerProvider>
//       </ThemeProvider>
//     </BrowserRouter>
//   </React.StrictMode>
// );

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@material-tailwind/react";
import { MaterialTailwindControllerProvider } from "@/context";

// Import global styles
import "../public/css/tailwind.css"; // Tailwind base styles
import "./global.css";               // ✅ Your custom global styles

// 👇 Dynamic base path for local and production (no .env needed)
const mode = import.meta.env.MODE;
const base = mode === "development" ? "/" : "/growpro/";


// ✅ Console logs (will show in browser console)
console.log("🌐 Environment Mode:", import.meta.env.MODE);
console.log("🌍 Router Base Path:", base);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename={base}>
      <ThemeProvider>
        <MaterialTailwindControllerProvider>
          <App />
        </MaterialTailwindControllerProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);



