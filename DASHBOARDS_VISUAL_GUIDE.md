# Dashboard Visual Guide & UX Flow

## 📐 Dashboard Layout Structure

### Standard Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│                        HEADER                                │
│  Admin Dashboard                                             │
│  Manage users, moderators, and platform health              │
└─────────────────────────────────────────────────────────────┘
┌─────────┬─────────────────────────────────────────────────────┐
│ SIDEBAR │                    MAIN CONTENT                     │
│         │                                                     │
│ • Users │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐│
│ • Mods  │  │ Stat 1   │ │ Stat 2   │ │ Stat 3   │ │Stat 4 ││
│ • Reqs  │  └──────────┘ └──────────┘ └──────────┘ └────────┘│
│         │                                                     │
│         │  ┌─────────────────────────────────────────────────┐│
│         │  │ [Users] [Mods] [Requests]                      ││
│         │  ├─────────────────────────────────────────────────┤│
│         │  │ Search: [           ] Filter [Status ▼]        ││
│         │  ├─────────────────────────────────────────────────┤│
│         │  │ Column1  Column2  Column3  Column4    Actions  ││
│         │  │ ─────────────────────────────────────────────── ││
│         │  │ Row 1    Data     Data     Data        [Menu]  ││
│         │  │ Row 2    Data     Data     Data        [Menu]  ││
│         │  │ Row 3    Data     Data     Data        [Menu]  ││
│         │  │ ─────────────────────────────────────────────── ││
│         │  │ Prev [1][2][3] Next                            ││
│         │  └─────────────────────────────────────────────────┘│
└─────────┴─────────────────────────────────────────────────────┘
```

## 🎨 Color Palette

### Status Badges

```
✅ APPROVED / ACTIVE
   Background: #DCFCE7 (emerald-100)
   Text:       #047857 (emerald-700)

⏳ PENDING
   Background: #FEF3C7 (amber-100)
   Text:       #D97706 (amber-700)

❌ REJECTED / INACTIVE / DANGER
   Background: #FEE2E2 (red-100)
   Text:       #DC2626 (red-700)

ℹ️ PRIMARY / INFO
   Background: #DBEAFE (blue-100)
   Text:       #2563EB (blue-700)
```

## 📊 Admin Dashboard UX Flow

### User Management Flow

```
┌─────────────────────┐
│  Visit Dashboard    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  See Stats Grid     │
│ (4 KPI Cards)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Click Users Tab    │
└──────────┬──────────┘
           │
      ┌────┴────┐
      │          │
      ▼          ▼
  [Search]   [Filter]
      │          │
      └────┬─────┘
           │
           ▼
    ┌─────────────┐
    │ See Results │
    └──────┬──────┘
           │
      ┌────┴──────────┐
      │               │
      ▼               ▼
  [Click Row]    [Click Menu]
      │               │
      ▼               ▼
  [Detail Panel] [Activate/Delete]
      │               │
      └───────┬───────┘
              │
              ▼
        [Confirm Action]
              │
              ▼
        [Toast: Success]
```

## 📋 Moderator Dashboard UX Flow

### Submission Review Flow

```
┌──────────────────────┐
│  Moderator Dashboard │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  See Pending Count   │
│  (e.g., 5 items)     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Click Submissions Tab│
└──────────┬───────────┘
           │
      ┌────┴────┐
      │          │
      ▼          ▼
  [Search]   [Filter by Type]
      │          │
      └────┬─────┘
           │
           ▼
    ┌─────────────┐
    │ See Queue   │
    └──────┬──────┘
           │
      ┌────┴──────────┐
      │               │
      ▼               ▼
  [Click Row]    [See Preview]
      │
      ▼
  [Detail Panel Opens]
      │
   ┌──┴──┐
   │     │
   ▼     ▼
[Approve] [Reject]
   │        │
   │        ▼
   │    [Rejection Modal]
   │    [Enter Reason]
   │        │
   ▼        ▼
[Success Toast]
```

## 📱 User Dashboard UX Flow

### Content Upload Flow

```
┌──────────────────────┐
│   User Dashboard     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   See Stats & Grid   │
│ (Notes, PYQs, Etc)   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  See Quick Uploads   │
│  (3 Cards)           │
└──────────┬───────────┘
           │
      ┌────┴────┬────┐
      │          │    │
      ▼          ▼    ▼
  [Notes]  [PYQs] [Syllabus]
      │          │    │
      └────┬─────┴────┘
           │
           ▼
    [Form Modal Opens]
           │
      ┌────┴────┐
      │          │
      ▼          ▼
  [Fill Form] [Upload File]
      │
      ▼
  [Submit]
      │
      ▼
  [Success Toast]
      │
      ▼
  [Modal Closes]
      │
      ▼
  [Content Appears in Library]
```

## 🎯 State Badges & Icons

### Status Indicator System

```
┌────────────────────────────────────────┐
│ Status Badge Components                │
├────────────────────────────────────────┤
│                                        │
│ Active/Approved:                       │
│ [✓ ACTIVE]  or  [✓ APPROVED]          │
│                                        │
│ Pending:                               │
│ [⏳ PENDING]                            │
│                                        │
│ Inactive/Rejected:                     │
│ [✗ INACTIVE]  or  [✗ REJECTED]        │
│                                        │
└────────────────────────────────────────┘
```

## 📲 Responsive Design

### Mobile View

```
┌─────────────────┐
│ ☰ [Dashboard] │
├─────────────────┤
│ [Stat 1]        │
│ [Stat 2]        │
│ [Stat 3]        │
│ [Stat 4]        │
├─────────────────┤
│ [Tab 1] [Tab 2] │
├─────────────────┤
│ Search...       │
├─────────────────┤
│ Row 1 [•••]     │
│ Row 2 [•••]     │
│ Row 3 [•••]     │
├─────────────────┤
│ Prev [1] Next   │
└─────────────────┘
```

### Tablet View

```
┌──────┬──────────────────────┐
│ ◄ ► │  Dashboard Content   │
├──────┼──────────────────────┤
│      │ [Stat] [Stat]        │
│ Nav  │ [Stat] [Stat]        │
│      │                      │
│      │ [Tabs Section]       │
│      │ [Table with items]   │
│      │ Pagination controls  │
└──────┴──────────────────────┘
```

### Desktop View (Full Width)

```
┌──────┬────────────────────────────────┐
│      │                                │
│ ◄ ► │    ADMIN DASHBOARD             │
│      │    Manage users and data       │
├──────┼────────────────────────────────┤
│      │ [KPI][KPI][KPI][KPI]          │
│ Nav  │                                │
│ Items│ [Tabs: Users | Mods | Reqs]   │
│      │ Search [______] Filter [▼]    │
│      │ Full Table Display             │
│      │ Previous [1][2][3] Next        │
│      │                                │
│ Link │ [Detail Panel Slides In ──►]   │
│ List │                                │
└──────┴────────────────────────────────┘
```

## 🔄 Interaction States

### Button States

```
Normal State:
┌─────────────┐
│  Approve    │  ← Hover shows darker shade
└─────────────┘

Loading State:
┌──────────────────┐
│ ⟳ Processing... │  ← Disabled, spinner
└──────────────────┘

Success State:
┌─────────────┐
│  ✓ Done     │  ← Green, briefly shows
└─────────────┘

Error State:
┌─────────────┐
│  ✗ Failed   │  ← Red, shows error message
└─────────────┘
```

### Table Row Interaction

```
Normal:
┌─────────────────────────────────────┐
│ Name    │ Email │ Status │ Actions │
└─────────────────────────────────────┘

Hover:
┌─────────────────────────────────────┐ ← Light blue background
│ Name    │ Email │ Status │ Actions │
└─────────────────────────────────────┘

Clicked:
┌─────────────────────────────────────┐
│ Name    │ Email │ Status │ Actions │ ← Row highlights
└─────────────────────────────────────┘
    ▼ (Detail panel slides in from right)
```

## 🎬 Animation Sequences

### Detail Panel Open

```
[Table] ──────────────────► [Table + Panel Slides In]
         ↓ (300ms ease-in-out)
         Backdrop fades to black/20
         Panel slides from right
```

### Modal Fade In

```
[Background] ──────────────► [Background + Modal Centered]
              ↓ (200ms ease-out)
              Backdrop fades in
              Modal zooms in smoothly
```

### Search Results Update

```
[10 items] ──────────────► [5 items matching search]
            ↓ (instant)
            Table refreshes
            Count updates
            Animation smooth
```

## 📊 Data Flow Diagram

```
┌──────────────────┐
│  Zustand Store   │ ◄─── Backend API
└────────┬─────────┘
         │
         │ useShallow hook
         ▼
    Component State
         │
    ┌────┴────┐
    │          │
    ▼          ▼
 Search     Filter
    │         │
    └────┬────┘
         │ useMemo
         ▼
  Memoized Results
         │
         ▼
    ┌────────────┐
    │ DataTable  │
    └────┬───────┘
         │
    ┌────┴────────────┐
    │                 │
    ▼                 ▼
  User Click     Menu Click
    │                 │
    ▼                 ▼
DetailPanel      Confirmation
    │                 │
    └────┬────────────┘
         │
         ▼
   Dispatch Action
         │
         ▼
  Update Store
         │
         ▼
  Re-render
         │
         ▼
  Show Toast
```

## 🎨 Typography & Spacing

### Font Hierarchy

```
Main Title:           32px, Bold (text-2xl)
Section Header:       20px, Bold (text-xl)
Column Header:        14px, Semibold (font-semibold)
Body Text:            14px, Regular (text-sm)
Help Text:            12px, Regular (text-xs)
```

### Spacing Grid (4px base)

```
xs: 4px  (gap-1)
sm: 8px  (gap-2)
md: 16px (gap-4)
lg: 24px (gap-6)
xl: 32px (gap-8)
```

## 🔐 Action Confirmation Flow

```
User Action (Delete)
         │
         ▼
┌────────────────────────┐
│ Are you sure?          │
│ This cannot be undone. │
│                        │
│ [Cancel]  [Delete]     │
└────────────────────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
 Cancel     Confirm
    │          │
    │          ▼
    │      Action Executes
    │          │
    │    ┌─────┴──────┐
    │    │            │
    │    ▼            ▼
    │  Success      Error
    │    │            │
    │    ▼            ▼
    │  Toast       Toast
    │              (red)
    │
    └──► Close Dialog
         Keep Page State
```

## ✨ Visual Feedback System

### Success

```
Action Completes
       │
       ▼
   ✓ Success Toast (Green)
   "User deleted successfully"
   Stays for 3 seconds
```

### Error

```
Action Fails
     │
     ▼
   ✗ Error Toast (Red)
   "Failed to delete user"
   Stays until closed
```

### Loading

```
Action Starts
      │
      ▼
   ⟳ Loading Toast
   "Processing..."
   Blocks interactions
   Shows until done
```

---

## 🎓 Summary

The dashboards use:

- **Consistent Layout** - Same pattern everywhere
- **Color Coding** - Status at a glance
- **Clear Navigation** - Tabs, menus, breadcrumbs
- **Progressive Disclosure** - Details on demand
- **Immediate Feedback** - Toast, loading, spinners
- **Responsive Design** - Works on all devices
- **Accessible** - Keyboard nav, ARIA labels

All designed with **professional enterprise UX** in mind.
