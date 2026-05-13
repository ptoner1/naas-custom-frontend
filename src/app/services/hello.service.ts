import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";


@Injectable({
    providedIn: 'root'
  })
  export class HelloService {

    private readonly apiUrl = environment.apiUrl;
    private http = inject(HttpClient);

    sendHelloMessage(name: string): Observable<any> {
        const params = new HttpParams().set('name', name);
        return this.http.get(this.apiUrl + "/hello", { params });
    }
    
  }
