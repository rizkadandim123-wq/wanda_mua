export interface DaymomentPackage {
  id: number;
  template_id: number;
  code: string;
  name: string;
  price: number;
  tagline: string;
  gallery_limit: number;
  has_music: boolean;
  has_wishes: boolean;
  has_gift: boolean;
  sort_order: number;
}

export interface DaymomentTemplate {
  id: number;
  code: string;
  url_slug: string;
  name: string;
  category: string;
  description: string;
  full_thumbnail_url: string | null;
  full_phone_cover_url: string | null;
  starting_price: number | null;
  package_count: number;
  packages: DaymomentPackage[];
  preview_url: string;
  order_url: string;
}

export interface DaymomentPartnerResponse {
  ok: boolean;
  partner: {
    name: string;
    website: string;
  };
  templates: DaymomentTemplate[];
  error?: string;
}
