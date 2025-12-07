import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { NoteResponse } from '../dto/noteResponse';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Note {
  private baseUrl: string = `${environment.BASE_URL}/notes`;
  private readonly http = inject(HttpClient);


  public getAllNotes(taskId: number): Observable<NoteResponse[]>{
    return this.http.get<NoteResponse[]>(`${this.baseUrl}/${taskId}`);
  }

  public getNote(noteId: number, taskId: number): Observable<NoteResponse>{
    return this.http.get<NoteResponse>(`${this.baseUrl}/note/${noteId}?taskId=${taskId}`);
  }

  public addNewNote(taskId: number, note: string): Observable<NoteResponse>{
    return this.http.post<NoteResponse>(`${this.baseUrl}/note/${taskId}`, note);
  }

  public deleteNote(noteId: number, taskId: number){
    return this.http.delete<void>(`${this.baseUrl}/note/${noteId}?taskId=${taskId}`);
  }
}
