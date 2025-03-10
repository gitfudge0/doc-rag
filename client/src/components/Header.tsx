import React from "react";
import { Button, Avatar } from "./ui";
import { reloadDocuments } from "../api";

const Header: React.FC = () => {
  const [isReloading, setIsReloading] = React.useState(false);

  const handleReloadDocuments = async () => {
    try {
      setIsReloading(true);
      await reloadDocuments();
      alert("Documents reloaded successfully");
    } catch (error) {
      console.error("Error reloading documents:", error);
      alert("Failed to reload documents");
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <header className="header">
      <h1>DOC RAG</h1>

      <div className="header-actions">
        <button
          className="btn btn-secondary"
          onClick={handleReloadDocuments}
          disabled={isReloading}
        >
          {isReloading ? "Reloading..." : "Reload Documents"}
        </button>

        <div className="avatar user">U</div>
      </div>
    </header>
  );
};

export default Header;

