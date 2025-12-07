import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { User } from '../../../services/user';
import { MatIconModule } from '@angular/material/icon';
import { UserRequest } from '../../../dto/userRequest';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../services/auth-service';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-profile',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    MatIconModule,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private readonly userService = inject(User);
  private readonly authService = inject(AuthService);
  private readonly toaster = inject(HotToastService);

  public profileForm = new FormGroup({
    firstName: new FormControl(this.userService.user()?.firstName ?? '', [
      Validators.required,
      Validators.minLength(3),
    ]),
    lastName: new FormControl(this.userService.user()?.lastName ?? '', [
      Validators.required,
      Validators.minLength(3),
    ]),
    email: new FormControl(this.userService.user()?.email ?? '', [
      Validators.required,
      Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
    ]),
  });

  public isLoading = signal<boolean>(false);

  public save() {
    this.isLoading.set(true);

    const request: UserRequest = {
      firstName: this.profileForm.value.firstName!,
      lastName: this.profileForm.value.lastName!,
      email: this.profileForm.value.email!,
    };

    this.userService.updateProfile(request).subscribe({
      next: () => {
        this.isLoading.set(false);
        localStorage.removeItem('user');
        this.userService.getUser();
        this.toaster.success('Profile was updated successfully');
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        console.error(err);
        this.toaster.error(`Error: ${err.error.message}`);
      },
    });
  }

  public delete() {
    if (!confirm('Are you sure you want to delete your account?')) return;

    this.userService.deleteUser().subscribe({
      next: () => {
        this.toaster.success('User deleted successfully');

        this.authService.logout();
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.toaster.error(`Error: ${err.error.message}`);
      },
    });
  }
}
