import { Component } from '@angular/core';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";

@Component({
  selector: 'app-priority-status',
  imports: [MatFormFieldModule, MatSelectModule],
  templateUrl: './priority-status.html',
  styleUrl: './priority-status.scss',
})
export class PriorityStatus {
  public priorities = [
    { value: 'LOW-0', viewValue: 'LOW' },
    { value: 'MEDIUM-1', viewValue: 'MEDIUM' },
    { value: 'HIGH-2', viewValue: 'HIGH' },
  ];

  public status = [
    { value: 'active-0', viewValue: 'Active' },
    { value: 'completed-1', viewValue: 'Completed' },
    { value: 'cancelled-2', viewValue: 'Cancelled' },
  ];
}
