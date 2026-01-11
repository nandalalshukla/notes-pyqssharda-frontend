import api from "./axios";

// --- Users Management ---
export const getAllUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};

export const getActiveUsers = async () => {
  const response = await api.get("/admin/users/active");
  return response.data;
};
export const getInactiveUsers = async () => {
  const response = await api.get("/admin/users/inactive");
  return response.data;
};

export const deleteUser = async (userId: string) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

export const deactivateUser = async (userId: string) => {
  const response = await api.patch(`/admin/users/deactivate/${userId}`);
  return response.data;
};

export const activateUser = async (userId: string) => {
  const response = await api.patch(`/admin/users/activate/${userId}`);
  return response.data;
};

// --- Mods Management ---
export const getAllMods = async () => {
  const response = await api.get("/admin/mods");
  return response.data;
};

export const getModRequests = async () => {
  const response = await api.get("/admin/mods/requests");
  return response.data;
};

export const reviewModRequest = async (
  userId: string,
  action: "approve" | "reject"
) => {
  const response = await api.patch(`/admin/mods/review/${userId}`, { action });
  return response.data;
};

export const removeModRole = async (userId: string) => {
  const response = await api.patch(`/admin/mods/remove/${userId}`);
  return response.data;
};

// --- Content Management (Admin Deletion) ---
//notes
export const getApprovedNotesAdmin = async () => {
  const response = await api.get("/admin/notes");
  return response.data;
};
export const deleteNoteAdmin = async (noteId: string) => {
  const response = await api.delete(`/admin/notes/${noteId}`);
  return response.data;
};

//pyqs
export const getApprovedPyqsAdmin = async () => {
  const response = await api.get("/admin/pyqs");
  return response.data;
};
export const deletePyqAdmin = async (pyqId: string) => {
  const response = await api.delete(`/admin/pyqs/${pyqId}`);
  return response.data;
};

//syllabus
export const getApprovedSyllabusAdmin = async () => {
  const response = await api.get("/admin/syllabus");
  return response.data;
};
export const deleteSyllabusAdmin = async (syllabusId: string) => {
  const response = await api.delete(`/admin/syllabus/${syllabusId}`);
  return response.data;
};
