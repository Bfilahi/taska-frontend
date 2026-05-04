import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormFields } from './form-fields';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, FormFields],
  template: `
    <form [formGroup]="editSubtaskForm">
      <app-form-fields [type]="'task'"></app-form-fields>
    </form>
  `,
})
class HostComponent {
  editSubtaskForm = new FormGroup({
    reusableFields: new FormGroup({
      name: new FormControl(''),
      description: new FormControl(''),
      priority: new FormControl(null),
    }),
  });
}

describe('FormFields', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create form fields inside parent form', () => {
    expect(host.editSubtaskForm.contains('reusableFields')).toBeTrue();
  });

  it('should have required controls initialized', () => {
    const group = host.editSubtaskForm.get('reusableFields') as FormGroup;

    expect(group.get('name')).toBeTruthy();
    expect(group.get('description')).toBeTruthy();
    expect(group.get('priority')).toBeTruthy();
  });

});
