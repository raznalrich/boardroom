import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE } from '../../data/site.config';

@Component({
  selector: 'app-btb-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './btb-footer.component.html',
  styleUrls: ['./btb-footer.component.scss']
})
export class BtbFooterComponent {
  readonly site = SITE;
}
