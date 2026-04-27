import { TestBed } from '@angular/core/testing';

import { Note } from './note';
import { environment } from '../../environments/environment.development';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { NoteResponse } from '../dto/noteResponse';

describe('Note', () => {
  let service: Note;

  const taskId: number = 1;
  const noteId: number = 2;
  const baseUrl: string = `${environment.BASE_URL}/notes`;
  let mockData: NoteResponse[];

  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ]
    });

    mockData = [
      {
        id: 1,
        note: 'note 1',
        createdAt: new Date(2024, 5, 20)
      },
      {
        id: 2,
        note: 'note 2',
        createdAt: new Date(2024, 7, 13)
      },
    ];

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(Note);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call the correct HTTP URL for getAllNotes()', () => {
    service.getAllNotes(taskId).subscribe();

    const req = httpTestingController.expectOne(`${baseUrl}/${taskId}`);
    req.flush(mockData);
    expect(req.request.method).toBe('GET');
  });

  it('should call the correct HTTP URL for getNote()', () => {
    service.getNote(noteId, taskId).subscribe();

    const req = httpTestingController.expectOne(`${baseUrl}/note/${noteId}?taskId=${taskId}`);
    req.flush(mockData[0]);
    expect(req.request.method).toBe('GET');
  });

  it('should call the correct HTTP URL for addNewNote()', () => {
    const note: string = 'new note';

    service.addNewNote(taskId, note).subscribe();

    const req = httpTestingController.expectOne(`${baseUrl}/note/${taskId}`);
    req.flush(mockData[0]);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(note);
  });

  it('should call the correct HTTP URL for deleteNote()', () => {
    service.deleteNote(noteId, taskId).subscribe();

    const req = httpTestingController.expectOne(`${baseUrl}/note/${noteId}?taskId=${taskId}`);
    req.flush({});
    expect(req.request.method).toBe('DELETE');
  });
});