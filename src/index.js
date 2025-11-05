import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import { Connect } from "@stacks/connect-react";
import { userSession } from "./lib/auth";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  <Connect
    authOptions={{
      appDetails: {
        name: "Connect with BoostX",
        icon: window.location.origin + "/logo.png",
      },
      redirectTo: "/",
      onFinish: () => {
        window.location.reload();
      },
      userSession,
    }}
  >
    <App />
  </Connect>
  // </React.StrictMode> 
);

reportWebVitals();