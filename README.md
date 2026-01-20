# Work Order Schedule Timeline

An interactive timeline component for visualizing and managing work orders across multiple work centers in a manufacturing ERP system.

## Overview

This Angular 18 application provides a comprehensive work order scheduling interface with:
- Interactive timeline with Day/Week/Month zoom levels
- Visual work order bars with status indicators
- Create and edit work orders via slide-out panel
- Overlap detection to prevent scheduling conflicts
- Real-time updates using RxJS reactive patterns

## Features

### Timeline Grid
- **Fixed left panel** displaying work center names
- **Horizontally scrollable timeline** showing date columns
- **Three zoom levels**: Day, Week, and Month views
- **Current day indicator** (red vertical line) showing today's date
- **Row hover states** for better UX

### Work Order Bars
- **Visual representation** of work orders as horizontal bars
- **Status badges** with color coding:
  - 🔵 **Open** (Blue)
  - 🟣 **In Progress** (Purple)
  - 🟢 **Complete** (Green)
  - 🟡 **Blocked** (Yellow/Orange)
- **Three-dot menu** with Edit and Delete options
- **Automatic positioning** based on start/end dates

### Create/Edit Panel
- **Slide-in animation** from the right
- **Reactive form** with validation:
  - Work Center selection (required)
  - Work Order Name (required)
  - Status dropdown (required)
  - Start Date picker (required, pre-filled from click position)
  - End Date picker (required, must be after start date)
- **Overlap detection** prevents scheduling conflicts
- **Error messages** for validation failures

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Angular CLI 18+

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   ng serve
   ```

3. **Open your browser:**
   Navigate to `http://localhost:4200`

### Building for Production

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

```
src/
├── app/
│   ├── models/              # TypeScript interfaces
│   │   ├── work-center.model.ts
│   │   └── work-order.model.ts
│   ├── services/            # Business logic and state management
│   │   ├── work-center.service.ts
│   │   └── work-order.service.ts
│   ├── components/
│   │   ├── timeline/        # Main timeline component
│   │   ├── work-order-bar/  # Work order bar component
│   │   └── work-order-panel/ # Create/edit panel component
│   └── app.component.ts      # Root component
├── assets/
│   └── data/
│       └── sample-data.ts   # Sample work centers and orders
└── styles.scss              # Global styles
```

## Architecture

### State Management

The application uses **Angular services with RxJS BehaviorSubject** for reactive state management:

- `WorkCenterService`: Manages work centers data
- `WorkOrderService`: Manages work orders with CRUD operations and overlap detection

This approach provides:
- Simple, lightweight state management
- Reactive updates across components
- No external dependencies (no NgRx overhead)

### Component Architecture

All components are **standalone** (Angular 18 best practice), making them:
- Self-contained and reusable
- Easier to test
- More modular

### Key Algorithms

#### Overlap Detection
```typescript
// Two date ranges overlap if:
// order1.start < order2.end && order1.end > order2.start
// Check all orders on same work center, exclude current order if editing
```

#### Timeline Positioning
```typescript
// Calculate bar left position: (startDate - timelineStart) / totalDays * width
// Calculate bar width: (endDate - startDate) / totalDays * width
// Adjust for zoom level (Day/Week/Month column widths)
```

## Libraries Used

### Core Dependencies

- **@angular/core** (v18): Angular framework
- **rxjs**: Reactive programming for state management
- **@angular/forms**: Reactive forms with validation

### UI Libraries

- **@ng-select/ng-select**: Dropdown/select components
  - Used for: Status and Work Center selection
  - Why: Provides better UX than native select elements

- **@ng-bootstrap/ng-bootstrap**: Bootstrap components for Angular
  - Used for: Date picker (ngb-datepicker)
  - Why: Accessible, feature-rich date selection

- **bootstrap**: CSS framework
  - Used for: Base styling and utilities
  - Why: Required by ng-bootstrap, provides consistent styling

### Font

- **Circular Std**: Custom font family
  - Loaded from: `https://naologic-com-assets.naologic.com/fonts/circular-std/circular-std.css`
  - Used throughout the application for consistent typography

## Usage

### Creating a Work Order

1. Click on an empty area of a work center row in the timeline
2. The create panel slides in from the right
3. Fill in the form fields:
   - Work Center (pre-selected based on row clicked)
   - Work Order Name
   - Status (defaults to "Open")
   - Start Date (pre-filled from click position)
   - End Date (defaults to Start Date + 7 days)
4. Click "Create" to save
5. If there's an overlap, an error message will be displayed

### Editing a Work Order

1. Click the three-dot menu (⋯) on a work order bar
2. Select "Edit" from the dropdown
3. The edit panel opens with pre-populated data
4. Make changes and click "Save"
5. Overlap validation excludes the current order being edited

### Deleting a Work Order

1. Click the three-dot menu (⋯) on a work order bar
2. Select "Delete" from the dropdown
3. The work order is immediately removed

### Changing Zoom Level

1. Use the "Timescale" dropdown in the header
2. Select Day, Week, or Month view
3. The timeline automatically adjusts column widths and date ranges

## Sample Data

The application includes sample data demonstrating:
- 5 work centers (Extrusion Line A, CNC Machine 1, Assembly Station, Quality Control, Packaging Line)
- 10 work orders with:
  - All 4 status types represented
  - Multiple orders on the same work center (non-overlapping)
  - Orders spanning different date ranges

## Development Notes

### Date Handling

- Dates are stored in ISO format (YYYY-MM-DD) in the data model
- Date pickers use NgbDateStruct for user input
- Conversion happens in the panel component before saving

### Overlap Detection

The overlap detection algorithm:
1. Filters orders by work center
2. Excludes the order being edited (if applicable)
3. Checks if date ranges overlap using: `start1 < end2 && end1 > start2`
4. Returns an error if overlap is detected

### Timeline Calculations

- **Day view**: Shows ±14 days from today
- **Week view**: Shows ±4 weeks from today
- **Month view**: Shows ±6 months from today
- Column widths are fixed per zoom level (80px, 120px, 150px)

## Future Enhancements

Potential improvements (marked with `@upgrade` comments in code):
- localStorage persistence for work orders
- Automated test suite (unit and e2e tests)
- Smooth animations/transitions
- Keyboard navigation
- Drag-and-drop to reschedule orders
- Bulk operations
- Export/import functionality
- User authentication and permissions

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is a technical test implementation.

## Author

Built as a technical assessment for a manufacturing ERP system.
