import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { TaskResponse } from '../../../../dto/taskResponse';
import { Task } from '../../../../services/task';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from '../../../../services/user';
import { Priority } from '../../../../enum/priorityEnum';
import { Status } from '../../../../enum/statusEnum';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-task-details-card',
  imports: [MatCardModule, MatIconModule, TitleCasePipe],
  templateUrl: './task-details-card.html',
  styleUrl: './task-details-card.scss',
})
export class TaskDetailsCard implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly taskService = inject(Task);
  public readonly userService = inject(User);

  public task = signal<TaskResponse | null>(null);

  public low: Priority = Priority.LOW;
  public medium: Priority = Priority.MEDIUM;
  public high: Priority = Priority.HIGH;

  public active: Status = Status.ACTIVE;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((param) => {
      const taskId: number = parseInt(param.get('t_id')!);
      const projectId: number = parseInt(param.get('p_id')!);
      if (taskId && projectId) this.getTask(taskId, projectId);
    });
  }

  private getTask(taskId: number, projectId: number) {
    this.taskService.getTask(taskId, projectId).subscribe({
      next: (response: TaskResponse) => {
        this.task.set(response);
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      },
    });
  }
}
