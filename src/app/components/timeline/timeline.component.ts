import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkCenterDocument } from '../../models/work-center.model';
import { WorkOrderDocument } from '../../models/work-order.model';
import { WorkCenterService } from '../../services/work-center.service';
import { WorkOrderService } from '../../services/work-order.service';
import { Subject, takeUntil } from 'rxjs';
import { WorkOrderBarComponent } from '../work-order-bar/work-order-bar.component';

export type ZoomLevel = 'day' | 'week' | 'month';

export interface TimelineColumn {
  date: Date;
  label: string;
  width: number;
}

export interface PanelData {
  workCenterId: string;
  startDate: Date;
}

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, WorkOrderBarComponent],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss'
})
export class TimelineComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() selectedWorkCenterId: string | null = null;
  @Output() createOrder = new EventEmitter<PanelData>();
  @Output() editOrder = new EventEmitter<WorkOrderDocument>();
  @Output() deleteOrder = new EventEmitter<string>();

  @ViewChild('timelineScroll', { static: false }) timelineScroll!: ElementRef<HTMLDivElement>;

  workCenters: WorkCenterDocument[] = [];
  workOrders: WorkOrderDocument[] = [];
  zoomLevel: ZoomLevel = 'day';
  timelineColumns: TimelineColumn[] = [];
  timelineStartDate: Date = new Date();
  timelineEndDate: Date = new Date();
  today: Date = new Date();
  todayPosition: number = 0;

  private destroy$ = new Subject<void>();
  private readonly COLUMN_WIDTH_DAY = 80;
  private readonly COLUMN_WIDTH_WEEK = 120;
  private readonly COLUMN_WIDTH_MONTH = 150;
  private readonly DAYS_BUFFER = 14; // Show ±14 days for day view

  constructor(
    private workCenterService: WorkCenterService,
    private workOrderService: WorkOrderService
  ) {}

  ngOnInit(): void {
    this.workCenterService.getWorkCenters()
      .pipe(takeUntil(this.destroy$))
      .subscribe(centers => {
        this.workCenters = centers;
      });

    this.workOrderService.getWorkOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe(orders => {
        this.workOrders = orders;
      });

    this.updateTimeline();
  }

  ngAfterViewInit(): void {
    // Scroll to center on today's date
    setTimeout(() => {
      this.scrollToToday();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onZoomChange(level: ZoomLevel): void {
    this.zoomLevel = level;
    this.updateTimeline();
    setTimeout(() => {
      this.scrollToToday();
    }, 100);
  }

  updateTimeline(): void {
    this.today = new Date();
    this.today.setHours(0, 0, 0, 0);

    switch (this.zoomLevel) {
      case 'day':
        this.setupDayView();
        break;
      case 'week':
        this.setupWeekView();
        break;
      case 'month':
        this.setupMonthView();
        break;
    }

    this.calculateTodayPosition();
  }

  private setupDayView(): void {
    const start = new Date(this.today);
    start.setDate(start.getDate() - this.DAYS_BUFFER);
    this.timelineStartDate = start;

    const end = new Date(this.today);
    end.setDate(end.getDate() + this.DAYS_BUFFER);
    this.timelineEndDate = end;

    this.timelineColumns = [];
    const current = new Date(this.timelineStartDate);
    while (current <= this.timelineEndDate) {
      this.timelineColumns.push({
        date: new Date(current),
        label: this.formatDayLabel(current),
        width: this.COLUMN_WIDTH_DAY
      });
      current.setDate(current.getDate() + 1);
    }
  }

  private setupWeekView(): void {
    const start = new Date(this.today);
    start.setDate(start.getDate() - 7 * 4); // 4 weeks back
    start.setDate(start.getDate() - start.getDay()); // Start of week
    this.timelineStartDate = start;

    const end = new Date(this.today);
    end.setDate(end.getDate() + 7 * 4); // 4 weeks forward
    end.setDate(end.getDate() + (6 - end.getDay())); // End of week
    this.timelineEndDate = end;

    this.timelineColumns = [];
    const current = new Date(this.timelineStartDate);
    while (current <= this.timelineEndDate) {
      const weekEnd = new Date(current);
      weekEnd.setDate(weekEnd.getDate() + 6);
      this.timelineColumns.push({
        date: new Date(current),
        label: this.formatWeekLabel(current, weekEnd),
        width: this.COLUMN_WIDTH_WEEK
      });
      current.setDate(current.getDate() + 7);
    }
  }

  private setupMonthView(): void {
    const start = new Date(this.today);
    start.setMonth(start.getMonth() - 6); // 6 months back
    start.setDate(1); // First day of month
    this.timelineStartDate = start;

    const end = new Date(this.today);
    end.setMonth(end.getMonth() + 6); // 6 months forward
    end.setDate(0); // Last day of previous month
    end.setDate(end.getDate() + 1); // First day of next month
    this.timelineEndDate = end;

    this.timelineColumns = [];
    const current = new Date(this.timelineStartDate);
    while (current < this.timelineEndDate) {
      this.timelineColumns.push({
        date: new Date(current),
        label: this.formatMonthLabel(current),
        width: this.COLUMN_WIDTH_MONTH
      });
      current.setMonth(current.getMonth() + 1);
    }
  }

  private formatDayLabel(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${month}/${day}`;
  }

  private formatWeekLabel(start: Date, end: Date): string {
    const startMonth = start.getMonth() + 1;
    const startDay = start.getDate();
    const endMonth = end.getMonth() + 1;
    const endDay = end.getDate();
    return `${startMonth}/${startDay} - ${endMonth}/${endDay}`;
  }

  private formatMonthLabel(date: Date): string {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${month}/${year}`;
  }

  private calculateTodayPosition(): void {
    const totalWidth = this.timelineColumns.reduce((sum, col) => sum + col.width, 0);
    const daysDiff = Math.floor((this.today.getTime() - this.timelineStartDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let position = 0;
    if (this.zoomLevel === 'day') {
      position = (daysDiff / this.timelineColumns.length) * totalWidth;
    } else if (this.zoomLevel === 'week') {
      const weeksDiff = Math.floor(daysDiff / 7);
      position = (weeksDiff / this.timelineColumns.length) * totalWidth;
    } else if (this.zoomLevel === 'month') {
      const monthsDiff = (this.today.getFullYear() - this.timelineStartDate.getFullYear()) * 12 +
        (this.today.getMonth() - this.timelineStartDate.getMonth());
      position = (monthsDiff / this.timelineColumns.length) * totalWidth;
    }
    
    this.todayPosition = position;
  }

  private scrollToToday(): void {
    if (this.timelineScroll) {
      const scrollContainer = this.timelineScroll.nativeElement;
      const scrollPosition = this.todayPosition - scrollContainer.clientWidth / 2;
      scrollContainer.scrollLeft = Math.max(0, scrollPosition);
    }
  }

  getTimelineWidth(): number {
    return this.timelineColumns.reduce((sum, col) => sum + col.width, 0);
  }

  /**
   * Calculate the pixel position of a date on the timeline
   */
  getDatePosition(date: Date): number {
    const dateTime = date.getTime();
    const startTime = this.timelineStartDate.getTime();
    const endTime = this.timelineEndDate.getTime();
    const totalWidth = this.getTimelineWidth();

    if (dateTime < startTime) return 0;
    if (dateTime > endTime) return totalWidth;

    const ratio = (dateTime - startTime) / (endTime - startTime);
    return ratio * totalWidth;
  }

  /**
   * Get the date from a pixel position on the timeline
   */
  getDateFromPosition(position: number): Date {
    const totalWidth = this.getTimelineWidth();
    const ratio = position / totalWidth;
    const timeDiff = this.timelineEndDate.getTime() - this.timelineStartDate.getTime();
    const dateTime = this.timelineStartDate.getTime() + (ratio * timeDiff);
    return new Date(dateTime);
  }

  onTimelineClick(event: MouseEvent, workCenterId: string): void {
    const timelineElement = (event.currentTarget as HTMLElement).closest('.timeline-row-content');
    if (!timelineElement) return;

    const rect = timelineElement.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickedDate = this.getDateFromPosition(clickX);
    
    // Only emit if clicking on empty space (not on a work order bar)
    const target = event.target as HTMLElement;
    if (!target.closest('.work-order-bar')) {
      this.createOrder.emit({ workCenterId, startDate: clickedDate });
    }
  }

  getWorkOrdersForCenter(workCenterId: string): WorkOrderDocument[] {
    return this.workOrders.filter(wo => wo.data.workCenterId === workCenterId);
  }

  onEditOrder(order: WorkOrderDocument): void {
    this.editOrder.emit(order);
  }

  onDeleteOrder(orderId: string): void {
    this.workOrderService.deleteWorkOrder(orderId);
    // Emit event for parent component if needed
    this.deleteOrder.emit(orderId);
  }
}
