# Professional Dashboard Architecture

## Overview

This document describes the professional, data-heavy dashboard system built for Admin, Moderator, and User roles. The dashboards follow enterprise UX patterns and best practices for managing complex data.

## Architecture Components

### 1. **DashboardLayout**

- Responsive sidebar navigation with collapsible menu
- Sticky header with title and subtitle
- Badge support for notification counts
- Mobile-optimized with overlay menu
- Responsive breakpoints: mobile, tablet, desktop

**Usage:**

```tsx
<DashboardLayout
  navItems={navItems}
  title="Admin Dashboard"
  subtitle="Manage users and moderators"
  userRole="admin"
>
  {/* Content */}
</DashboardLayout>
```

### 2. **StatCard & StatsGrid**

- KPI display with icons and trends
- Four color variants: primary, success, warning, danger
- Optional trend indicators (up/down with percentage)
- Grid layout with responsive columns
- Supports up to 4 columns on desktop

**Usage:**

```tsx
<StatsGrid
  stats={[
    {
      label: "Total Users",
      value: 1200,
      icon: <Users size={24} />,
      variant: "primary",
      trend: "up",
      trendValue: 5,
    },
  ]}
  columns={4}
/>
```

### 3. **DataTable**

Advanced data table component with multiple features:

#### Features:

- **Sorting**: Click column headers to sort (asc/desc/none)
- **Filtering**: Built-in search across multiple fields
- **Pagination**: Configurable page sizes with navigation
- **Row Selection**: Optional multi-select with master checkbox
- **Row Actions**: View, edit, delete through dropdown menu
- **Loading States**: Animated loading indicator
- **Empty States**: Customizable empty message

#### Columns:

```tsx
interface DataTableColumn<T> {
  id: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  className?: string;
}
```

**Usage:**

```tsx
<DataTable
  columns={columns}
  data={data}
  onView={handleView}
  searchable
  searchFields={["name", "email"]}
  paginated
  pageSize={10}
  onRowClick={handleRowClick}
/>
```

### 4. **DetailPanel**

Side panel that slides in from the right for detailed item view.

#### Features:

- Smooth slide-in animation
- Overlay backdrop
- Grouped field display with icons
- Action buttons with loading states
- Three button variants: primary, danger, secondary
- Responsive width options: md, lg, xl

**Usage:**

```tsx
<DetailPanel
  isOpen={isOpen}
  onClose={handleClose}
  title="John Doe"
  subtitle="john@example.com"
  fields={[
    { label: "Email", value: "john@example.com", icon: <Mail /> },
    { label: "Role", value: "admin", badge: "admin" },
  ]}
  actions={[
    { label: "Edit", onClick: handleEdit, variant: "primary" },
    { label: "Delete", onClick: handleDelete, variant: "danger" },
  ]}
/>
```

### 5. **Filters**

#### FilterGroup

Single filter group with multi/single select options.

#### SidebarFilter

Complete sidebar with multiple filter groups.

**Usage:**

```tsx
<SidebarFilter
  title="Filters"
  groups={[
    {
      title: "Status",
      options: [
        { value: "active", label: "Active", count: 120 },
        { value: "inactive", label: "Inactive", count: 30 },
      ],
      selected: ["active"],
    },
  ]}
  onGroupChange={handleFilterChange}
  onReset={handleReset}
/>
```

### 6. **SectionCard, Tabs & Toolbar**

#### SectionCard

Container for a dashboard section with header and content.

```tsx
<SectionCard
  title="Users"
  description="Manage user accounts"
  icon={<Users size={20} />}
  onRefresh={handleRefresh}
>
  <DataTable {...props} />
</SectionCard>
```

#### Tabs

Tabbed interface for organizing related content.

```tsx
<Tabs
  tabs={[
    {
      id: "users",
      label: "Users",
      icon: <Users />,
      badge: 5,
      content: <UserContent />,
    },
    {
      id: "mods",
      label: "Moderators",
      icon: <UserCheck />,
      badge: 2,
      content: <ModContent />,
    },
  ]}
  defaultTab="users"
/>
```

#### Toolbar

Header toolbar for search, filters, and actions.

```tsx
<Toolbar
  title="User Management"
  description="Search and manage accounts"
  actions={<button>Add User</button>}
>
  <SearchInput />
  <FilterSelect />
</Toolbar>
```

## Design Patterns

### 1. **Data Flow**

```
Zustand Store → Component State → Memoized Filtering → DataTable
```

### 2. **Search & Filter Pattern**

- Use `useMemo` to memoize filtered results
- Combine multiple filter criteria
- Reset pagination when filters change
- Show filtered count in section header

### 3. **Loading States**

- Show spinner while loading
- Disable interactions during pending actions
- Show toast notifications for results
- Use `pendingActions` map for per-item loading

### 4. **Error Handling**

- Show error toasts for failed operations
- Revert state on error
- Display error messages in panels
- Provide retry mechanisms

## Color Scheme

### Variants:

- **primary** (Blue): Main actions, info
- **success** (Emerald): Positive states, approved
- **warning** (Amber): Caution, pending
- **danger** (Red): Destructive, errors

### Badge Colors:

- Active: Emerald
- Inactive: Gray/Red
- Pending: Amber
- Role-specific: Blue

## Responsive Design

### Breakpoints:

- **Mobile**: < 768px
  - Single column layouts
  - Collapsed sidebar
  - Overlay menu
- **Tablet**: 768px - 1024px
  - 2 column layouts
  - Collapsible sidebar
- **Desktop**: > 1024px
  - Multi-column layouts
  - Persistent sidebar

## Best Practices

### 1. **Performance**

- Memoize computed data with `useMemo`
- Use `useShallow` for store subscriptions
- Lazy load heavy components
- Implement virtual scrolling for large lists (future)

### 2. **Accessibility**

- Proper semantic HTML
- ARIA labels for icons
- Keyboard navigation support
- Focus management

### 3. **UX**

- Show loading states
- Provide feedback for all actions
- Clear empty states
- Consistent error handling
- Pagination for large datasets

### 4. **State Management**

- Use Zustand stores for global state
- Local state for UI only (modal open, filters)
- Memoize expensive computations
- Keep component props simple

## Integration Examples

### Admin Dashboard

- Users Tab: Search, filter by status, inline actions
- Moderators Tab: View with contribution sorting
- Requests Tab: Approve/reject with detail view

### Moderator Dashboard

- Submissions: Queue with type filter, approve/reject
- Reports: Status-based display, action buttons

### User Dashboard

- Content Library: Search, filter by type
- Quick Upload Cards: One-click content upload
- Status Badges: Show approval status

## Future Enhancements

1. **Advanced Filtering**: Date range, advanced search
2. **Bulk Actions**: Multi-select bulk operations
3. **Export**: CSV/PDF export functionality
4. **Analytics**: Charts and metrics dashboard
5. **Real-time Updates**: WebSocket for live updates
6. **Customization**: Saved filters, column visibility
7. **Performance**: Virtual scrolling for large lists
8. **Mobile**: Touch-optimized interactions

## Files Structure

```
components/dashboards/
├── index.ts                  # Exports
├── DashboardLayout.tsx       # Main layout
├── StatCard.tsx              # KPI cards
├── DataTable.tsx             # Data table
├── DetailPanel.tsx           # Side panel
├── Filters.tsx               # Filter components
├── SectionCard.tsx           # Section container
├── AdminDashboard.tsx        # Admin page
├── ModeratorDashboard.tsx    # Moderator page
└── UserDashboard.tsx         # User page
```

## Usage Tips

1. Always pass `id` field in data for DataTable
2. Use `onView` instead of `onRowClick` for detail panels
3. Memoize filtered data with `useMemo`
4. Keep form modals separate from dashboard
5. Use toast for user feedback
6. Implement debouncing for search
7. Reset pagination on filter change
