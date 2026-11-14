import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookService } from '../services/book';
import { Book } from '../models/book.model';

import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';

@Component({
  imports: [CommonModule],
  selector: 'app-book-details',
  styleUrl: './book-details.css',
  templateUrl: './book-details.html',
})
export class BookDetails {

  book?: Book;

  private router = inject(Router);

  constructor(
    private route: ActivatedRoute,
    private bookService: BookService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.bookService.getBookById(id).subscribe({
      next: (books) => {
        this.book = books[0];
        console.log('Book details:', this.book);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error retrieving book:', error);
      }
    });

  }

  onActionChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const action = select.value;

    select.value = '';

    if (!this.book) {
      return;
    }

    if (action === 'update') {
      this.router.navigate(['/books', this.book.id, 'edit']);
    } else if (action === 'delete') {
      this.deleteBook();
    }
  }

  deleteBook(): void {
    if (!this.book) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${this.book.title}"?`
    );

    if (!confirmed) {
      return;
    }

    this.bookService.deleteBook(this.book.id).subscribe({
      next: () => {
        this.router.navigate(['/books']);
      },
      error: (error) => {
        console.error('Error deleting book:', error);
        alert('Failed to delete the book.');
      }
    });
  }

}
