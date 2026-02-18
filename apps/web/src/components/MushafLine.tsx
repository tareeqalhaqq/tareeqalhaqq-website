"use client";

type Word = {
  code_v2: string;
  v2_page: number;
  char_type_name?: string;
};

type LineData = {
  lineNumber: number;
  words: Word[];
};

export default function MushafLine({ line }: { line: LineData }) {
  return (
    <div className="mushafLine" aria-label={`line-${line.lineNumber}`}>
      {line.words.map((w, i) => {
        // End markers render better with the UthmanicHafs font
        const isEndMarker = w.char_type_name === "end";
        const fontFamily = isEndMarker
          ? '"KFGQPC Hafs", "UthmanTN", serif'
          : `p${w.v2_page}-v2`;

        return (
          <span
            key={i}
            className="mushafWord"
            style={{ fontFamily }}
            // code_v2 glyphs require innerHTML for correct Unicode rendering
            dangerouslySetInnerHTML={{ __html: w.code_v2 }}
          />
        );
      })}
    </div>
  );
}
