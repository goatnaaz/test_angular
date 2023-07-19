import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable , Subscriber, throwError } from "rxjs";
import { tap , catchError } from "rxjs/operators";
import { CustomResponce } from "../interface/custom-responce";
import { Server } from "../interface/server";
import { Status } from "../enum/status.enum";

@Injectable({
    providedIn: 'root'
})

export class ServerService{
    

    private readonly apiUrl = 'any'
    constructor(private http : HttpClient ){ }

    servers$ = <Observable<CustomResponce>>
    this.http.get<CustomResponce>(`${this.apiUrl}/server/list`)
    .pipe(
        tap(console.log),
        catchError(this.handleError)
    )

    save$ = (server : Server) => <Observable<CustomResponce>>
    this.http.post<CustomResponce>(`${this.apiUrl}/server/save` , server)
    .pipe(
        tap(console.log),
        catchError(this.handleError)
    )

    ping$ = (ipAddress : string) => <Observable<CustomResponce>>
    this.http.get<CustomResponce>(`${this.apiUrl}/server/ping/${ipAddress}`)
    .pipe(
        tap(console.log),
        catchError(this.handleError)
    )

    filter$ = (status : Status , responce : CustomResponce) => <Observable<CustomResponce>>
    new Observable<CustomResponce>(
        subscriber => {
            console.log(responce);
            subscriber.next(
                status === Status.ALL ? {...responce , message : `Servers filtered by ${status} status`} :
                {
                    ...responce,
                    message : responce.data.servers
                    .filter(server => server.status === status).length > 0 ? `Servers filtered by
                    ${status === Status.SERVER_UP ? `SERVER UP` 
                : `SERVER DOWN`} status ` : `No servers of ${status} found` ,
                data : {servers : responce.data.servers
                .filter(server => server.status === status) }
                }
            );
            subscriber.complete();
        }
        
    )
    .pipe(
        tap(console.log),
        catchError(this.handleError)
    )

    delete$ = (serverId : number) => <Observable<CustomResponce>>
    this.http.delete<CustomResponce>(`${this.apiUrl}/server/delete/${serverId}`)
    .pipe(
        tap(console.log),
        catchError(this.handleError)
    )



     



    private handleError(error : HttpErrorResponse): Observable<never> {
        console.log(error);
        return  throwError(`An error occurred - Error code: ${error.status}`);
    }
    
   
    
}
