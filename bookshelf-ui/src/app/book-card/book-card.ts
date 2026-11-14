import { Component, Input } from '@angular/core';
import { Book } from '../models/book.model';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-book-card',
  styleUrl: './book-card.css',
  templateUrl: './book-card.html',
})
export class BookCard {

  @Input() book!: Book;

}
