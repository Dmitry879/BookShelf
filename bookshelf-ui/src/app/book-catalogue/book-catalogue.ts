import { Component, ChangeDetectorRef } from '@angular/core';

import { Book } from '../models/book.model';
import { BookCard } from '../book-card/book-card';
import { BookService } from '../services/book';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  imports: [CommonModule, BookCard, RouterLink],
  selector: 'app-book-catalogue',
  styleUrl: './book-catalogue.css',
  templateUrl: './book-catalogue.html',
})
export class BookCatalogue {

  constructor(
    private bookService: BookService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  books: Book[] = [];

  viewMode: 'list' | 'grid' = 'grid';

  ngOnInit(): void {

    this.bookService.getBooks().subscribe({
      next: (books) => {
        this.books = books.sort((a, b) => a.title.localeCompare(b.title));

        console.log('Books retrieved:', this.books);

        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error retrieving books:', error);
      }
    });

    this.route.queryParamMap.subscribe(params => {
      const view = params.get('view');

      this.viewMode = view === 'list' ? 'list' : 'grid';
      this.cdr.markForCheck();
    });

  }

  onViewModeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;

    const selectedView = select.value as 'list' | 'grid';

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view: selectedView },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

}
