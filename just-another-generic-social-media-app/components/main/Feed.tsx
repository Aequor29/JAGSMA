// components/main/Feed.tsx
"use client";
import { useState, useMemo } from "react";
import Post from "./Post";
import SearchBar from "./SearchBar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { useDebounce } from "@/hooks/useDebounce";

interface Article {
  userId: number;
  id: number;
  title: string;
  body: string;
  createdAt: string;
  author: string;
}

interface FeedProps {
  articles: Article[];
  followedUserIds: number[];
  currentUser: { id: number; username: string };
}

const ITEMS_PER_PAGE = 10;

const paginate = (
  array: Article[],
  pageNumber: number,
  itemsPerPage: number
) => {
  const startIndex = (pageNumber - 1) * itemsPerPage;
  return array.slice(startIndex, startIndex + itemsPerPage);
};

export default function Feed({
  articles,
  followedUserIds,
  currentUser,
}: FeedProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms debounce

  // Memoize sorted articles
  const sortedArticles = useMemo(() => {
    return [...articles].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [articles]);

  // Memoize filtered articles based on search term
  const filteredArticles = useMemo(() => {
    return sortedArticles.filter(
      (article) =>
        article.title
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        article.body
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        article.author.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [sortedArticles, debouncedSearchTerm]);

  // Memoize feed articles based on followedUserIds and currentUser
  const feedArticles = useMemo(() => {
    return filteredArticles.filter(
      (article) =>
        followedUserIds.includes(article.userId) ||
        article.userId === currentUser.id
    );
  }, [filteredArticles, followedUserIds, currentUser.id]);

  // Paginate the feed articles
  const paginatedArticles = paginate(feedArticles, currentPage, ITEMS_PER_PAGE);
  const totalPages = Math.ceil(feedArticles.length / ITEMS_PER_PAGE);

  const handlePageClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div>
      {/* Search bar to filter posts */}
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* Displaying the list of articles */}
      <div className="space-y-4 mt-4">
        {paginatedArticles.length > 0 ? (
          paginatedArticles.map((article) => (
            <Post key={article.id} article={article} />
          ))
        ) : (
          <p className="text-sm text-gray-500">
            No posts to display. Follow users to see their posts.
          </p>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationPrevious
              onClick={handlePreviousPage}
              className={currentPage === 1 ? "disabled" : ""}
            >
              <PaginationLink href="#">Previous</PaginationLink>
            </PaginationPrevious>
            <PaginationContent>
              {Array.from({ length: totalPages }).map((_, index) => (
                <PaginationItem
                  key={index}
                  className={index + 1 === currentPage ? "active" : ""}
                >
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageClick(index + 1);
                    }}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
            </PaginationContent>
            <PaginationNext
              onClick={handleNextPage}
              className={currentPage === totalPages ? "disabled" : ""}
            >
              <PaginationLink href="#">Next</PaginationLink>
            </PaginationNext>
          </Pagination>
        </div>
      )}
    </div>
  );
}
