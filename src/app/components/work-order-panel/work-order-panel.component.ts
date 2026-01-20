import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { WorkOrderDocument, WorkOrderStatus } from '../../models/work-order.model';
import { WorkOrderService } from '../../services/work-order.service';
import { WorkCenterService } from '../../services/work-center.service';
import { WorkCenterDocument } from '../../models/work-center.model';

export interface PanelData {
  workCenterId: string;
  startDate: Date;
}

@Component({
  selector: 'app-work-order-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbDatepickerModule, NgSelectModule],
  templateUrl: './work-order-panel.component.html',
  styleUrl: './work-order-panel.component.scss'
})
export class WorkOrderPanelComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() editOrder: WorkOrderDocument | null = null;
  @Input() createData: PanelData | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  workOrderForm!: FormGroup;
  workCenters: WorkCenterDocument[] = [];
  isEditMode = false;
  overlapError = '';

  statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'complete', label: 'Complete' },
    { value: 'blocked', label: 'Blocked' }
  ];

  constructor(
    private workOrderService: WorkOrderService,
    private workCenterService: WorkCenterService
  ) {}

  ngOnInit(): void {
    this.workCenterService.getWorkCenters().subscribe(centers => {
      this.workCenters = centers;
    });

    this.initializeForm();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      this.initializeForm();
    }
  }

  initializeForm(): void {
    this.isEditMode = !!this.editOrder;
    this.overlapError = '';

    let workCenterId = '';
    let name = '';
    let status: WorkOrderStatus = 'open';
    let startDate: NgbDateStruct | null = null;
    let endDate: NgbDateStruct | null = null;

    if (this.isEditMode && this.editOrder) {
      // Edit mode - populate with existing data
      workCenterId = this.editOrder.data.workCenterId;
      name = this.editOrder.data.name;
      status = this.editOrder.data.status;
      const start = new Date(this.editOrder.data.startDate);
      startDate = { year: start.getFullYear(), month: start.getMonth() + 1, day: start.getDate() };
      const end = new Date(this.editOrder.data.endDate);
      endDate = { year: end.getFullYear(), month: end.getMonth() + 1, day: end.getDate() };
    } else if (this.createData) {
      // Create mode - pre-fill from click position
      workCenterId = this.createData.workCenterId;
      const clickedDate = this.createData.startDate;
      startDate = { year: clickedDate.getFullYear(), month: clickedDate.getMonth() + 1, day: clickedDate.getDate() };
      // End date = start date + 7 days
      const endDateObj = new Date(clickedDate);
      endDateObj.setDate(endDateObj.getDate() + 7);
      endDate = { year: endDateObj.getFullYear(), month: endDateObj.getMonth() + 1, day: endDateObj.getDate() };
    }

    this.workOrderForm = new FormGroup({
      workCenterId: new FormControl(workCenterId, [Validators.required]),
      name: new FormControl(name, [Validators.required]),
      status: new FormControl(status, [Validators.required]),
      startDate: new FormControl(startDate, [Validators.required]),
      endDate: new FormControl(endDate, [Validators.required])
    });

    // Add custom validator for end date after start date
    this.workOrderForm.addValidators(this.dateRangeValidator);
  }

  private readonly dateRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    // This validator is attached to the FormGroup, but Angular types it as AbstractControl
    if (!(control instanceof FormGroup)) {
      return null;
    }

    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;

    if (!startDate || !endDate) {
      return null;
    }

    const start = new Date(startDate.year, startDate.month - 1, startDate.day);
    const end = new Date(endDate.year, endDate.month - 1, endDate.day);

    if (end <= start) {
      return { dateRange: true };
    }

    return null;
  };

  onBackdropClick(): void {
    this.close.emit();
  }

  onPanelClick(event: Event): void {
    event.stopPropagation();
  }

  onCancel(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.workOrderForm.invalid) {
      this.markFormGroupTouched(this.workOrderForm);
      return;
    }

    const formValue = this.workOrderForm.value;
    const startDate = new Date(formValue.startDate.year, formValue.startDate.month - 1, formValue.startDate.day);
    const endDate = new Date(formValue.endDate.year, formValue.endDate.month - 1, formValue.endDate.day);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    if (this.isEditMode && this.editOrder) {
      // Update existing order
      const result = this.workOrderService.updateWorkOrder(this.editOrder.docId, {
        name: formValue.name,
        workCenterId: formValue.workCenterId,
        status: formValue.status,
        startDate: startDateStr,
        endDate: endDateStr
      });

      if (result.success) {
        this.saved.emit();
        this.close.emit();
      } else {
        this.overlapError = result.error || 'Failed to update work order';
      }
    } else {
      // Create new order
      const result = this.workOrderService.createWorkOrder({
        data: {
          name: formValue.name,
          workCenterId: formValue.workCenterId,
          status: formValue.status,
          startDate: startDateStr,
          endDate: endDateStr
        }
      });

      if (result.success) {
        this.saved.emit();
        this.close.emit();
      } else {
        this.overlapError = result.error || 'Failed to create work order';
      }
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get workCenterOptions() {
    return this.workCenters.map(wc => ({
      value: wc.docId,
      label: wc.data.name
    }));
  }
}
