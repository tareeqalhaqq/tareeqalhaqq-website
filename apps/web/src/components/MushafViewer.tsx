"use client";

import { useEffect, useState, useCallback } from "react";
import { ensureQcfFontLoaded } from "./fontLoader";
import MushafPage from "./MushafPage";

type ApiWord = {
  code_v2: string;
  v2_page: number;
  line_number: number;
  char_type_name?: string;
};

type ApiLine = {
  lineNumber: number;
  words: ApiWord[];
};

type ApiPage = {
  pageNumber: number;
  lines: ApiLine[];
};

export default function MushafViewer({ initialPage }: { initialPage: number }) {
  const [page, setPage] = useState(initialPage);
  const [data, setData] = useState<ApiPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetch(`/api/mushaf/page/${page}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Failed to load page (${res.status})`);
        }
        const json = (await res.json()) as ApiPage;
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load page");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page]);

  useEffect(() => {
    ensureQcfFontLoaded(page);
    // Preload adjacent pages
    if (page > 1) ensureQcfFontLoaded(page - 1);
    if (page < 604) ensureQcfFontLoaded(page + 1);
  }, [page]);

  const goToPrev = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const goToNext = useCallback(
    () => setPage((p) => Math.min(604, p + 1)),
    []
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goToNext(); // RTL: left = next page
      if (e.key === "ArrowRight") goToPrev(); // RTL: right = prev page
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goToNext, goToPrev]);

  return (
    <div className="mushafShell">
      <div className="mushafNav">
        <button
          onClick={goToPrev}
          disabled={page <= 1}
          className="mushafNavBtn"
        >
          &rsaquo;
        </button>
        <div className="mushafNavPage">Page {page} / 604</div>
        <button
          onClick={goToNext}
          disabled={page >= 604}
          className="mushafNavBtn"
        >
          &lsaquo;
        </button>
      </div>

      {loading && (
        <div className="mushafLoading">Loading page {page}...</div>
      )}

      {error && <div className="mushafError">{error}</div>}

      {data && !loading && (
        <MushafPage page={data} currentPage={page} />
      )}
    </div>
  );
}
