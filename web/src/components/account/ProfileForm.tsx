"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileState } from "@/app/(site)/account/actions";

export function ProfileForm({ fullName, college }: { fullName: string; college: string }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateProfile, {});

  return (
    <form action={action} className="flex flex-col gap-8">
      <Field label="Name" name="full_name" defaultValue={fullName} autoComplete="name" placeholder="What should we call you?" />
      <Field label="College" name="college" defaultValue={college} autoComplete="organization" placeholder="Optional" />
      <div className="flex items-center gap-6">
        <button
          type="submit"
          disabled={pending}
          className="t-meta h-12 bg-ink px-6 text-bone transition-colors hover:bg-char-2 disabled:opacity-60"
        >
          {pending ? "Saving" : "Save"}
        </button>
        <p role="status" className="t-meta text-stone">
          {state.ok ? "Saved." : state.error}
        </p>
      </div>
    </form>
  );
}

function Field({ label, name, ...rest }: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-2">
      <span className="t-meta text-stone">{label}</span>
      <input
        name={name}
        maxLength={120}
        className="h-12 border-b border-ink/25 bg-transparent text-lg tracking-tight outline-none placeholder:text-bone-3 focus:border-ink"
        {...rest}
      />
    </label>
  );
}
