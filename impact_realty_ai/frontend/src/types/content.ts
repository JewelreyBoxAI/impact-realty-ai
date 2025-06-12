export type ContentItem = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  attributes: Record<string, string>;
  created_at: string;
};
