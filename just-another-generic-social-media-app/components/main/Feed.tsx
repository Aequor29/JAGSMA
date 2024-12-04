"use client";
import { useState, useEffect } from "react";
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
import { apiFetch } from "@/utils/api";

interface Article {
  id: string;
  text: string;
  title: string;
  author: string;
  date: string;
  image?: string;
}

interface FeedProps {
  followedUsernames: string[];
  currentUser: { username: string };
}

const ITEMS_PER_PAGE = 10;

export default function Feed({ followedUsernames, currentUser }: FeedProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch articles with pagination and search
  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        // Construct query parameters
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: ITEMS_PER_PAGE.toString(),
          search: debouncedSearchTerm,
          following: followedUsernames.join(","),
        });

        const response = await apiFetch({
          endpoint: `/articles?${queryParams}`,
        });

        if (response.status === 200) {
          setArticles(response.data.articles);
          setTotalPages(Math.ceil(response.data.total / ITEMS_PER_PAGE));
        } else {
          throw new Error(response.data?.message || "Failed to fetch articles");
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [currentPage, debouncedSearchTerm, followedUsernames]);

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
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="space-y-4 mt-4">
        {isLoading ? (
          <p>Loading posts...</p>
        ) : articles.length > 0 ? (
          articles.map((article) => (
            <Post
              key={article.id}
              article={article}
              currentUser={currentUser}
            />
          ))
        ) : (
          <p className="text-sm text-gray-500">
            No posts to display. Follow users to see their posts or try a
            different search.
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePreviousPage();
                  }}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageClick(index + 1);
                    }}
                    isActive={currentPage === index + 1}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNextPage();
                  }}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
