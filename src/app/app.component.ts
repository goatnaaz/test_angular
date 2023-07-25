import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import { DataState } from './enum/data-state.enum';
import { Status } from './enum/status.enum';
import { ApppSTate } from './interface/app-state';
import { CustomResponce } from './interface/custom-responce'; 
import { Server } from './interface/server';
import { ServerService } from './service/server.service';
import { NotificationService } from './service/notification.service';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection : ChangeDetectionStrategy.OnPush
})
export class AppComponent  implements OnInit {

  appState$: Observable<ApppSTate<CustomResponce>>;
  readonly DataState = DataState;
  readonly Status = Status;
  private filterSubject = new BehaviorSubject<string>('');
  private dataSubject = new BehaviorSubject<CustomResponce>(null);
  filterStatus$ = this.filterSubject.asObservable();
  private isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();
 


  constructor(private serverService : ServerService ,private  notifier: NotificationService){}


  ngOnInit(): void {
    this.appState$ = this.serverService.servers$
      .pipe(
        map(response => {
          this.notifier.onDefault(response.message);
          this.dataSubject.next(response);
          return { dataState: DataState.LOADED_STATE, appData: { ...response, data: { servers: response.data.servers.reverse() } } }
        }),
        startWith({ dataState: DataState.LOADING_STATE }),
        catchError((error: string) => {
          this.notifier.onError(error);
          return of({ dataState: DataState.ERROR_STATE, error });
        })
      );
  }


  pingServer(ipAddress : string ): void {
    this.filterSubject.next(ipAddress)
    this.appState$ = this.serverService.ping$(ipAddress)
    .pipe(
      map(responce => {
        const index = this.dataSubject.value.data.servers.findIndex(server =>  server.id === responce.data.server.id);
          this.dataSubject.value.data.servers[index] = responce.data.server;
          this.notifier.onDefault(responce.message);
          this.filterSubject.next('');
          return { dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }
      }),
      startWith({dataState: DataState.LOADED_STATE , appData : this.dataSubject.value  }),
      catchError((error : string) => {
        this.notifier.onError(error);
        this.filterSubject.next('');
        return of({dataState : DataState.ERROR_STATE ,error })
      })
    );
  }

  deleteServer(server : Server ): void {
    
    this.appState$ = this.serverService.delete$(server.id)
    .pipe(
      map(responce => {
          this.dataSubject.next(
            {...responce , data : {
              servers : this.dataSubject.value.data.servers.filter(s =>s.id !== server.id)
            }}
          );
          this.notifier.onDefault(responce.message);
          return { dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }
      }),
      startWith({dataState: DataState.LOADED_STATE , appData : this.dataSubject.value  }),
      catchError((error : string) => {
        this.notifier.onError(error);
        return of({dataState : DataState.ERROR_STATE ,error })
      })
    );
  }

  saveServer(serverForm : NgForm ): void {
    this.isLoading.next(true);
    this.appState$ = this.serverService.save$(serverForm.value as Server)
    .pipe(
      map(responce => {
          this.dataSubject.next(
            {...responce , data: { servers: [responce.data.server, ...this.dataSubject.value.data.servers] } }
          );
          this.notifier.onDefault(responce.message);
          document.getElementById('closeModal').click();
          this.isLoading.next(false);
          serverForm.resetForm({ status: this.Status.SERVER_DOWN});
          return { dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }
      }),
      startWith({dataState: DataState.LOADED_STATE , appData : this.dataSubject.value  }),
      catchError((error : string) => {
        this.notifier.onError(error);
        this.isLoading.next(false);
        return of({dataState : DataState.ERROR_STATE ,error })
      })
    );
  }

  filterServers(status : Status): void {
    
    this.appState$ = this.serverService.filter$(status, this.dataSubject.value)
      .pipe(
        map(response => {
          this.notifier.onDefault(response.message);
          return { dataState: DataState.LOADED_STATE, appData: response };
          
        }),
      
        startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }),
        catchError((error: string) => {
          this.notifier.onError(error);
          return of({ dataState: DataState.ERROR_STATE, error });
        })
      );
  }

  printReport(): void{
    let dataType = 'application/vnd.ms-excel.sheet.macroEnabled.12';
    let tableSelect = document.getElementById('servers')
    let tableHtml = tableSelect.outerHTML.replace(/ /g,'%20');
    let downloadLink = document.createElement('a');
    document.body.appendChild(downloadLink);
    downloadLink.href = 'data:' + dataType + ', ' + tableHtml;
    downloadLink.download = 'server-report.xls';
    downloadLink.click();
    document.body.removeChild(downloadLink);

  }


 
}


