import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function requirePrivateAccess() {
  const cookieStore = await cookies();

  const privateId =
    cookieStore.get("quale_private_access")?.value;

  if (
    typeof privateId !== "string" ||
    privateId.length !== 64
  ) {
    return {
      authorized: false,
      accessCard: null,
    };
  }

  const { data: accessCard, error } =
    await supabaseAdmin
      .from("access_cards")
      .select("id, private_id, is_active")
      .eq("private_id", privateId)
      .eq("is_active", true)
      .single();

  if (error || !accessCard) {
    return {
      authorized: false,
      accessCard: null,
    };
  }

  return {
    authorized: true,
    accessCard,
  };
}