export type ProductStatus =
  | "concept"
  | "validating"
  | "coming_soon"
  | "drop_soon"
  | "selected"
  | "archived";

export type World = "wear" | "objects" | "room" | "tech" | "carry";

export type ProductImage = {
  id: string;
  src: string;
  alt: string;
  width: number | null;
  height: number | null;
  sort: number;
};

export type Vibe = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  sort: number;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  world: World;
  sort: number;
};

export type Drop = {
  id: string;
  code: string;
  title: string;
  description: string | null;
};

export type Detail = { label: string; value: string };

export type Product = {
  id: string;
  slug: string;
  code: string | null;
  name: string;
  tagline: string | null;
  description: string | null;
  story: string | null;
  details: Detail[];
  tags: string[];
  status: ProductStatus;
  is_public: boolean;
  price_minor: number | null;
  currency: string;
  sort: number;
  created_at: string;
  category: Category | null;
  drop: Drop | null;
  images: ProductImage[];
  vibes: Vibe[];
};
