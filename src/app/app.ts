import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BtbHeaderComponent } from './core/layout/btb-header/btb-header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BtbHeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  openSubscriptionModal(): void {
    console.log('Open subscription modal');
  }

  handleGlobalSearch(query: string): void {
    console.log('Global search query:', query);
  }
}
