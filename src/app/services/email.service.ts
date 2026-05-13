import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { NaasProviderGroup } from './providerGroup.service';
import { getAuthCookie } from './auth.interceptor';


export interface NaasNotification {
  id?: string,
  publicId?: number,
  subject: string,
  body: string,
  isDraft: string,
  recipients: string[],
  // recipients: NaasProviderGroup[],
  sendDate: string
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  
  private readonly apiUrl = environment.apiUrl + "/api/notifications";
  private http = inject(HttpClient);

  getNotifications(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  createNotification(notification: NaasNotification) {
    const token = getAuthCookie();
    if (!token) {
      return console.error("No token found. User is not authenticated.");
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.post<NaasNotification>(this.apiUrl, notification, { headers });
  }

  getMQStatus() {
    return this.http.get<any>(`${this.apiUrl}/mq-status`);
  }

  getBulkEmailTest(count: number) {
    const token = getAuthCookie();
    if (!token) {
      return console.error("No token found. User is not authenticated.");
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<any>(`${this.apiUrl}/stress-test/${count}`, {}, { headers })
  }

}