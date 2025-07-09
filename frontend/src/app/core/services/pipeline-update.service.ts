import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PipelineUpdateService {
  private pipelineUpdateSource = new Subject<void>();
  pipelineUpdate$ = this.pipelineUpdateSource.asObservable();

  notifyPipelineUpdate(): void {
    this.pipelineUpdateSource.next();
  }
} 