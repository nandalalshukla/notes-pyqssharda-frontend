# Quick Start Guide - Professional Dashboards

## ⚡ 5 Minute Setup

Your dashboards are **already live**! Just visit:

```
http://yourapp.com/library/dashboard
```

The app automatically routes to the correct dashboard based on user role:

- `admin` role → Admin Dashboard
- `mod` role → Moderator Dashboard
- `user` role → User Dashboard

## 🎯 What You Can Do Now

### Admin Dashboard

1. **View All Users** - See active/inactive status, contributions, email
2. **Search Users** - Type name or email to find them
3. **Inspect User** - Click a row to see full details
4. **Manage Users** - Activate/Deactivate/Delete users
5. **Manage Moderators** - View list, remove roles
6. **Review Requests** - Approve or reject moderator applications

### Moderator Dashboard

1. **Review Submissions** - Queue of pending content
2. **Approve Content** - Click approve button
3. **Reject Content** - Click reject and add reason
4. **Handle Reports** - Review reported content
5. **Manage Reports** - Approve/Dismiss reports

### User Dashboard

1. **View Your Content** - All your notes, PYQs, syllabus
2. **Search Content** - Find by title
3. **Filter Content** - By type or status
4. **Upload Content** - Click quick upload cards
5. **Manage Content** - Edit or delete items
6. **Check Status** - See approval status

## 🔍 Key Features

### Search

```
Type in the search box to find items
Searches across: name, email, title, description
```

### Sort

```
Click column headers to sort A→Z
Click again to sort Z→A
Click once more to remove sort
```

### Filter

```
Use dropdown filters:
- Status (Active/Inactive)
- Type (Notes/PYQs/Syllabus)
```

### Pagination

```
Default: 10 items per page
Navigate with Previous/Next buttons
Or click page number directly
```

### Detail View

```
Click any row to see full details
Panel slides in from the right
Close by clicking X or outside
```

## 📱 Works Everywhere

- **Desktop** - Full featured with sidebars
- **Tablet** - Responsive layout
- **Mobile** - Touch-optimized menu

## 🆘 Troubleshooting

### Dashboard Not Loading

1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh page
3. Check browser console (F12) for errors
4. Verify you're logged in

### Search Not Working

1. Check if field has data
2. Try typing simpler search term
3. Check field name matches

### Can't Perform Action

1. Check if you have permission
2. Look for error toast message
3. Check browser console

## 📚 Learn More

See the detailed documentation:

- `DASHBOARDS_SUMMARY.md` - Complete overview
- `IMPLEMENTATION_GUIDE.md` - Detailed usage guide
- `DASHBOARD_ARCHITECTURE.md` - Technical details

## 🚀 Advanced Usage

### For Developers

#### Import Components

```tsx
import {
  DataTable,
  DetailPanel,
  StatsGrid,
  DashboardLayout,
} from "@/components/dashboards";
```

#### Use Custom Hooks

```tsx
import { useDataTable, useDetailPanel } from "@/hooks/useDashboard";

const table = useDataTable({
  data: users,
  searchFields: ["name", "email"],
  pageSize: 10,
});
```

#### Use Utilities

```tsx
import { formatDate, getStatusBadgeConfig } from "@/lib/utils/dashboardUtils";

const formatted = formatDate(new Date());
const badge = getStatusBadgeConfig("active");
```

## 💾 Data Management

All data is managed by Zustand stores:

- Admin users/mods/requests
- Moderator submissions/reports
- User content (notes/pyqs/syllabus)

Changes are instant and persisted to backend.

## 🎨 Customization

### Change Colors

Find color classes in component files:

- Replace `bg-blue-100` with your color
- Replace `text-blue-700` with your text color

### Add New Columns

```tsx
const columns: DataTableColumn<T>[] = [
  {
    id: "fieldName",
    header: "Display Name",
    accessor: (row) => row.fieldName,
    sortable: true, // optional
  },
];
```

### Add New Filters

Just add another select/filter UI and update filter logic.

## 📞 Common Tasks

### Find a Specific User

1. Go to Admin Dashboard
2. Users Tab
3. Type user's name or email
4. Click on user row

### Approve Submitted Content

1. Go to Moderator Dashboard
2. Submissions Tab
3. Search if needed
4. Click on submission
5. Click "Approve Submission"

### Upload New Content

1. Go to User Dashboard
2. Click one of the quick upload cards
3. Fill out form
4. Submit

### Delete a User (Admin)

1. Go to Admin Dashboard
2. Find user in Users Tab
3. Click user row
4. Click "Delete User"
5. Confirm in dialog

## ⏱️ Performance

- Tables paginate by default (10 items/page)
- Search is real-time
- Sorting is instant
- Detail panels load quickly
- No lag on mobile

## 🔐 Security

- All actions require confirmation
- Sensitive operations show warnings
- Errors don't expose sensitive data
- Store handles auth token management

## 📊 What's Different From Before

**Before:** Cluttered, hard to find things, limited actions
**Now:** Professional, organized, powerful management tools

### Admin Before → After

```
Before: 3 mixed tables in one view
After:  Organized tabs + detail panels + search/filter
```

### Mod Before → After

```
Before: Limited filtering and actions
After:  Queue-based review with detailed view
```

### User Before → After

```
Before: 3 side-by-side columns
After:  Unified library with search and management
```

## ✅ Testing

Everything is tested and production-ready. To verify:

1. Load each dashboard
2. Try searching
3. Try sorting
4. Try filtering
5. Click on items
6. Try actions
7. Test mobile view

All should work smoothly.

## 🎯 Next Steps

1. **Test the dashboards** - Explore all features
2. **Give feedback** - What works? What needs improvement?
3. **Customize colors** - Match your brand
4. **Add more dashboards** - Use the same system
5. **Implement batch actions** - Framework already supports it

## 💡 Tips & Tricks

### Keyboard Shortcuts (coming soon)

- Could add shortcuts for power users
- Ctrl+F for search
- Ctrl+E for export

### Batch Operations (framework ready)

- Multi-select checkboxes are built-in
- Just enable: `selectable={true}`
- Add bulk actions for delete/activate/deactivate

### Custom Filters (easy to add)

- Add filter UI
- Update filter logic
- No changes to DataTable needed

### Export Data (utility ready)

- `downloadCSV()` function exists
- Just call it with your data
- Generates CSV file

## 🚨 Known Limitations

Currently:

- No date range filter
- No bulk export by default
- No saved filters
- No custom column ordering

These can all be added if needed!

## 📧 Support

For issues or questions:

1. Check the documentation files
2. Review the component code (well-commented)
3. Check browser console for errors
4. Verify data is loading in Zustand store

---

**Version:** 1.0.0
**Status:** ✅ Production Ready
**Last Updated:** May 26, 2026

Enjoy your professional dashboards! 🎉
