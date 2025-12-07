import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { EditTask } from '../../../tasksContainer/edit-task/edit-task';
import { TaskResponse } from '../../../../dto/taskResponse';
import { Task } from '../../../../services/task';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import { Project } from '../../../../services/project';
import { Status } from '../../../../enum/statusEnum';
import { Priority } from '../../../../enum/priorityEnum';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-tasks-table',
  imports: [
    MatTabsModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatMenuModule,
    MatTableModule,
    MatButtonModule,
    RouterLink,
    MatCheckboxModule,
    CommonModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './tasks-table.html',
  styleUrl: './tasks-table.scss',
})
export class TasksTable implements OnInit, OnDestroy {
  private readonly taskService = inject(Task);
  private readonly projectService = inject(Project);
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly toaster = inject(HotToastService);

  private destroy$ = new Subject<void>();
  private projectId = signal<number>(0);

  public low: Priority = Priority.LOW;
  public medium: Priority = Priority.MEDIUM;
  public high: Priority = Priority.HIGH;

  public active: Status = Status.ACTIVE;
  public completed: Status = Status.COMPLETED;

  displayedColumns: string[] = [
    'completed',
    'title',
    'priority',
    'status',
    'subtasks',
    'dueDate',
    'menu',
  ];
  datasource: TaskResponse[] = [];

  public tasks = signal<TaskResponse[]>([]);
  public partialParams: { page: number; size: number } = {
    page: 1,
    size: 5,
  };
  public totalElements = signal<number>(0);
  public totalPages = signal<number>(0);

  public isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((param) => {
      if (param.has('id')) {
        this.projectId.set(parseInt(param.get('id')!));
        this.listTasks();
      }
    });

    this.taskService.taskChanged$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.listTasks();
      this.projectService.loadProjectStatus(this.projectId());
    });
  }

  public listTasks() {
    this.isLoading.set(true);

    this.taskService.getAllTasks(this.partialParams, this.projectId()).subscribe({
      next: (response: any) => {
        this.tasks.set(response.content);
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

  public onDelete(taskId: number) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    this.isLoading.set(true);

    this.taskService.deleteTask(taskId, this.projectId()).subscribe({
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

  public toggleTaskCompletion(taskId: number) {
    this.isLoading.set(true);

    this.taskService.toggleTaskCompletion(taskId, this.projectId()).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        console.error(err);
      },
    });
  }

  public openNewTaskDialog(id: number): void {
    const dialogConfig: MatDialogConfig = {
      data: {
        taskId: id,
      },
    };

    this.dialog.open(EditTask, dialogConfig);
  }

  public onPageChange(event: PageEvent) {
    this.partialParams.page = event.pageIndex + 1;
    this.partialParams.size = event.pageSize;

    this.listTasks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
