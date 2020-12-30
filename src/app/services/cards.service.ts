import { Injectable, Sanitizer } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Card } from 'src/app/model/card';

@Injectable({
  providedIn: 'root'
})
export class CardsService {

  private baseUrl: string = 'http://localhost:3000';
  private cardsUrl: string = `${this.baseUrl}/cards`;  

  constructor(private httpClient : HttpClient) { }
  
  get cards (): Observable<Card[]> {
    return this.httpClient.get<Card[]>(this.cardsUrl, { responseType: 'json' })
  }  
}
