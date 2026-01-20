import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WorkOrderDocument } from '../models/work-order.model';
import { SAMPLE_WORK_ORDERS } from '../../assets/data/sample-data';

@Injectable({
  providedIn: 'root'
})
export class WorkOrderService {
  private readonly STORAGE_KEY = 'workOrders';
  private workOrdersSubject = new BehaviorSubject<WorkOrderDocument[]>(this.loadFromStorage());
  public workOrders$: Observable<WorkOrderDocument[]> = this.workOrdersSubject.asObservable();

  constructor() {
    // Initialize with data from localStorage or sample data
    // Subscribe to changes and persist to localStorage
    this.workOrders$.subscribe(orders => {
      this.saveToStorage(orders);
    });
  }

  private loadFromStorage(): WorkOrderDocument[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as WorkOrderDocument[];
        // Validate that it's an array
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to load work orders from localStorage:', error);
    }
    // Return sample data if localStorage is empty or invalid
    return SAMPLE_WORK_ORDERS;
  }

  private saveToStorage(orders: WorkOrderDocument[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error('Failed to save work orders to localStorage:', error);
    }
  }

  getWorkOrders(): Observable<WorkOrderDocument[]> {
    return this.workOrders$;
  }

  getWorkOrderById(docId: string): WorkOrderDocument | undefined {
    return this.workOrdersSubject.value.find(wo => wo.docId === docId);
  }

  getWorkOrdersByWorkCenter(workCenterId: string): WorkOrderDocument[] {
    return this.workOrdersSubject.value.filter(wo => wo.data.workCenterId === workCenterId);
  }

  /**
   * Check if a date range overlaps with existing work orders on the same work center
   * @param workCenterId - The work center to check
   * @param startDate - Start date in ISO format
   * @param endDate - End date in ISO format
   * @param excludeOrderId - Optional order ID to exclude from overlap check (for edit scenarios)
   * @returns true if overlap detected, false otherwise
   */
  checkOverlap(
    workCenterId: string,
    startDate: string,
    endDate: string,
    excludeOrderId?: string
  ): boolean {
    const orders = this.getWorkOrdersByWorkCenter(workCenterId);
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (const order of orders) {
      // Skip the order being edited
      if (excludeOrderId && order.docId === excludeOrderId) {
        continue;
      }

      const orderStart = new Date(order.data.startDate);
      const orderEnd = new Date(order.data.endDate);

      // Two date ranges overlap if: order1.start < order2.end && order1.end > order2.start
      if (start < orderEnd && end > orderStart) {
        return true;
      }
    }

    return false;
  }

  createWorkOrder(order: Omit<WorkOrderDocument, 'docId' | 'docType'>): { success: boolean; error?: string } {
    // Validate overlap
    if (this.checkOverlap(order.data.workCenterId, order.data.startDate, order.data.endDate)) {
      return { success: false, error: 'Work order overlaps with an existing order on this work center' };
    }

    // Generate new docId
    const newOrder: WorkOrderDocument = {
      docId: this.generateDocId(),
      docType: 'workOrder',
      data: order.data
    };

    const currentOrders = this.workOrdersSubject.value;
    const updatedOrders = [...currentOrders, newOrder];
    this.workOrdersSubject.next(updatedOrders);
    return { success: true };
  }

  updateWorkOrder(docId: string, orderData: Partial<WorkOrderDocument['data']>): { success: boolean; error?: string } {
    const currentOrders = this.workOrdersSubject.value;
    const orderIndex = currentOrders.findIndex(wo => wo.docId === docId);

    if (orderIndex === -1) {
      return { success: false, error: 'Work order not found' };
    }

    const existingOrder = currentOrders[orderIndex];
    const updatedData = { ...existingOrder.data, ...orderData };

    // Validate overlap (excluding current order)
    if (updatedData.startDate && updatedData.endDate && updatedData.workCenterId) {
      if (this.checkOverlap(updatedData.workCenterId, updatedData.startDate, updatedData.endDate, docId)) {
        return { success: false, error: 'Work order overlaps with an existing order on this work center' };
      }
    }

    const updatedOrder: WorkOrderDocument = {
      ...existingOrder,
      data: updatedData
    };

    const newOrders = [...currentOrders];
    newOrders[orderIndex] = updatedOrder;
    this.workOrdersSubject.next(newOrders);
    return { success: true };
  }

  deleteWorkOrder(docId: string): void {
    const currentOrders = this.workOrdersSubject.value;
    const filteredOrders = currentOrders.filter(wo => wo.docId !== docId);
    this.workOrdersSubject.next(filteredOrders);
  }

  private generateDocId(): string {
    return `wo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
