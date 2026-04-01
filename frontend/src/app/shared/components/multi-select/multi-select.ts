import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-multi-select',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './multi-select.html',
  styleUrl: './multi-select.scss',
})
export class MultiSelect {
  @Input() options: string[] = [];
  @Input() selected: string[] = [];
  @Input() placeholder: string = 'Select options';
  @Input() disabled = false;
  @Output() selectedChange = new EventEmitter<string[]>();

  isOpen = signal(false);

  constructor(private el: ElementRef) {}

  @HostListener('document:mousedown', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  toggleDropdown(): void {
    if (this.disabled) return;
    this.isOpen.update((v) => !v);
  }

  toggleOption(option: string): void {
    if (this.disabled) return;
    if (this.selected.includes(option)) {
      this.selectedChange.emit(this.selected.filter((i) => i !== option));
    } else {
      this.selectedChange.emit([...this.selected, option]);
    }
  }

  removeItem(option: string, event: MouseEvent): void {
    if (this.disabled) return;
    event.stopPropagation();
    this.selectedChange.emit(this.selected.filter((i) => i !== option));
  }

  isSelected(option: string): boolean {
    return this.selected.includes(option);
  }
}