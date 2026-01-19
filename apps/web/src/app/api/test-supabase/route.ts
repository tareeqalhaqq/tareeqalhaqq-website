import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.rpc("auth_jwt");

  return NextResponse.json({ data, error });
}
