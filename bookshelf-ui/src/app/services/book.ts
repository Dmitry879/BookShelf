import { Service } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Book } from '../models/book.model';
import { Observable, map } from 'rxjs';

import { CreateBookRequest } from '../models/book-request.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  private apiUrl = 'http://localhost:3000/books';

  constructor(private http: HttpClient) {}

  public getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl);
  }

  public getBookById(id: number): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/${id}`);
  }

  public checkIsbn(isbn: string): Observable<boolean> {
    return this.http.get<{ exists: boolean }>(
      `${this.apiUrl}/isbn/${isbn}`
    ).pipe(
      map(response => response.exists)
    );
  }

  uploadCoverImage(file: File): Observable<{ imagePath: string }> {
    const formData = new FormData();

    formData.append('coverImage', file);

    return this.http.post<{ imagePath: string }>(
      'http://localhost:3000/images/upload',
      formData
    );

  }

  createBook(book: CreateBookRequest): Observable<unknown> {
    return this.http.post(this.apiUrl, book);
  }

  updateBook(id: number, book: CreateBookRequest): Observable<unknown> {
    return this.http.put(
      `http://localhost:3000/books/${id}`, book
    );
  }

  deleteBook(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}
