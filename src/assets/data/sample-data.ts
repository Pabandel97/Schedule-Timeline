import { WorkCenterDocument } from '../../app/models/work-center.model';
import { WorkOrderDocument } from '../../app/models/work-order.model';

export const SAMPLE_WORK_CENTERS: WorkCenterDocument[] = [
  {
    docId: 'wc_001',
    docType: 'workCenter',
    data: {
      name: 'Extrusion Line A'
    }
  },
  {
    docId: 'wc_002',
    docType: 'workCenter',
    data: {
      name: 'CNC Machine 1'
    }
  },
  {
    docId: 'wc_003',
    docType: 'workCenter',
    data: {
      name: 'Assembly Station'
    }
  },
  {
    docId: 'wc_004',
    docType: 'workCenter',
    data: {
      name: 'Quality Control'
    }
  },
  {
    docId: 'wc_005',
    docType: 'workCenter',
    data: {
      name: 'Packaging Line'
    }
  }
];

// Helper function to get date strings
const getDateString = (daysFromToday: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().split('T')[0];
};

export const SAMPLE_WORK_ORDERS: WorkOrderDocument[] = [
  // Extrusion Line A - Multiple orders
  {
    docId: 'wo_001',
    docType: 'workOrder',
    data: {
      name: 'Plastic Profile Batch #1234',
      workCenterId: 'wc_001',
      status: 'complete',
      startDate: getDateString(-10),
      endDate: getDateString(-5)
    }
  },
  {
    docId: 'wo_002',
    docType: 'workOrder',
    data: {
      name: 'Aluminum Extrusion #5678',
      workCenterId: 'wc_001',
      status: 'in-progress',
      startDate: getDateString(-3),
      endDate: getDateString(4)
    }
  },
  {
    docId: 'wo_003',
    docType: 'workOrder',
    data: {
      name: 'Steel Rod Production',
      workCenterId: 'wc_001',
      status: 'open',
      startDate: getDateString(5),
      endDate: getDateString(12)
    }
  },
  
  // CNC Machine 1
  {
    docId: 'wo_004',
    docType: 'workOrder',
    data: {
      name: 'Precision Machining Job A',
      workCenterId: 'wc_002',
      status: 'complete',
      startDate: getDateString(-7),
      endDate: getDateString(-2)
    }
  },
  {
    docId: 'wo_005',
    docType: 'workOrder',
    data: {
      name: 'Custom Component Fabrication',
      workCenterId: 'wc_002',
      status: 'blocked',
      startDate: getDateString(0),
      endDate: getDateString(7)
    }
  },
  
  // Assembly Station - Multiple orders
  {
    docId: 'wo_006',
    docType: 'workOrder',
    data: {
      name: 'Product Assembly Unit 1',
      workCenterId: 'wc_003',
      status: 'in-progress',
      startDate: getDateString(-5),
      endDate: getDateString(5)
    }
  },
  {
    docId: 'wo_007',
    docType: 'workOrder',
    data: {
      name: 'Product Assembly Unit 2',
      workCenterId: 'wc_003',
      status: 'open',
      startDate: getDateString(3),
      endDate: getDateString(10)
    }
  },
  
  // Quality Control
  {
    docId: 'wo_008',
    docType: 'workOrder',
    data: {
      name: 'Quality Inspection Batch 1',
      workCenterId: 'wc_004',
      status: 'complete',
      startDate: getDateString(-8),
      endDate: getDateString(-4)
    }
  },
  {
    docId: 'wo_009',
    docType: 'workOrder',
    data: {
      name: 'Quality Inspection Batch 2',
      workCenterId: 'wc_004',
      status: 'in-progress',
      startDate: getDateString(-1),
      endDate: getDateString(6)
    }
  },
  
  // Packaging Line
  {
    docId: 'wo_010',
    docType: 'workOrder',
    data: {
      name: 'Final Packaging Order #100',
      workCenterId: 'wc_005',
      status: 'open',
      startDate: getDateString(1),
      endDate: getDateString(8)
    }
  }
];
