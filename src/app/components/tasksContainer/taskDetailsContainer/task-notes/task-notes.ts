import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute } from '@angular/router';
import { Note } from '../../../../services/note';
import { NoteResponse } from '../../../../dto/noteResponse';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from '../../../../services/user';

@Component({
  selector: 'app-task-notes',
  imports: [MatIconModule, MatCardModule, MatButtonModule, MatInputModule],
  templateUrl: './task-notes.html',
  styleUrl: './task-notes.scss',
})
export class TaskNotes implements OnInit {
  public readonly userService = inject(User);
  private readonly route = inject(ActivatedRoute);
  private readonly noteService = inject(Note);

  public notes = signal<NoteResponse[]>([]);
  private taskId = signal<number>(0);

  public isPostLoading = signal<boolean>(false);
  public isDeleteLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((param) => {
      this.taskId.set(parseInt(param.get('t_id')!));
      this.getNotes();
    });
  }

  public post(note: any) {
    const noteValue: string = note.value;

    if (noteValue.trim().length > 0) {
      this.isPostLoading.set(true);
      this.noteService.addNewNote(this.taskId(), noteValue).subscribe({
        next: (response: NoteResponse) => {
          console.log('Note added successfully. ', response);
          note.value = '';
          this.getNotes();
          this.isPostLoading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.isPostLoading.set(false);
          console.error(err);
        },
      });
    } else console.error('Empty values are not allowed.');
  }

  public onDelete(noteId: number) {
    if (!confirm('Are you sure you want to delete this note?')) return;

    this.isDeleteLoading.set(true);
    this.noteService.deleteNote(noteId, this.taskId()).subscribe({
      next: () => {
        console.log('Note has been deleted successfully.');
        this.getNotes();
        this.isDeleteLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.isDeleteLoading.set(false);
        console.error(err);
      },
    });
  }

  private getNotes() {
    this.noteService.getAllNotes(this.taskId()).subscribe({
      next: (response: NoteResponse[]) => {
        this.notes.set(response);
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      },
    });
  }
}
