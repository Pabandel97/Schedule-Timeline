import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WorkCenterDocument } from '../models/work-center.model';
import { SAMPLE_WORK_CENTERS } from '../../assets/data/sample-data';

@Injectable({
  providedIn: 'root'
})
export class WorkCenterService {
  private readonly STORAGE_KEY = 'workCenters';
  private workCentersSubject = new BehaviorSubject<WorkCenterDocument[]>(this.loadFromStorage());
  public workCenters$: Observable<WorkCenterDocument[]> = this.workCentersSubject.asObservable();

  constructor() {
    // Initialize with data from localStorage or sample data
    // Work centers are typically static, but we'll persist them anyway
    this.workCenters$.subscribe(centers => {
      this.saveToStorage(centers);
    });
  }

  private loadFromStorage(): WorkCenterDocument[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as WorkCenterDocument[];
        // Validate that it's an array
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to load work centers from localStorage:', error);
    }
    // Return sample data if localStorage is empty or invalid
    return SAMPLE_WORK_CENTERS;
  }

  private saveToStorage(centers: WorkCenterDocument[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(centers));
    } catch (error) {
      console.error('Failed to save work centers to localStorage:', error);
    }
  }

  getWorkCenters(): Observable<WorkCenterDocument[]> {
    return this.workCenters$;
  }

  getWorkCenterById(docId: string): WorkCenterDocument | undefined {
    return this.workCentersSubject.value.find(wc => wc.docId === docId);
  }
}
