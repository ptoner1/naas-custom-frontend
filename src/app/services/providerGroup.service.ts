import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


export interface NaasProviderGroup {
  id?: number,
  publicId?: string,
  groupName: string,
  description: string
}

@Injectable({
  providedIn: 'root'
})
export class ProviderGroupService {
  
  private readonly apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getAll(): Observable<any> {
    return this.http.get(this.apiUrl + "/api/providers");
  }
  
}