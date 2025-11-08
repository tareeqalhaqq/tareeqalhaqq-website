"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { allContent } from "@/lib/data";
import { Search } from "lucide-react";

type SearchResult = {
  type: string;
  title: string;
  description: string;
  href: string;
};

export function SearchDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (query.length > 2) {
      const lowerCaseQuery = query.toLowerCase();
      const filteredResults = allContent.filter(
        (item) =>
          item.title.toLowerCase().includes(lowerCaseQuery) ||
          (item.description && item.description.toLowerCase().includes(lowerCaseQuery))
      );
      setResults(filteredResults);
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px] h-full sm:h-auto sm:max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Content</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for events, videos, photos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex-grow overflow-y-auto -mx-6 px-6">
          {query.length > 2 && results.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              No results found.
            </div>
          )}
          {results.length > 0 && (
            <div className="space-y-4">
              {results.map((result, index) => (
                <Link
                  key={index}
                  href={result.href}
                  className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                  onClick={() => onOpenChange(false)}
                >
                  <p className="text-sm font-semibold text-primary">{result.type}</p>
                  <h3 className="font-semibold text-foreground">{result.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{result.description}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
