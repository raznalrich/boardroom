import { Component, input } from '@angular/core';

/**
 * Small gold continent icon for the magazine regions: a round badge with a simplified outline of the continent.
 * Pure inline SVG, so it takes its colour from the surrounding text (currentColor) and works on dark and light backgrounds.
 */
@Component({
  selector: 'app-region-icon',
  standalone: true,
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="5" opacity=".55" />
      <g fill="currentColor" transform="translate(50 50) scale(1.22) translate(-50 -50)">
        @switch (region()) {
          @case ('America') {
            <path d="M30 20 L47 17 L56 25 L52 36 L44 42 L40 50 L33 44 L24 35 L22 27 Z" />
            <path d="M42 54 L54 56 L60 66 L54 78 L47 86 L43 74 L40 63 Z" />
          }
          @case ('Africa') {
            <path d="M38 22 L54 20 L66 27 L72 38 L82 46 L76 58 L68 62 L64 76 L55 84 L47 76 L45 62 L36 56 L24 54 L20 42 L27 30 Z" />
          }
          @case ('Europe') {
            <path d="M30 40 L36 28 L46 24 L52 30 L60 24 L70 30 L66 40 L72 48 L62 56 L54 52 L48 62 L40 56 L32 60 L26 52 Z" />
            <path d="M44 16 L50 12 L54 18 L48 22 Z" />
          }
          @case ('Middle East') {
            <path d="M26 30 L44 24 L58 32 L72 44 L68 56 L56 62 L50 76 L42 66 L44 52 L32 44 Z" />
          }
          @default {
            <path d="M16 36 L28 26 L46 22 L68 24 L82 34 L80 46 L72 50 L74 60 L64 64 L58 56 L48 62 L42 50 L30 52 L20 46 Z" />
          }
        }
      </g>
    </svg>
  `,
  styles: [`:host { display: inline-flex; flex: 0 0 auto; line-height: 0; } svg { display: block; }`]
})
export class RegionIconComponent {
  region = input.required<string>();
  size = input(22);
}
