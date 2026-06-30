// layouts/AdminLayout.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#0B0B0C" }}>
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <main
        style={{
          marginLeft: collapsed ? 64 : 220,
          transition: "margin-left 0.22s cubic-bezier(.4,0,.2,1)",
          minHeight: "100vh",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
