import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export function setAuthCookie(token: string, daysToExpire: number = 1): void {
    const date = new Date();
    date.setTime(date.getTime() + daysToExpire * 24 * 60 * 60 * 1000);
    
    const expires = `expires=${date.toUTCString()}`;
    
    // Secure: Only sent over HTTPS
    // SameSite=Strict: Helps prevent CSRF attacks
    document.cookie = `auth_token=${encodeURIComponent(token)}; ${expires}; path=/; Secure; SameSite=Strict`;
  }

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  private readonly apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  authorizeUser(code: string): Observable<any> {
    return this.http.get(this.apiUrl + "/api/users/" + code, {});
  }
  
}