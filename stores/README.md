# Zustand Stores Documentation

This folder contains the global state management stores using Zustand for the Notes and PYQs application.

## Structure

```
stores/
├── notes.store.ts      # Notes state management
├── pyqs.store.ts       # PYQs state management
├── syllabus.store.ts   # Syllabus state management
├── authStore.ts        # Authentication state
└── README.md           # This file
```

## Features

Each store provides:

- ✅ **Type-safe state** with TypeScript
- ✅ **Loading states** for async operations
- ✅ **Error handling** with detailed messages
- ✅ **CRUD operations** (Create, Read, Update, Delete)
- ✅ **Search functionality**
- ✅ **Utility functions** (clear error, reset store)

## Store Pattern

All resource stores (Notes, PYQs, Syllabus) follow this consistent pattern:

```typescript
interface Store {
  // State
  myItems: Item[];
  allItems: Item[];
  isLoading: boolean;
  error: string | null;

  // Fetch operations
  fetchAll(): Promise<void>;
  fetchMy(): Promise<void>;
  search(query: string): Promise<void>;

  // CRUD operations
  add(data: FormData): Promise<void>;
  edit(id: string, data: FormData): Promise<void>;
  remove(id: string): Promise<void>;

  // Utilities
  clearError(): void;
  resetStore(): void;
}
```

## Usage Examples

### Notes Store

```typescript
import { useNotesStore } from "@/stores/notes.store";

function NotesComponent() {
  const {
    myNotes,
    allNotes,
    isLoading,
    error,
    fetchAllNotes,
    fetchMyNotes,
    addNote,
    editNote,
    removeNote,
    clearError,
  } = useNotesStore();

  // Fetch data on mount
  useEffect(() => {
    fetchAllNotes();
  }, [fetchAllNotes]);

  // Upload a new note
  const handleUpload = async (formData: FormData) => {
    try {
      await addNote(formData);
      toast.success("Note uploaded successfully!");
    } catch (error) {
      // Error is already set in store
      toast.error(error || "Upload failed");
    }
  };

  // Update a note
  const handleUpdate = async (noteId: string, formData: FormData) => {
    try {
      await editNote(noteId, formData);
      toast.success("Note updated successfully!");
    } catch (error) {
      toast.error("Update failed");
    }
  };

  // Delete a note
  const handleDelete = async (noteId: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      try {
        await removeNote(noteId);
        toast.success("Note deleted successfully!");
      } catch (error) {
        toast.error("Delete failed");
      }
    }
  };

  // Display
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage message={error} onDismiss={clearError} />;

  return (
    <div>
      {allNotes.map((note) => (
        <NoteCard
          key={note._id}
          note={note}
          onEdit={handleUpdate}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
```

### PYQs Store

```typescript
import { usePYQsStore } from "@/stores/pyqs.store";

function PYQsPage() {
  const { allPyqs, myPyqs, isLoading, fetchAllPyqs, searchPyqs, addPYQ } =
    usePYQsStore();

  useEffect(() => {
    fetchAllPyqs();
  }, [fetchAllPyqs]);

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      await searchPyqs(query);
    } else {
      await fetchAllPyqs();
    }
  };

  const handleUpload = async (formData: FormData) => {
    try {
      await addPYQ(formData);
      toast.success("PYQ uploaded!");
    } catch (error) {
      toast.error("Upload failed");
    }
  };

  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      <UploadButton onUpload={handleUpload} />
      {isLoading ? <Spinner /> : <PYQList pyqs={allPyqs} />}
    </div>
  );
}
```

### Syllabus Store

```typescript
import { useSyllabusStore } from "@/stores/syllabus.store";

function SyllabusPage() {
  const {
    allSyllabus,
    mySyllabus,
    isLoading,
    error,
    fetchAllSyllabus,
    addSyllabus,
    editSyllabus,
    removeSyllabus,
  } = useSyllabusStore();

  // Similar usage pattern as Notes and PYQs
  // ...
}
```

## Selecting Specific State

Optimize re-renders by selecting only what you need:

```typescript
// ❌ Bad - component re-renders on any state change
const store = useNotesStore();

// ✅ Good - only re-renders when allNotes changes
const allNotes = useNotesStore((state) => state.allNotes);
const isLoading = useNotesStore((state) => state.isLoading);

// ✅ Best - use hooks for multiple selections
const { allNotes, isLoading } = useNotesStore();
```

## Error Handling Pattern

```typescript
function Component() {
  const { error, isLoading, addNote, clearError } = useNotesStore();

  useEffect(() => {
    if (error) {
      // Show error notification
      toast.error(error);

      // Auto-clear after showing
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleSubmit = async (data: FormData) => {
    try {
      await addNote(data);
      // Success handling
    } catch (error) {
      // Error is already in store
      // Just need UI feedback
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {error && <ErrorBanner message={error} />}
      <button disabled={isLoading}>
        {isLoading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}
```

## Loading States

```typescript
function Component() {
  const { isLoading, fetchAllNotes } = useNotesStore();

  return (
    <div>
      <button onClick={fetchAllNotes} disabled={isLoading}>
        {isLoading ? (
          <>
            <Spinner size="sm" />
            <span>Loading...</span>
          </>
        ) : (
          "Refresh"
        )}
      </button>
    </div>
  );
}
```

## Resetting Store State

```typescript
function LogoutButton() {
  const resetNotes = useNotesStore((state) => state.resetStore);
  const resetPyqs = usePYQsStore((state) => state.resetStore);
  const resetSyllabus = useSyllabusStore((state) => state.resetStore);

  const handleLogout = () => {
    // Clear all stores
    resetNotes();
    resetPyqs();
    resetSyllabus();

    // Redirect to login
    router.push("/auth/login");
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

## Best Practices

1. **Fetch data on mount** using `useEffect`
2. **Handle errors gracefully** with try-catch
3. **Show loading states** for better UX
4. **Clear errors** after displaying to user
5. **Reset stores** on logout
6. **Use optimistic updates** when appropriate
7. **Avoid unnecessary re-renders** with selective state access

## TypeScript Benefits

All stores are fully typed:

```typescript
// ✅ TypeScript knows the exact structure
const note: Note = allNotes[0];
console.log(note.title); // ✅ OK
console.log(note.invalid); // ❌ Error: Property doesn't exist

// ✅ Function parameters are typed
await addNote(formData); // ✅ OK
await addNote("invalid"); // ❌ Error: Expected FormData
```

## Performance Tips

1. **Memoize selectors** for computed values:

```typescript
const approvedNotes = useNotesStore((state) =>
  state.allNotes.filter((n) => n.isApproved)
);
```

2. **Use shallow comparison** for object/array selections:

```typescript
import { shallow } from "zustand/shallow";

const { allNotes, myNotes } = useNotesStore(
  (state) => ({ allNotes: state.allNotes, myNotes: state.myNotes }),
  shallow
);
```

3. **Split large stores** if needed for better performance
