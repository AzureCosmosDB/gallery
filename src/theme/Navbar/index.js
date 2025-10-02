import React from "react";
import NavbarLayout from "@theme/Navbar/Layout";
import NavbarContent from "@theme/Navbar/Content";
export default function Navbar() {
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 100 }}>
      <div id="cookie-banner"></div>
      <NavbarLayout>
        <NavbarContent />
      </NavbarLayout>
    </div>
  );
}
