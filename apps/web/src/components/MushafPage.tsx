"use client";

import MushafLine from "./MushafLine";

type Word = {
  code_v2: string;
  v2_page: number;
  char_type_name?: string;
};

type Line = {
  lineNumber: number;
  words: Word[];
};

type PageData = {
  pageNumber: number;
  lines: Line[];
};

export default function MushafPage({
  page,
  currentPage,
}: {
  page: PageData;
  currentPage: number;
}) {
  return (
    <div className="mushafPageOuter">
      <div className="mushafPage" dir="rtl">
        {page.lines.map((line) => (
          <MushafLine key={line.lineNumber} line={line} />
        ))}
        <div className="mushafFooter">{currentPage}</div>
      </div>
    </div>
  );
}
