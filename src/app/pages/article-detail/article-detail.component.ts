import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Article, ArticlesService } from '../../core/data/articles.service';
import { sectorCover } from '../../core/data/sector.data';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.scss'],
  host: { class: 'pg' }
})
export class ArticleDetailComponent {
  private svc = inject(ArticlesService);
  readonly cover = sectorCover;
  readonly loaded = this.svc.loaded;

  private idParam = toSignal(inject(ActivatedRoute).paramMap.pipe(map(p => p.get('id') ?? '')), { initialValue: '' });

  article = computed<Article | undefined>(() => this.svc.published().find(a => a.id === this.idParam()));

  /** Paragraphs of the elaborate write-up (blank-line separated). Empty when none was written. */
  paragraphs = computed<string[]>(() => {
    const c = this.article()?.content?.trim();
    return c ? c.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean) : [];
  });

  /** Other articles, same category first. */
  related = computed<Article[]>(() => {
    const cur = this.article();
    if (!cur) return [];
    const others = this.svc.published().filter(a => a.id !== cur.id);
    return [...others.filter(a => a.category === cur.category), ...others.filter(a => a.category !== cur.category)].slice(0, 3);
  });
}
