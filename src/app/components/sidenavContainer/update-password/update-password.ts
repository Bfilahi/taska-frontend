import { Component, inject, signal } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../../services/user';
import { HttpErrorResponse } from '@angular/common/http';
import { PasswordRequest } from '../../../dto/passwordRequest';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-update-password',
  imports: [
    MatTabsModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './update-password.html',
  styleUrl: './update-password.scss',
})
export class UpdatePassword {
  private readonly userService = inject(User);
  private readonly toaster = inject(HotToastService);

  public updatePasswordForm = new FormGroup({
    oldPassword: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
    ]),
    newPassword: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
    ]),
    confirmPassword: new FormControl('', Validators.required),
  });

  public isLoading = signal<boolean>(false);

  public updatePassword() {
    this.isLoading.set(true);

    const request: PasswordRequest = {
      oldPassword: this.updatePasswordForm.value.oldPassword!,
      newPassword: this.updatePasswordForm.value.newPassword!,
      confirmPassword: this.updatePasswordForm.value.confirmPassword!,
    };

    this.userService.updatePassword(request).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.updatePasswordForm.reset();
        this.toaster.success('Password was updated successfully');
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        console.error(err);
        this.toaster.error(`Error: ${err.error.message}`);
      },
    });
  }
}
