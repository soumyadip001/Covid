import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Bug } from './bug';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

import { AppSettings } from '../config/settings/app-settings';

@Injectable({
  providedIn: 'root'
})

export class HttpAppService {

  constructor(private http: HttpClient) { }


  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  //user services

  getPandemicData(): Observable<any> {
    return this.http.get<any>(AppSettings.SERVER_DEV + AppSettings.PANDEMIC_API)
      .pipe(
        retry(1),
        catchError(this.errorHandl)
      )
    // return this.http.get<any>(AppSettings.SERVER_DEV + AppSettings.PANDEMIC_API)
    // .pipe(
    // retry(1),
    // catchError(this.errorHandl)
    // )
  }




  // Error handling
  errorHandl(error) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }

}
