export interface CreateBookRequest {
  title: string;
  authors: { name: string }[];
  categories: { name: string }[];
  publisher: string;
  publishDate: string;
  isbn: string;
  numPages: number;
  description: string;
  coverImage: string | null;
}
