import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkOrderDocument } from '../../models/work-order.model';

@Component({
  selector: 'app-work-order-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './work-order-bar.component.html',
  styleUrl: './work-order-bar.component.scss'
})
export class WorkOrderBarComponent {
  @Input() workOrder!: WorkOrderDocument;
  @Input() timelineStart!: Date;
  @Input() timelineEnd!: Date;
  @Input() timelineWidth!: number;
  @Output() edit = new EventEmitter<WorkOrderDocument>();
  @Output() delete = new EventEmitter<string>();

  showMenu = false;

  get barLeft(): number {
    const startDate = new Date(this.workOrder.data.startDate);
    const endDate = new Date(this.workOrder.data.endDate);
    const startTime = this.timelineStart.getTime();
    const endTime = this.timelineEnd.getTime();
    const orderStartTime = startDate.getTime();

    if (orderStartTime < startTime) return 0;
    if (orderStartTime > endTime) return this.timelineWidth;

    const ratio = (orderStartTime - startTime) / (endTime - startTime);
    return ratio * this.timelineWidth;
  }

  get barWidth(): number {
    const startDate = new Date(this.workOrder.data.startDate);
    const endDate = new Date(this.workOrder.data.endDate);
    const startTime = this.timelineStart.getTime();
    const endTime = this.timelineEnd.getTime();
    const orderStartTime = startDate.getTime();
    const orderEndTime = endDate.getTime();

    // Calculate width based on date range
    const totalTime = endTime - startTime;
    const orderDuration = orderEndTime - orderStartTime;
    const widthRatio = orderDuration / totalTime;
    let width = widthRatio * this.timelineWidth;

    // Ensure minimum width for visibility
    const minWidth = 100;
    if (width < minWidth) {
      width = minWidth;
    }

    // Adjust if bar extends beyond timeline
    const maxLeft = this.timelineWidth - width;
    if (this.barLeft > maxLeft) {
      return this.timelineWidth - this.barLeft;
    }

    return width;
  }

  get statusClass(): string {
    return `status-${this.workOrder.data.status}`;
  }

  get statusLabel(): string {
    const status = this.workOrder.data.status;
    switch (status) {
      case 'open':
        return 'Open';
      case 'in-progress':
        return 'In Progress';
      case 'complete':
        return 'Complete';
      case 'blocked':
        return 'Blocked';
      default:
        return status;
    }
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.showMenu = !this.showMenu;
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.showMenu = false;
    this.edit.emit(this.workOrder);
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    this.showMenu = false;
    this.delete.emit(this.workOrder.docId);
  }

  onClick(event: Event): void {
    event.stopPropagation();
  }
}
