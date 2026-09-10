import { redirect } from "next/navigation";
import crypto from "crypto";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function PrivateActivatePage({
  searchParams,
}: {
  searchParams: Promise<{
    privateId?: string;
    token?: string;
  }>;
}) {
  const { privateId, token } = await searchParams;

  if (
    typeof privateId !== "string" ||
    privateId.length !== 64 ||
    typeof token !== "string" ||
    token.length !== 64
  ) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <h1 className="text-5xl italic">
          Access Denied
        </h1>
      </main>
    );
  }

  const { data: accessCard, error } =
    await supabaseAdmin
      .from("access_cards")
      .select("id, private_id, qr_secret_hash, is_active")
      .eq("private_id", privateId)
      .eq("is_active", true)
      .single();

  if (
    error ||
    !accessCard ||
    typeof accessCard.qr_secret_hash !== "string"
  ) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <h1 className="text-5xl italic">
          Access Denied
        </h1>
      </main>
    );
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const storedHash = accessCard.qr_secret_hash;

const isValid =
  storedHash.length === tokenHash.length &&
  crypto.timingSafeEqual(
    Buffer.from(tokenHash),
    Buffer.from(storedHash)
  );

  if (!isValid) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <h1 className="text-5xl italic">
          Access Denied
        </h1>
      </main>
    );
  }

  const cookieStore = await cookies();

  cookieStore.set("quale_private_access", privateId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(`/private/${privateId}`);
}