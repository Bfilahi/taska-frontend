import { Component } from '@angular/core';
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-overdue-card',
  imports: [MatCardModule, MatIconModule, RouterLink],
  templateUrl: './overdue-card.html',
  styleUrl: './overdue-card.scss',
})
export class OverdueCard {

}
