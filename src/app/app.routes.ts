import { Routes } from '@angular/router';
import { BtbHomeComponent } from './pages/btb-home/btb-home.component';

export const routes: Routes = [
  {
    path: '',
    component: BtbHomeComponent,
    data: { hideHeader: false, hideTicker: false }
  },
  {
    path: 'leadership-profiles',
    component: BtbHomeComponent,
    data: { hideHeader: false, hideTicker: true }
  },
  {
    path: 'admin/editor',
    component: BtbHomeComponent,
    data: { hideHeader: true }
  },
  {
    path: '**',
    redirectTo: ''
  }
];
