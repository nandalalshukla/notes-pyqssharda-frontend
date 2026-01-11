import api from "./axios";

// --- Fetch Pending Items ---
export const getPendingNotes = async () => {
  const response = await api.get("/mod/notes/pending");
  return response.data;
};

export const getPendingPyqs = async () => {
  const response = await api.get("/mod/pyqs/pending");
  return response.data;
};

export const getPendingSyllabus = async () => {
  const response = await api.get("/mod/syllabus/pending");
  return response.data;
};

// --- Approval / Rejection ---
export const approveNote = async (noteId: string) => {
  const response = await api.patch(`/mod/notes/${noteId}/approve`);
  return response.data;
};

export const rejectNote = async (noteId: string, rejectionReason?: string) => {
  const response = await api.patch(`/mod/notes/${noteId}/reject`, {
    rejectionReason,
  });
  return response.data;
};

export const approvePyq = async (pyqId: string) => {
  const response = await api.patch(`/mod/pyqs/${pyqId}/approve`);
  return response.data;
};

export const rejectPyq = async (pyqId: string, rejectionReason?: string) => {
  const response = await api.patch(`/mod/pyqs/${pyqId}/reject`, {
    rejectionReason,
  });
  return response.data;
};

export const approveSyllabus = async (syllabusId: string) => {
  const response = await api.patch(`/mod/syllabus/${syllabusId}/approve`);
  return response.data;
};

export const rejectSyllabus = async (
  syllabusId: string,
  rejectionReason?: string
) => {
  const response = await api.patch(`/mod/syllabus/${syllabusId}/reject`, {
    rejectionReason,
  });
  return response.data;
};
