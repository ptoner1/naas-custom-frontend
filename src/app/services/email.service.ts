import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { NaasProviderGroup } from './providerGroup.service';


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

  createNotification(notification: NaasNotification): Observable<any> {
    return this.http.post(this.apiUrl, notification);
  }

  getMQStatus() {
    // return this.http.get<any>(`${this.apiUrl}/mq-status`);
  }

}