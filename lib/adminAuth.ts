import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      authorized: false,
      user: null,
    };
  }

  if (user.id !== process.env.ADMIN_USER_ID) {
    return {
      authorized: false,
      user,
    };
  }

  return {
    authorized: true,
    user,
  };
}