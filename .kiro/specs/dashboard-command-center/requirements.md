# Requirements Document

## Introduction

Upgrade the existing Dashboard page from a minimal 4-KPI summary into a full operational command center for the Grand Vista Hotel management system. The command center consolidates real-time operational intelligence — occupancy, arrivals/departures, room status, housekeeping, maintenance, revenue, staff, guest intelligence, and alerts — into a single premium SaaS-quality page. All data is client-side mock data; no backend or API integration is required. The implementation uses the existing React + TypeScript + Vite stack, existing CSS design system variables, and existing component patterns (stat-card, toolbar-card, table-card, filter-pill, pill-status, avatar-cell, etc.).

## Glossary

- **Dashboard**: The main landing page of the hotel management application, rendered at the `/` route inside `Layout.tsx`
- **KPI_Card**: A compact metric display component showing a label, primary value, and optional trend indicator or sub-breakdown
- **Room_Status_Map**: A visual grid of room tiles organized by floor, color-coded by occupancy status
- **Activity_Feed**: A timestamped, filterable list of hotel operational events (check-ins, check-outs, payments, maintenance)
- **Check_In_Panel**: A list widget showing upcoming guest arrivals with reservation details and action buttons
- **Housekeeping_Widget**: A summary widget displaying room cleaning readiness counts and priority items
- **Maintenance_Tracker**: A list widget showing open maintenance issues with room, priority, and time reported
- **Revenue_Panel**: A financial intelligence widget showing revenue figures, recent payments, and outstanding billing
- **Staff_Panel**: A widget showing staff currently on duty grouped by role, with shift coverage status
- **Guest_Intelligence_Panel**: A widget highlighting VIP arrivals, repeat guests, and guests requiring attention
- **Alerts_Center**: A widget surfacing operational exceptions and risks requiring immediate staff action
- **Quick_Actions_Bar**: A set of shortcut buttons for the most common hotel operations
- **Mock_Data_Module**: The `src/data/mockData.ts` file that provides all client-side data for the application
- **Design_System**: The CSS custom properties defined in `src/index.css` and shared component classes in `src/styles/modules.css`

## Requirements

### Requirement 1: Executive KPI Cards Row

**User Story:** As a hotel operations manager, I want to see six key performance indicators at the top of the dashboard, so that I can assess the hotel's current operational state at a glance.

#### Acceptance Criteria

1. THE Dashboard SHALL display exactly six KPI_Card components in a single responsive row at the top of the page.
2. THE first KPI_Card SHALL display the label "Occupancy Rate" and the value calculated as (occupied rooms / total rooms × 100), formatted as a percentage.
3. THE second KPI_Card SHALL display the label "Available Rooms" and the count of rooms with status "Available", with a sub-breakdown showing counts by room type (Standard, Deluxe, Suite).
4. THE third KPI_Card SHALL display the label "Arrivals Today" and the count of reservations with a check-in date matching today's date and a status of "Confirmed" or "Pending".
5. THE fourth KPI_Card SHALL display the label "Departures Today" and the count of reservations with a check-out date matching today's date and a status of "Checked-in".
6. THE fifth KPI_Card SHALL display the label "Revenue Today" and the sum of invoice amounts with status "Paid" and a date matching today's date, formatted as currency.
7. THE sixth KPI_Card SHALL display the label "Pending Invoices" and the count of invoices with status "Pending", with a sub-indicator showing the total outstanding amount.
8. THE KPI row SHALL use the existing `stat-card` CSS class pattern from the Design_System and adapt the grid to six columns.

### Requirement 2: Today's Activity Feed

**User Story:** As a front desk agent, I want to see a timestamped feed of today's hotel events, so that I can stay aware of recent operational activity without switching modules.

#### Acceptance Criteria

1. THE Dashboard SHALL display an Activity_Feed widget containing a list of timestamped event entries sourced from the Mock_Data_Module.
2. EACH Activity_Feed entry SHALL display the event time, event type icon, descriptive message, and a status indicator.
3. THE Activity_Feed SHALL display filter pills with the categories: All, Check-ins, Check-outs, Payments, Maintenance.
4. WHEN a user selects a filter pill, THE Activity_Feed SHALL display only events matching the selected category.
5. WHEN the "All" filter pill is selected, THE Activity_Feed SHALL display all events regardless of category.
6. THE Activity_Feed SHALL use the existing `filter-pill` CSS class pattern from the Design_System.

### Requirement 3: Upcoming Check-ins Panel

**User Story:** As a front desk agent, I want to see a list of upcoming guest arrivals with their reservation details, so that I can prepare for check-ins and take action directly from the dashboard.

#### Acceptance Criteria

1. THE Dashboard SHALL display a Check_In_Panel listing reservations with status "Confirmed" or "Pending" and a check-in date of today or in the future.
2. EACH Check_In_Panel entry SHALL display the guest name, room type, check-in date, and payment status.
3. EACH Check_In_Panel entry SHALL display a status chip indicating one of: Confirmed, Awaiting Arrival, Pending.
4. EACH Check_In_Panel entry SHALL provide a "View" action button that navigates to the Reservations page.
5. THE Check_In_Panel SHALL use the existing `pill-status` and `avatar-cell` CSS class patterns from the Design_System.

### Requirement 4: Room Status Map

**User Story:** As a hotel operations manager, I want to see a visual floor-by-floor grid of all rooms color-coded by status, so that I can quickly identify room availability and issues across the property.

#### Acceptance Criteria

1. THE Dashboard SHALL display a Room_Status_Map widget showing all rooms from the Mock_Data_Module organized by floor.
2. THE Room_Status_Map SHALL group rooms into floor sections, each with a floor label header.
3. EACH room tile SHALL display the room number and a color-coded background indicating status: green for Available, red for Occupied, amber for Reserved, gray for Maintenance.
4. WHEN a room has status "Occupied", THE room tile SHALL display the initials of the assigned guest.
5. THE Room_Status_Map SHALL display a legend mapping each color to its corresponding room status.
6. THE Room_Status_Map SHALL use the existing Design_System color variables: `--status-green` for Available, `--status-rose` for Occupied, `--status-amber` for Reserved, and `--text-light` for Maintenance.

### Requirement 5: Housekeeping Readiness Widget

**User Story:** As a housekeeping supervisor, I want to see a summary of room cleaning status, so that I can prioritize cleaning assignments and ensure rooms are ready for arriving guests.

#### Acceptance Criteria

1. THE Dashboard SHALL display a Housekeeping_Widget showing counts for four categories: Rooms Ready, Awaiting Cleaning, Cleaning In Progress, and Reserved Not Ready.
2. THE Housekeeping_Widget SHALL derive readiness data from room statuses and reservation data in the Mock_Data_Module, supplemented by new mock housekeeping data.
3. THE Housekeeping_Widget SHALL highlight priority items where a reserved room is not yet marked as ready.
4. THE Housekeeping_Widget SHALL use the existing `stat-card` CSS class pattern for the count displays.

### Requirement 6: Maintenance Tracker

**User Story:** As a facilities manager, I want to see a list of open maintenance issues with priority levels, so that I can track repairs and understand which rooms are blocked from sale.

#### Acceptance Criteria

1. THE Dashboard SHALL display a Maintenance_Tracker widget listing all open maintenance issues from the Mock_Data_Module.
2. EACH Maintenance_Tracker entry SHALL display the room number, issue description, priority level (High, Medium, Low), and time reported.
3. THE Maintenance_Tracker SHALL display a summary header showing the count of open issues and the count of rooms blocked from sale due to maintenance.
4. THE Maintenance_Tracker SHALL visually distinguish High priority items using the `--status-rose` color from the Design_System.
5. THE Mock_Data_Module SHALL be extended with a `MAINTENANCE_ISSUES` array containing at least three maintenance issue records with fields: id, room, issue, priority, reportedAt, and status.

### Requirement 7: Revenue and Billing Intelligence

**User Story:** As a hotel general manager, I want to see a financial summary including today's revenue, monthly revenue, outstanding balances, and recent payment activity, so that I can monitor the hotel's financial health from the dashboard.

#### Acceptance Criteria

1. THE Dashboard SHALL display a Revenue_Panel widget with three summary figures: Revenue Today, Revenue This Month, and Outstanding Amount.
2. THE Revenue_Panel SHALL display a list of recent payments showing invoice ID, guest name, amount, and date, sourced from invoices with status "Paid" in the Mock_Data_Module.
3. THE Revenue_Panel SHALL display a list of outstanding invoices showing invoice ID, guest name, amount, and date, sourced from invoices with status "Pending" in the Mock_Data_Module.
4. THE Revenue_Panel SHALL display a billing health percentage calculated as (paid invoices amount / total invoices amount × 100).
5. THE Revenue_Panel SHALL use the existing `pill-status` CSS class pattern to indicate Paid and Pending statuses.

### Requirement 8: Staff on Duty Panel

**User Story:** As a hotel operations manager, I want to see which staff members are currently on duty grouped by role, so that I can assess shift coverage and identify staffing gaps.

#### Acceptance Criteria

1. THE Dashboard SHALL display a Staff_Panel widget listing staff members with status "On Duty" from the staff data, grouped by role.
2. EACH Staff_Panel entry SHALL display the staff member name, role, and current shift.
3. THE Staff_Panel SHALL display a shift coverage summary showing the count of on-duty staff per role.
4. IF a role has zero on-duty staff members, THEN THE Staff_Panel SHALL display a warning indicator for that role.
5. THE Staff_Panel SHALL use the existing `avatar-cell` CSS class pattern for staff member display.

### Requirement 9: Guest Intelligence Panel

**User Story:** As a front desk manager, I want to see highlighted guest information including VIP arrivals, repeat guests, and guests with outstanding balances, so that I can provide personalized service and address billing issues proactively.

#### Acceptance Criteria

1. THE Dashboard SHALL display a Guest_Intelligence_Panel widget with three sections: VIP/Repeat Guests, Guests with Unpaid Balances, and Recent Guest Activity.
2. THE Guest_Intelligence_Panel SHALL identify repeat guests as guests with a stay count of 3 or more from the Mock_Data_Module.
3. THE Guest_Intelligence_Panel SHALL identify guests with unpaid balances by cross-referencing guest names with pending invoices in the Mock_Data_Module.
4. EACH guest entry SHALL display the guest name, total stays, total spent, and outstanding balance if applicable.
5. THE Guest_Intelligence_Panel SHALL use the existing `avatar-cell` and `pill-status` CSS class patterns from the Design_System.

### Requirement 10: Alerts and Exceptions Center

**User Story:** As a hotel operations manager, I want to see a consolidated list of operational alerts and exceptions, so that I can address issues before they impact guest experience or revenue.

#### Acceptance Criteria

1. THE Dashboard SHALL display an Alerts_Center widget listing operational exceptions derived from cross-referencing data in the Mock_Data_Module.
2. THE Alerts_Center SHALL detect and display alerts for: rooms with status "Reserved" that are under maintenance, invoices with status "Pending" past their expected payment date, and rooms under maintenance that reduce available inventory.
3. EACH alert entry SHALL display an alert severity icon, a descriptive message, and the affected room or guest reference.
4. THE Alerts_Center SHALL sort alerts by severity with the most critical alerts displayed first.
5. THE Alerts_Center SHALL use the `--status-rose` color for critical alerts and `--status-amber` color for warning alerts from the Design_System.

### Requirement 11: Quick Actions Bar

**User Story:** As a front desk agent, I want shortcut buttons for common operations like creating a reservation or checking in a guest, so that I can perform frequent tasks without navigating away from the dashboard.

#### Acceptance Criteria

1. THE Dashboard SHALL display a Quick_Actions_Bar containing shortcut buttons for: New Reservation, Check In Guest, Check Out Guest, Mark Invoice Paid, and Report Maintenance.
2. WHEN a user clicks the "New Reservation" quick action, THE Dashboard SHALL navigate to the Reservations page.
3. WHEN a user clicks the "Check In Guest" quick action, THE Dashboard SHALL navigate to the Reservations page.
4. WHEN a user clicks the "Check Out Guest" quick action, THE Dashboard SHALL navigate to the Reservations page.
5. WHEN a user clicks the "Mark Invoice Paid" quick action, THE Dashboard SHALL navigate to the Billing page.
6. WHEN a user clicks the "Report Maintenance" quick action, THE Dashboard SHALL navigate to the Rooms page.
7. THE Quick_Actions_Bar SHALL use the existing `btn-primary` and `btn-secondary` CSS class patterns from the Design_System.
8. EACH quick action button SHALL display an icon from the lucide-react icon library alongside its label.

### Requirement 12: Dashboard Layout Structure

**User Story:** As a hotel staff member, I want the dashboard to be organized into clear visual zones with intentional hierarchy, so that I can find the information I need without excessive scrolling or confusion.

#### Acceptance Criteria

1. THE Dashboard SHALL organize widgets into the following vertical zones in order: KPI Cards Row, Operations Row (Check-in Panel, Activity Feed, Alerts Center), Visual Operations Zone (Room Status Map, Housekeeping Widget, Maintenance Tracker), Commercial Intelligence Row (Revenue Panel), Staff and Guest Intelligence Row (Staff Panel, Guest Intelligence Panel), and Quick Actions Bar.
2. THE Dashboard SHALL use CSS Grid or Flexbox layouts to arrange widgets side-by-side within each zone where appropriate.
3. THE Dashboard SHALL render within the existing `Layout.tsx` wrapper without modifying the Layout component.
4. THE Dashboard SHALL apply the `animate-in` CSS class for page entry animation consistent with other pages.
5. THE Dashboard SHALL maintain consistent spacing using the existing Design_System gap and padding values.
6. THE Dashboard SHALL use the existing `module-page` CSS class as the root container.

### Requirement 13: Mock Data Extension

**User Story:** As a developer, I want the mock data module to contain sufficient data to populate all dashboard widgets, so that the command center displays realistic operational information.

#### Acceptance Criteria

1. THE Mock_Data_Module SHALL be extended with a `RESERVATIONS` array containing at least six reservation records with fields: id, guest, room, checkin, checkout, total, status, and paymentStatus.
2. THE Mock_Data_Module SHALL be extended with a `STAFF` array containing at least five staff records with fields: id, name, role, shift, status, rating, and email.
3. THE Mock_Data_Module SHALL be extended with a `MAINTENANCE_ISSUES` array containing at least three records with fields: id, room, issue, priority, reportedAt, and status.
4. THE Mock_Data_Module SHALL be extended with a `HOUSEKEEPING` array containing room readiness records with fields: room, status (Ready, Awaiting Cleaning, In Progress, Not Ready), and priority.
5. THE existing `ACTIVITY_FEED` array SHALL be extended to contain at least eight entries covering all event types: check-in, check-out, payment, and maintenance.
6. THE existing `GUESTS` array SHALL be extended to contain at least six guest records to support the Guest Intelligence Panel.
7. THE existing `INVOICES` array SHALL be extended to contain at least six invoice records with varied statuses and dates to support the Revenue Panel.
8. ALL new mock data SHALL be consistent with existing data (room IDs reference existing rooms, guest names cross-reference between arrays).

### Requirement 14: Design System Compliance

**User Story:** As a developer, I want the dashboard to use the existing design system consistently, so that the command center feels visually cohesive with the rest of the application.

#### Acceptance Criteria

1. THE Dashboard SHALL use CSS custom properties from `src/index.css` for all colors, spacing, border-radius, and shadow values.
2. THE Dashboard SHALL use existing component CSS classes from `src/styles/modules.css` (stat-card, toolbar-card, table-card, filter-pill, pill-status, avatar-cell, btn-primary, btn-secondary) wherever applicable.
3. THE Dashboard SHALL define new widget-specific styles in `src/pages/Dashboard.css` following the naming conventions established in the existing CSS files.
4. THE Dashboard SHALL use icons exclusively from the `lucide-react` icon library.
5. THE Dashboard SHALL maintain the premium SaaS visual quality with clean spacing, intentional hierarchy, and consistent typography using the Manrope font family.
