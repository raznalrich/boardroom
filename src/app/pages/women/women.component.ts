import { Component } from '@angular/core';
import { WomenEmpowermentComponent } from '../../shared/women-empowerment/women-empowerment.component';

@Component({
  selector: 'app-women',
  standalone: true,
  imports: [WomenEmpowermentComponent],
  templateUrl: './women.component.html',
  styleUrls: ['./women.component.scss'],
  host: { class: 'pg' }
})
export class WomenComponent {}
