// src/app/api/mushaf/page/[page]/route.ts
// Server route that hides credentials and returns safe JSON to client.

import { NextResponse } from "next/server";
import { fetchMushafPageVerses } from "@/lib/qfApi";
import { buildMushafPageModel } from "@/lib/mushafBuilder";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ page: string }> }
) {
  const { page } = await params;
  const pageNumber = Number(page);

  if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > 604) {
    return NextResponse.json({ error: "Invalid page number" }, { status: 400 });
  }

  try {
    const verses = await fetchMushafPageVerses(pageNumber);
    const model = buildMushafPageModel(pageNumber, verses);

    const safe = {
      pageNumber: model.pageNumber,
      lines: model.lines.map((l) => ({
        lineNumber: l.lineNumber,
        words: l.words.map((w) => ({
          code_v2: w.code_v2,
          v2_page: w.v2_page,
          line_number: w.line_number,
          char_type_name: w.char_type_name,
        })),
      })),
    };

    return NextResponse.json(safe, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
