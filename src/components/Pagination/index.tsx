import React from "react";
import {
  ChevronLeft24Regular,
  ChevronRight24Regular,
} from "@fluentui/react-icons";

interface PaginationProps {
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  setPage,
}) => {
  // Helper function to change page and scroll to resource library
  const handlePageChange = (newPage: number) => {
    setPage(newPage);

    if (typeof window !== "undefined") {
      setTimeout(() => {
        const resourceLibrary = document.getElementById("resource-library");
        if (resourceLibrary) {
          const navbar = document.querySelector(".navbar");
          const navbarHeight = navbar ? navbar.offsetHeight : 80;
          const elementPosition =
            resourceLibrary.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - navbarHeight - 20;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }, 50); // Small delay to ensure page content updates first
    }
  };

  return (
    totalPages > 1 && (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 24,
          gap: 32,
        }}
      >
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          style={{
            padding: "6px 8px",
            border: "none",
            background: "none",
            color: "#222",
            fontWeight: 500,
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            cursor: page === 1 ? "not-allowed" : "pointer",
            opacity: page === 1 ? 0.4 : 1,
            minWidth: 0,
          }}
        >
          <ChevronLeft24Regular
            style={{ marginRight: 4, fontSize: 18, width: 18, height: 18 }}
          />{" "}
          Previous
        </button>
        <div style={{ display: "flex", gap: 16 }}>
          {page === 1 && totalPages > 1 && (
            <>
              <button
                style={{
                  padding: "6px 12px",
                  borderRadius: 4,
                  border: "1px solid #e0e0e0",
                  color: "#222",
                  background: "none",
                  fontWeight: 700,
                  cursor: "default",
                }}
                disabled
              >
                {page}
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                style={{
                  padding: "6px 12px",
                  border: "none",
                  background: "none",
                  color: "#222",
                  fontWeight: 400,
                  cursor: "pointer",
                }}
              >
                {page + 1}
              </button>
            </>
          )}
          {page > 1 && page < totalPages && (
            <>
              <button
                onClick={() => handlePageChange(page - 1)}
                style={{
                  padding: "6px 12px",
                  border: "none",
                  background: "none",
                  color: "#222",
                  fontWeight: 400,
                  cursor: "pointer",
                }}
              >
                {page - 1}
              </button>
              <button
                style={{
                  padding: "6px 12px",
                  borderRadius: 4,
                  border: "1px solid #e0e0e0",
                  color: "#222",
                  background: "none",
                  fontWeight: 700,
                  cursor: "default",
                }}
                disabled
              >
                {page}
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                style={{
                  padding: "6px 12px",
                  border: "none",
                  background: "none",
                  color: "#222",
                  fontWeight: 400,
                  cursor: "pointer",
                }}
              >
                {page + 1}
              </button>
            </>
          )}
          {page === totalPages && totalPages > 1 && (
            <>
              <button
                onClick={() => handlePageChange(page - 1)}
                style={{
                  padding: "6px 12px",
                  border: "none",
                  background: "none",
                  color: "#222",
                  fontWeight: 400,
                  cursor: "pointer",
                }}
              >
                {page - 1}
              </button>
              <button
                style={{
                  padding: "6px 12px",
                  borderRadius: 4,
                  border: "1px solid #e0e0e0",
                  color: "#222",
                  background: "none",
                  fontWeight: 700,
                  cursor: "default",
                }}
                disabled
              >
                {page}
              </button>
            </>
          )}
        </div>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          style={{
            padding: "6px 8px",
            border: "none",
            background: "none",
            color: "#222",
            fontWeight: 500,
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            cursor: page === totalPages ? "not-allowed" : "pointer",
            opacity: page === totalPages ? 0.4 : 1,
            minWidth: 0,
          }}
        >
          Next{" "}
          <ChevronRight24Regular
            style={{ marginLeft: 4, fontSize: 18, width: 18, height: 18 }}
          />
        </button>
      </div>
    )
  );
};

export default Pagination;
