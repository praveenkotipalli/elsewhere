"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/account";

const Profile = z.object({
  full_name: z.string().trim().max(80),
  college: z.string().trim().max(120),
});

export type ProfileState = { ok?: boolean; error?: string };

export async function updateProfile(_: ProfileState, form: FormData): Promise<ProfileState> {
  const parsed = Profile.safeParse({ full_name: form.get("full_name") ?? "", college: form.get("college") ?? "" });
  if (!parsed.success) return { error: "Keep it shorter than that." };

  const { supabase, user } = await requireUser("/account");
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.full_name || null, college: parsed.data.college || null })
    .eq("id", user.id);
  if (error) return { error: "Couldn't save. Try again." };

  revalidatePath("/account", "layout");
  return { ok: true };
}
