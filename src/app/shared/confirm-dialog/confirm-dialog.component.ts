import { Component, HostListener, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  readonly heading = input.required<string>();
  readonly message = input.required<string>();
  readonly confirmLabel = input.required<string>();
  readonly pendingLabel = input('Working…');
  readonly busy = input(false);
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  confirm(): void {
    if (!this.busy()) this.confirmed.emit();
  }

  cancel(): void {
    if (!this.busy()) this.cancelled.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.cancel();
  }
}
