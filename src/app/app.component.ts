import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineComponent } from './components/timeline/timeline.component';
import { PanelData } from './components/work-order-panel/work-order-panel.component';
import { WorkOrderPanelComponent } from './components/work-order-panel/work-order-panel.component';
import { WorkOrderDocument } from './models/work-order.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TimelineComponent, WorkOrderPanelComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  panelOpen = false;
  editOrder: WorkOrderDocument | null = null;
  createData: PanelData | null = null;

  onCreateOrder(data: PanelData): void {
    this.createData = data;
    this.editOrder = null;
    this.panelOpen = true;
  }

  onEditOrder(order: WorkOrderDocument): void {
    this.editOrder = order;
    this.createData = null;
    this.panelOpen = true;
  }

  onDeleteOrder(orderId: string): void {
    // Deletion is handled in the timeline component via the service
    // This method is here for the event binding, but the actual deletion
    // happens in the timeline component's onDeleteOrder method
  }

  onClosePanel(): void {
    this.panelOpen = false;
    this.editOrder = null;
    this.createData = null;
  }

  onSaved(): void {
    // Panel will close automatically, but we can do any additional logic here
    // like refreshing data, showing notifications, etc.
  }
}
