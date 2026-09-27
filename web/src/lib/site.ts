export const site = {
  name: "Elsewhere",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "Clothes and objects for people who get asked where they got it. Drop 001 is in validation — tell us what you want made.",
  // Set when the account exists. Nothing links out until then.
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || null,
  googleAuth: process.env.NEXT_PUBLIC_AUTH_GOOGLE === "true",
} as const;
