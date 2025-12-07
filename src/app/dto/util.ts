import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class Util {
  public static priorities = [
    { value: 'LOW', viewValue: 'LOW' },
    { value: 'MEDIUM', viewValue: 'MEDIUM' },
    { value: 'HIGH', viewValue: 'HIGH' },
  ];

  public static statuses = [
    { value: 'ACTIVE', viewValue: 'ACTIVE'},
    { value: 'COMPLETED', viewValue: 'COMPLETED' },
  ];

  public static dateMustBeAfterToday(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null) return null;
      return control.value > new Date() ? null : { dateAfterToday: true };
    };
  }
}
