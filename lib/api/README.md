# API Layer Documentation

This folder contains the API layer for the Notes and PYQs application, providing a clean separation between the frontend and backend.

## Structure

```
lib/api/
├── axios.ts          # Axios instance with interceptors
├── types.ts          # Common TypeScript types
├── notes.api.ts      # Notes API endpoints
├── pyqs.api.ts       # PYQs API endpoints
├── syllabus.api.ts   # Syllabus API endpoints
└── README.md         # This file
```

## Features

### 1. Axios Configuration (`axios.ts`)

- Base URL configuration from environment variables
- Automatic cookie handling with `withCredentials`
- Token refresh interceptor for expired tokens
- Global error handling

### 2. Type Safety

All API functions are fully typed with TypeScript interfaces ensuring:

- Request data validation
- Response data type safety
- Better IDE autocomplete
- Compile-time error detection

### 3. Consistent API Patterns

Each resource (Notes, PYQs, Syllabus) follows the same pattern:

```typescript
// Fetch all (public)
export const getAll<Resource> = async () => Promise<Response>

// Fetch user's items (authenticated)
export const getMy<Resource> = async () => Promise<Response>

// Create new item
export const create<Resource> = async (data: FormData) => Promise<Response>

// Update existing item
export const update<Resource> = async (id: string, data: FormData) => Promise<Response>

// Delete item
export const delete<Resource> = async (id: string) => Promise<Response>

// Search items
export const search<Resource> = async (query: string) => Promise<Response>
```

## Usage Examples

### Notes API

```typescript
import {
  getAllNotes,
  createNote,
  updateNote,
  deleteNote,
} from "@/lib/api/notes.api";

// Fetch all notes
const fetchNotes = async () => {
  try {
    const response = await getAllNotes();
    console.log(response.notes);
  } catch (error) {
    console.error("Failed to fetch notes:", error);
  }
};

// Create a new note
const handleUpload = async (file: File, metadata: any) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", metadata.title);
  formData.append("program", metadata.program);
  formData.append("courseCode", metadata.courseCode);
  formData.append("courseName", metadata.courseName);
  formData.append("semester", metadata.semester);

  try {
    const response = await createNote(formData);
    console.log("Note created:", response.note);
  } catch (error) {
    console.error("Upload failed:", error);
  }
};

// Update a note
const handleUpdate = async (noteId: string, updates: FormData) => {
  try {
    const response = await updateNote(noteId, updates);
    console.log("Note updated:", response.note);
  } catch (error) {
    console.error("Update failed:", error);
  }
};

// Delete a note
const handleDelete = async (noteId: string) => {
  try {
    await deleteNote(noteId);
    console.log("Note deleted successfully");
  } catch (error) {
    console.error("Delete failed:", error);
  }
};
```

### PYQs API

```typescript
import { getAllPyqs, createPyq, searchPyqs } from "@/lib/api/pyqs.api";

// Similar pattern to Notes API
const uploadPYQ = async (formData: FormData) => {
  const response = await createPyq(formData);
  return response.pyq;
};
```

### Syllabus API

```typescript
import {
  getAllSyllabus,
  createSyllabus,
  searchSyllabus,
} from "@/lib/api/syllabus.api";

// Similar pattern to Notes and PYQs
const uploadSyllabus = async (formData: FormData) => {
  const response = await createSyllabus(formData);
  return response.syllabus;
};
```

## Error Handling

All API functions throw errors that can be caught in try-catch blocks:

```typescript
try {
  const response = await createNote(formData);
  // Handle success
} catch (error: any) {
  // Error contains response data
  const errorMessage = error.response?.data?.message || error.message;
  console.error("API Error:", errorMessage);

  // Show to user
  toast.error(errorMessage);
}
```

## Authentication

Authentication is handled automatically:

- Cookies are sent with `withCredentials: true`
- Expired tokens trigger automatic refresh
- Failed refresh redirects to login (implement in your app)

## Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000/api/v1
```

## Best Practices

1. **Always use try-catch** when calling API functions
2. **Use TypeScript types** provided by each API file
3. **Handle loading states** in your components/stores
4. **Validate FormData** before sending to API
5. **Show user feedback** for success/error states
