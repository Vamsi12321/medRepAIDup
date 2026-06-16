# Visit Status Cards Implementation

## Overview
Added reusable **DoctorVisitStatusCard** component displaying doctor visit status ("Never visited", "Not visited", "Visited") with visit counts, similar to your design mockup.

## What Was Added

### 1. New Component: `components/DoctorVisitStatusCard.js`
A versatile card component with 3 variants:

#### **Variant: `compact`** (MR Visits Page)
- Shows doctor name, specialty, location
- Displays visit status badge (Never visited / Not visited / Visited)
- Shows visit progress bar (X visits / Y target)
- Shows sales index percentage
- Includes "Plan Visit" and "Details" action buttons
- Matches the design in your image

#### **Variant: `admin`** (Admin MCR & Medical Reps Pages)
- Expandable card with more details
- Shows visit stats grid (Visits, Target, Short)
- Displays class badge (A/B/C)
- Shows last visited date
- Includes location and sales index details

#### **Variant: `expanded`** (Default/Fallback)
- Minimal inline card display
- Quick view of doctor and visit status

---

## Changes to Pages

### 1. **MR Visits** (`/app/mr/visits/page.js`)
✅ **New Tabs Added:**
- 📅 Active & Upcoming (existing)
- ✅ **Visited Doctors** (NEW) - Shows doctors with visit_status = "visited"
- ❌ **Not Visited** (NEW) - Shows doctors with status = "not_visited" or "never_visited"
- 🕐 History (existing)

✅ **Doctor Status Calculation:**
```javascript
// Tracks for each assigned doctor:
- visit_count: number of completed visits
- visit_status: "visited" | "not_visited" | "never_visited"
- last_visited: timestamp of last completed visit
- target_visits: default 3 (can be customized)
```

✅ **UI:**
- Cards use `variant="compact"` to match your design
- Shows sales index score in circle
- Progress bar showing visit shortfall
- Action buttons for planning visits

---

### 2. **Admin Medical Reps Visits** (`/app/company/medical-reps/[mrId]/visits/page.js`)
✅ **View Mode Toggle:**
- 📋 All Visits (existing visits display)
- 👨‍⚕️ **Doctor Status** (NEW) - Shows doctor-centric view

✅ **Doctor Status View:**
- **Visited Section** - All doctors with completed visits
- **Not Visited Section** - Doctors never visited by this MR
- Uses `variant="admin"` cards with expandable details

---

### 3. **Admin SFE/MCR** (`/app/company/sfe/page.js`)
✅ **Updated MCRDetail Function:**
- Replaced old `AdminDoctorVisitCard` with `DoctorVisitStatusCard`
- Uses `variant="admin"` for expandable cards
- Shows **Visited** and **Not Visited** sections
- Each card displays visit stats when expanded

---

## Data Structure Expected

The component expects doctor objects with these fields:

```javascript
{
  id: "doc-123",
  doctor_name: "Dr. Name",
  name: "Dr. Name",
  specialty: "Cardiologist",
  location: "Banjara Hills",
  area: "Downtown",
  classification: "A", // or "B", "C"
  doctor_class: "A",
  visit_status: "not_visited", // "visited" | "not_visited" | "never_visited"
  visit_count: 2,
  total_visits: 2,
  target_visits: 3,
  required_visits: 3,
  last_visited: "2026-02-15T10:30:00Z",
  sales_index: 85, // 0-100
  rx_commitment_percentage: 85,
}
```

---

## CSS & Styling

✅ **Status Badges:**
- 🟢 **Visited**: `bg-emerald-50`, `text-emerald-700`, ✅ icon
- 🟠 **Not Visited**: `bg-orange-50`, `text-orange-700`, ⚠️ icon
- 🔴 **Never Visited**: `bg-red-50`, `text-red-700`, ❌ icon

✅ **Class Colors:**
- Class A: Red
- Class B: Blue
- Class C: Gray

✅ **Progress Bars:**
- Visit progress: Orange/Red (incomplete) → Green (complete)
- Sales index: Gray/Orange based on percentage

---

## Usage Example

### In MR Visits:
```jsx
<DoctorVisitStatusCard
  doctor={{
    doctor_name: "Dr. Sneha Reddy",
    specialty: "Cardiologist",
    visit_count: 1,
    target_visits: 4,
    visit_status: "not_visited",
    sales_index: 88,
  }}
  variant="compact"
  onPlanVisit={() => handlePlanVisit(doctor.id)}
  onViewDetails={() => showDetails(doctor.id)}
/>
```

### In Admin Views:
```jsx
<DoctorVisitStatusCard
  doctor={doctorData}
  variant="admin"
/>
```

---

## Next Steps (Optional Enhancements)

1. **Link Action Buttons:**
   - `onPlanVisit` → Opens visit scheduling modal
   - `onViewDetails` → Navigate to doctor profile

2. **Real Backend Integration:**
   - Ensure API returns `visit_status` field
   - Or calculate in component from visit history

3. **Filtering & Sorting:**
   - Filter by class (A/B/C)
   - Sort by last visited, shortfall count, etc.

4. **Mobile Responsiveness:**
   - Compact variant already optimized
   - Admin variant cards stack nicely on mobile

---

## Files Modified

- ✅ `components/DoctorVisitStatusCard.js` (NEW)
- ✅ `app/mr/visits/page.js`
- ✅ `app/company/medical-reps/[mrId]/visits/page.js`
- ✅ `app/company/sfe/page.js`

All changes are backward compatible and use React hooks (useState, useQuery).
