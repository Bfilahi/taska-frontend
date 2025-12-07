import { TitleCasePipe } from '@angular/common';
import { Component, inject, input, OnDestroy, OnInit } from '@angular/core';
import {
  ControlContainer,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Util } from '../../../dto/util';
import { Priority } from '../../../enum/priorityEnum';


@Component({
  selector: 'app-form-fields',
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    TitleCasePipe,
    ReactiveFormsModule,
    MatInputModule,
  ],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
  templateUrl: './form-fields.html',
  styleUrl: './form-fields.scss',
})
export class FormFields implements OnInit, OnDestroy {
  parentContainer = inject(ControlContainer);
  public type = input<string>('');

  public priorities = Util.priorities;
  public statuses = Util.statuses;

  get parentFormGroup() {
    return this.parentContainer.control as FormGroup;
  }

  get reusableFieldGroup() {
    return this.parentFormGroup.get('reusableFields') as FormGroup;
  }

  get nameControl() {
    return this.reusableFieldGroup.get('name') as FormControl;
  }

  get descriptionControl() {
    return this.reusableFieldGroup.get('description') as FormControl;
  }

  get priorityControl() {
    return this.reusableFieldGroup.get('priority') as FormControl;
  }


  ngOnInit(): void {
    this.parentFormGroup.addControl(
      'reusableFields',
      new FormGroup({
        name: new FormControl('', [Validators.required, Validators.minLength(3)]),
        description: new FormControl('', [Validators.required, Validators.minLength(3)]),
        priority: new FormControl(null, Validators.required),
      })
    );
  }

  ngOnDestroy(): void {
    this.parentFormGroup.removeControl('reusableFields');
  }
}
