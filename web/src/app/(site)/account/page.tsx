import { ProfileForm } from "@/components/account/ProfileForm";
import { requireUser } from "@/lib/account";
import { formatDate } from "@/lib/format";

export default async function ProfilePage() {
  const { supabase, user } = await requireUser("/account");
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, college, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="grid gap-y-12 md:grid-cols-12 md:gap-x-6">
      <div className="md:col-span-5">
        <ProfileForm fullName={profile?.full_name ?? ""} college={profile?.college ?? ""} />
      </div>
      <dl className="flex flex-col gap-6 md:col-span-3 md:col-start-9">
        <div>
          <dt className="t-meta text-stone">Email</dt>
          <dd className="mt-1 break-all">{user.email}</dd>
        </div>
        {profile?.created_at && (
          <div>
            <dt className="t-meta text-stone">Here since</dt>
            <dd className="mt-1">{formatDate(profile.created_at)}</dd>
          </div>
        )}
        <div>
          <dt className="t-meta text-stone">What we use this for</dt>
          <dd className="mt-1 text-sm text-stone">
            Telling you when something you asked for gets made. Your college helps us decide where to launch first.
          </dd>
        </div>
      </dl>
    </div>
  );
}
