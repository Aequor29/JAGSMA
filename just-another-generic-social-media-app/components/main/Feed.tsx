// /components/main/Feed.tsx

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
import { toast } from "react-toastify"; // Ensure react-toastify is installed

interface Comment {
  _id: string;
  author: string;
  text: string;
  date: string;
}

interface Article {
  id: string;
  text: string;
  title: string;
  author: string;
  date: string;
  image?: string;
  comments?: Comment[];
}

interface FeedProps {
  followedUsernames: string[];
  currentUser: { username: string };
  refresh: boolean; // Trigger refetch when this changes
}

const ITEMS_PER_PAGE = 10;

export default function Feed({
  followedUsernames,
  currentUser,
  refresh,
}: FeedProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
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
          const { articles: fetchedArticles, total } = response.data;
          const mappedArticles = fetchedArticles.map((a: any) => ({
            id: a.id || a._id, // Fallback to '_id' if 'id' is undefined
            title: a.title,
            text: a.text,
            author: a.author,
            date: a.date,
            image: a.image,
            comments: a.comments || [],
          }));
          setArticles(mappedArticles);
          setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));
        } else {
          throw new Error(response.data?.message || "Failed to fetch articles");
        }
      } catch (error: any) {
        console.error("Error fetching articles:", error);
        toast.error(error.message || "Failed to fetch articles.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [currentPage, debouncedSearchTerm, followedUsernames, refresh]);

  const handlePageClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div>
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className="space-y-4 mt-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
              <div key={index} className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-300 h-10 w-10"></div>
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
