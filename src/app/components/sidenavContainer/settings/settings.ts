import { Component } from '@angular/core';
import { MatTabsModule } from "@angular/material/tabs";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from "@angular/material/card";
import { UpdatePassword } from '../update-password/update-password';
import { Profile } from '../profile/profile';


@Component({
  selector: 'app-settings',
  imports: [
    MatTabsModule,
    MatIconModule,
    MatToolbarModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatCardModule,
    UpdatePassword,
    Profile
],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {

}
