import { Component, inject, OnInit, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormFields } from '../../shared/form-fields/form-fields';
import { MatButtonModule } from '@angular/material/button';
import { Task } from '../../../services/task';
import { TaskRequest } from '../../../dto/taskRequest';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Util } from '../../../dto/util';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-new-task',
  imports: [
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDialogModule,
    FormFields,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './new-task.html',
  styleUrl: './new-task.scss',
})
export class NewTask implements OnInit {
  public readonly taskService = inject(Task);
  private readonly route = inject(ActivatedRoute);
  private readonly dialogRef = inject(MatDialogRef<this>);
  private readonly toaster = inject(HotToastService);

  public newTaskForm = new FormGroup({
    dueDate: new FormControl<Date | null>(null, [Validators.required, Util.dateMustBeAfterToday()]),
  });

  public isLoading = signal<boolean>(false);
  private projectId = signal<number>(0);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((param) => {
      this.projectId.set(parseInt(param.get('id')!));
    });
  }

  get reusableFields(): FormGroup | null {
    return this.newTaskForm.get('reusableFields') as FormGroup | null;
  }

  public onSubmit() {
    this.isLoading.set(true);

    if(this.reusableFields && this.projectId()){
      const reusableFieldValue = this.reusableFields.value;

      const request: TaskRequest = {
        title: reusableFieldValue.name,
        description: reusableFieldValue.description,
        priority: reusableFieldValue.priority,
        dueDate: this.newTaskForm.value.dueDate!,
        projectId: this.projectId()
      };

      this.taskService.addNewTask(request).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.dialogRef.close(true);
          this.toaster.success('New task was added successfully');
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading.set(false);
          console.error(err);
          this.toaster.error(`Error: ${err.error.message}`);
          this.dialogRef.close(false);
        }
      });
    }
    else{
      this.isLoading.set(false);
      console.error('Error: Form fields are missing');
      this.toaster.error('Error: Form fields are missing');
      this.dialogRef.close(false);
    }
  }
}