import type { Author } from "./author.model";
import type { Category } from "./category.model";

export interface Book {
  id: number;
  title: string;
  authors?: Author[];
  categories?: Category[];
  publisher: string;
  publishDate: string;
  isbn: string;
  numPages: number;
  description: string;
  coverImage: string | null;
}
