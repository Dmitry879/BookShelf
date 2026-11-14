import { Routes } from '@angular/router';
import { BookCatalogue } from './book-catalogue/book-catalogue';
import { BookDetails } from './book-details/book-details';
import { CreateBook } from './create-book/create-book';
import { UpdateBook } from './update-book/update-book';

export const routes: Routes = [
  { path: 'books', component: BookCatalogue },
  { path: 'books/create', component: CreateBook },
  { path: 'books/:id', component: BookDetails },
  { path: 'books/:id/edit', component: UpdateBook }
];
