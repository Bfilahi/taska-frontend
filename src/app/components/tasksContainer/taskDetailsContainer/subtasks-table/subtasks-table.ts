import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { SubtaskResponse } from '../../../../dto/subtaskResponse';
import { ActivatedRoute } from '@angular/router';
import { Subtask } from '../../../../services/subtask';
import { HttpErrorResponse } from '@angular/common/http';
import { TaskResponse } from '../../../../dto/taskResponse';
import { EditSubtask } from '../edit-subtask/edit-subtask';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import { Priority } from '../../../../enum/priorityEnum';
import { Status } from '../../../../enum/statusEnum';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-subtasks-table',
  imports: [
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    MatButtonModule,
    MatCheckboxModule,
    CommonModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './subtasks-table.html',
  styleUrl: './subtasks-table.scss',
})
export class SubtasksTable implements OnInit {
  displayedColumns: string[] = ['completed', 'title', 'priority', 'status', 'dueDate', 'menu'];
  dataSource: TaskResponse[] = [];
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private subtaskService = inject(Subtask);
  private readonly toaster = inject(HotToastService);

  private taskId = signal<number>(0);
  public subtasks = signal<SubtaskResponse[]>([]);
  public partialParams: { page: number; size: number } = {
    page: 1,
    size: 5,
  };
  public totalElements = signal<number>(0);
  public totalPages = signal<number>(0);

  public low: Priority = Priority.LOW;
  public medium: Priority = Priority.MEDIUM;
  public high: Priority = Priority.HIGH;

  public active: Status = Status.ACTIVE;
  public completed: Status = Status.COMPLETED;

  public isLoading = signal<boolean>(true);

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((param) => {
      this.taskId.set(parseInt(param.get('t_id')!));
      if (this.taskId()) this.listSubtasks();
    });

    this.subtaskService.subtaskChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.listSubtasks());
  }

  public onDelete(subtaskId: number) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    this.isLoading.set(true);
    this.subtaskService.deleteSubtask(subtaskId, this.taskId()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toaster.success('Task was deleted successfully');
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        console.error(err);
        this.toaster.error(`Error: ${err.error.message}`);
      },
    });
  }

  public toggleSubtaskCompletion(subtaskId: number) {
    this.isLoading.set(true);
    this.subtaskService.toggleSubtaskCompletion(this.taskId(), subtaskId).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        console.error(err);
      },
    });
  }

  public openEditTaskDialog(id: number): void {
    const dialogConfig: MatDialogConfig = {
      data: {
        subtaskId: id,
      },
    };
    this.dialog.open(EditSubtask, dialogConfig);
  }

  public onPageChange(event: PageEvent) {
    this.partialParams.page = event.pageIndex + 1;
    this.partialParams.size = event.pageSize;

    this.listSubtasks();
  }

  private listSubtasks() {
    this.isLoading.set(true);
    this.subtaskService.getSubTasks(this.taskId(), this.partialParams).subscribe({
      next: (response: any) => {
        this.subtasks.set(response.content);
        this.partialParams.page = response.number + 1;
        this.partialParams.size = response.size;
        this.totalElements.set(response.totalElements);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        console.error(err);
      },
    });
  }
}
