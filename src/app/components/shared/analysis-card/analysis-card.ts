import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-analysis-card',
  imports: [MatCardModule, MatIconModule],
  templateUrl: './analysis-card.html',
  styleUrl: './analysis-card.scss',
})
export class AnalysisCard {
  public cards = input([
    {
      title: '',
      amount: 0,
      icon: '',
      color: '',
      bg: '',
    },
  ]);
}
