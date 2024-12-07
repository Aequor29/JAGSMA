// /components/main/SearchBar.tsx

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function SearchBar({
  searchTerm,
  setSearchTerm,
}: SearchBarProps) {
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="relative">
      <Search
        className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        placeholder="Search posts or authors..."
        className="pl-8"
        value={searchTerm}
        onChange={handleSearch}
        aria-label="Search posts or authors"
      />
    </div>
  );
}
