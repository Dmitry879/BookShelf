import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { BookService } from '../services/book';
import { AuthorService } from '../services/author';
import { Author } from '../models/author.model';

import { CategoryService } from '../services/category';
import { Category } from '../models/category.model';

import { PublisherService } from '../services/publisher';
import { Publisher } from '../models/publisher.model';
import { CreateBookRequest } from '../models/book-request.model';

import { HttpErrorResponse } from '@angular/common/http';

import { Router } from '@angular/router';

import { ActivatedRoute } from '@angular/router';

import { forkJoin } from 'rxjs';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-update-book',
  styleUrl: './update-book.css',
  templateUrl: './update-book.html',
})
export class UpdateBook implements OnInit {
  authors: Author[] = [];

  authorSearch: string = '';
  selectedAuthors: Author[] = [];

  originalIsbn = '';

  get filterAuthors(): Author[] {
    const search = this.authorSearch.trim().toLowerCase();

    if (!search) {
      return this.authors;
    }

    return this.authors.filter(author =>
      author.name.toLowerCase().includes(search)
    );
  }

  private bookService = inject(BookService);
  private authorService = inject(AuthorService);
  private cdr = inject(ChangeDetectorRef);

  private router = inject(Router);

  private route = inject(ActivatedRoute);

  private formBuilder = inject(FormBuilder);

  bookForm = this.formBuilder.nonNullable.group({
    title: ['', Validators.required],
    publishDate: ['', Validators.required],
    isbn: ['', [
      Validators.required,
      Validators.pattern(/^(\d{10}|\d{13})$/)
    ]],
    numPages: [1, [
      Validators.required,
      Validators.min(1),
      Validators.pattern(/^\d+$/)
    ]],
    description: ['', Validators.required]
  });

  bookId: number = 0;

  ngOnInit(): void {

    this.bookId = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(this.bookId) || this.bookId <= 0) {
      console.error('Invalid book ID');
      return;
    }

    forkJoin({
      authors: this.authorService.getAuthors(),
      categories: this.categoryService.getCategories(),
      publishers: this.publisherService.getPublishers(),
      books: this.bookService.getBookById(this.bookId)
    }).subscribe({
      next: ({ authors, categories, publishers, books }) => {
        this.authors = authors;
        this.categories = categories;
        this.publishers = publishers;

        const book = books[0];

        if (!book) {
          console.error('Book not found');
          return;
        }

        this.originalIsbn = book.isbn;

        this.bookForm.patchValue({
          title: book.title,
          publishDate: book.publishDate
            ? new Date(book.publishDate).toISOString().split('T')[0] : '',
          isbn: book.isbn,
          numPages: book.numPages,
          description: book.description
        });

        this.selectedAuthors = authors.filter(author =>
          book.authors?.some(a => a.id === author.id)
        );

        this.selectedCategories = categories.filter(category =>
          book.categories?.some(c => c.id === category.id)
        );

        this.selectedPublisher = publishers.find(
          publisher => publisher.publisherName === book.publisher
        ) ?? null;

        this.uploadedCoverPath = book.coverImage;

        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load update form:', error);
      }
    });

  }

  selectAuthor(author: Author): void {
    if (!this.selectedAuthors.some(a => a.id === author.id)) {
      this.selectedAuthors.push(author);
    }

    this.authorSearch = '';
  }

  removeAuthor(author: Author): void {
    this.selectedAuthors = this.selectedAuthors.filter(
      a => a.id !== author.id
    );
  }

  showNewAuthorInput = false;
  newAuthorName = '';

  addNewAuthor(): void {
    const name = this.newAuthorName.trim();

    if (!name) {
      return;
    }

    const existingAuthor = this.authors.find(
      author => author.name.toLowerCase() === name.toLowerCase()
    );

    if (existingAuthor) {
      this.selectAuthor(existingAuthor);
    } else {
      const newAuthor: Author = {
        id: -Date.now(),
        name: name
      };

      this.selectedAuthors.push(newAuthor)
    }

    this.newAuthorName = '';
    this.showNewAuthorInput = false;

  }

  categories: Category[] = [];
  selectedCategories: Category[] = [];

  private categoryService = inject(CategoryService);

  isCategorySelected(category: Category): boolean {
    return this.selectedCategories.some(c => c.id === category.id);
  }

  toggleCategory(category: Category): void {
    if (this.isCategorySelected(category)) {
      this.selectedCategories = this.selectedCategories.filter(
        c => c.id !== category.id
      );
    } else {
      this.selectedCategories = [... this.selectedCategories, category];
    }
  }

  showNewCategoryInput = false;
  newCategoryName = '';

  addNewCategory(): void {

    const name = this.newCategoryName.trim();

    if (!name) {
      return;
    }

    const existingCategory = this.categories.find(
      category => category.categoryName.toLowerCase() === name.toLowerCase()
    );

    if (existingCategory) {
      if (!this.isCategorySelected(existingCategory)) {
        this.toggleCategory(existingCategory);
      }
    } else {
      const alreadySelected = this.selectedCategories.some(
        category => category.categoryName.toLowerCase() === name.toLowerCase()
      );

      if (!alreadySelected) {
        const newCategory: Category = {
          id: -Date.now(),
          categoryName: name
        };

        this.selectedCategories = [...this.selectedCategories, newCategory];
      }
    }

    this.newCategoryName = '';
    this.showNewCategoryInput = false;

  }

  removeCategory(category: Category): void {
    this.selectedCategories = this.selectedCategories.filter(
      c => c.id != category.id
    );
  }

  publishers: Publisher[] = [];

  publisherSearch = '';
  selectedPublisher: Publisher | null = null;

  showNewPublisherInput = false;
  newPublisherName = '';

  private publisherService = inject(PublisherService);

  get filteredPublishers(): Publisher[] {
    const search = this.publisherSearch.trim().toLowerCase();

    if (!search) {
      return [];
    }

    return this. publishers.filter(publisher =>
      publisher.publisherName.toLowerCase().includes(search)
    );
  }

  addNewPublisher(): void {
    const name = this.newPublisherName.trim();

    if (!name) {
      return;
    }

    const existingPublisher = this.publishers.find(
      publisher => publisher.publisherName.toLowerCase() === name.toLowerCase()
    );

    if (existingPublisher) {
      this.selectedPublisher = existingPublisher;
    } else {
      this.selectedPublisher = {
        id: -Date.now(),
        publisherName: name
      };
    }

    this.newPublisherName = '';
    this.publisherSearch = '';
    this.showNewPublisherInput = false;

  }

  isInvalid(controlName: string): boolean {
    const control = this.bookForm.get(controlName);

    return !!(control && control.invalid &&
      (control.touched || control.dirty));
  }

  isbnExists = false;
  isbnChecking = false;

  checkIsbn(): void {
    const isbnControl = this.bookForm.controls.isbn;

    if (isbnControl.invalid) {
      this. isbnExists = false;
      return;
    }

    const isbn = isbnControl.value;

    if (isbn === this.originalIsbn) {
      this.isbnExists = false;
      this.isbnChecking = false;
      this.cdr.markForCheck();
      return;
    }

    this.isbnChecking = true;
    this.isbnExists = false;

    this.bookService.checkIsbn(isbn).subscribe({
      next: (exists) => {
        this.isbnChecking = false;

        if (this.bookForm.controls.isbn.value !== isbn) {
          this.cdr.markForCheck();
          return;
        }

        this.isbnExists = exists;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('ISBN lookup failed:', error);
        this.isbnChecking = false;
        this.cdr.markForCheck();
      }

    });
  }

  selectedCoverFile: File | null = null;
  uploadedCoverPath: string | null = null;

  onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    this. selectedCoverFile = input.files?.[0] ?? null;
  }

  isSubmitting = false;

  submitBook(): void {
    if (this.bookForm.invalid) {
      this.bookForm.markAllAsTouched();
      return;
    }

    if (
      this.selectedAuthors.length === 0 ||
      this.selectedCategories.length === 0 ||
      !this.selectedPublisher ||
      this.isbnExists ||
      this.isSubmitting
    ) {
      return;
    }

    const form = this.bookForm.getRawValue();

    const book: CreateBookRequest = {
      title: form.title,
      authors: this.selectedAuthors.map(author => ({
        name: author.name
      })),
      categories: this.selectedCategories.map(category => ({
        name: category.categoryName
      })),
      publisher: this.selectedPublisher.publisherName,
      publishDate: form.publishDate,
      isbn: form.isbn,
      numPages: Number(form.numPages),
      description: form.description,
      coverImage: this.uploadedCoverPath
    };

    this.isSubmitting = true;

    const updateBook = (coverPath: string | null): void => {
      book.coverImage = coverPath;


    this.bookService.updateBook(this.bookId, book).subscribe({
      next: (response: unknown) => {
        console.log('Book updated:', response);
        this.isSubmitting = false;
        this.router.navigate(['/books', this.bookId]);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Failed to update book:', error);
        this.isSubmitting = false;
        this.cdr.markForCheck();
      }
    });
    };

    if (this.selectedCoverFile) {
      this.bookService.uploadCoverImage(this.selectedCoverFile)
        .subscribe({
          next: (response) => {
            console.log('Now cover uploaded:', response.imagePath);
            updateBook(response.imagePath);
          },
          error: (error) => {
            console.error('Cover upload failed:', error);
            this.isSubmitting = false;
            this.cdr.markForCheck();
          }
        });
    } else {
      updateBook(this.uploadedCoverPath);
    }
  }

}
