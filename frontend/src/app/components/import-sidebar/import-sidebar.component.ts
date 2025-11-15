import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'app-import-sidebar',
  imports: [CommonModule, AccordionModule],
  templateUrl: './import-sidebar.component.html',
  styleUrl: './import-sidebar.component.css',
})
export class ImportSidebarComponent {
  // Track which accordion panels are expanded
  protected readonly expandedPanels = signal<number[]>([]);

  protected onPanelChange(event: { index: number }): void {
    const currentExpanded = this.expandedPanels();
    const index = event.index;

    if (currentExpanded.includes(index)) {
      // Panel is being collapsed
      this.expandedPanels.set(currentExpanded.filter((i) => i !== index));
    } else {
      // Panel is being expanded
      this.expandedPanels.set([...currentExpanded, index]);
    }
  }
}
