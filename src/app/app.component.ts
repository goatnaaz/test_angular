import { Component, OnInit } from '@angular/core';
import { ApppSTate } from './interface/app-state';
import { CustomResponce } from './interface/custom-responce';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { ServerService } from './service/server.service';
import { DataState } from './enum/data-state.enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent  implements OnInit {

  appState$ : Observable<ApppSTate<CustomResponce>>

  constructor(private serverService : ServerService){}


  ngOnInit(): void {
    this.appState$ = this.serverService.servers$
    .pipe(
      map(responce => {
        return {dataState : DataState.LOADED_STATE,appDate:responce}
      }),
      startWith({dataState: DataState.LOADING_STATE }),
      catchError((error : string) => {
        return of({dataState : DataState.EROR_STATE ,error : error})
      })
    );
  }
 
}


