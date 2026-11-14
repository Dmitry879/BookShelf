import { Injectable, Service } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Publisher } from '../models/publisher.model';

@Injectable({
  providedIn: 'root'
})
export class PublisherService {

  private apiUrl = 'http://localhost:3000/publishers';

  constructor(private http: HttpClient) {}

  public getPublishers(): Observable<Publisher[]> {
    return this.http.get<Publisher[]>(this.apiUrl);
  }

}
