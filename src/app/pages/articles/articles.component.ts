import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SECTOR_TABS, sectorCover } from '../../core/data/sector.data';
import { ArticlesService } from '../../core/data/articles.service';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss'],
  host: { class: 'pg' }
})
export class ArticlesComponent {
  private svc = inject(ArticlesService);
  loaded = this.svc.loaded;
  tabs = SECTOR_TABS;
  active = signal('ALL');
  cover = sectorCover;

  filtered = computed(() =>
    this.active() === 'ALL' ? this.svc.published() : this.svc.published().filter(a => a.category === this.active())
  );
}
