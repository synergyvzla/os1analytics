
import React from 'react';
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, handlePageChange }: PaginationProps) => {
  const renderPaginationButton = (page: number) => (
    <button
      key={page}
      onClick={() => handlePageChange(page)}
      className={cn(
        "w-10 h-10 rounded-md flex items-center justify-center",
        currentPage === page
          ? "bg-primary text-primary-foreground"
          : "hover:bg-accent"
      )}
    >
      {page}
    </button>
  );

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(renderPaginationButton(i));
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 3; i++) {
          pages.push(renderPaginationButton(i));
        }
        pages.push(<span key="dots1" className="px-2">...</span>);
        pages.push(renderPaginationButton(totalPages));
      } else if (currentPage >= totalPages - 2) {
        pages.push(renderPaginationButton(1));
        pages.push(<span key="dots2" className="px-2">...</span>);
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(renderPaginationButton(i));
        }
      } else {
        pages.push(renderPaginationButton(1));
        pages.push(<span key="dots1" className="px-2">...</span>);
        pages.push(renderPaginationButton(currentPage - 1));
        pages.push(renderPaginationButton(currentPage));
        pages.push(renderPaginationButton(currentPage + 1));
        pages.push(<span key="dots2" className="px-2">...</span>);
        pages.push(renderPaginationButton(totalPages));
      }
    }

    return (
      <div className="flex items-center justify-center gap-1 mt-4">
        {pages}
      </div>
    );
  };

  return renderPagination();
};
