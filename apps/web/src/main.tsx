import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RequestDesk } from "@/features/requests/request-desk";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("Missing application root");

createRoot(root).render(
  <StrictMode>
    <RequestDesk />
  </StrictMode>,
);
