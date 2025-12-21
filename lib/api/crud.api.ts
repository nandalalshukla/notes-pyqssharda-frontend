import api from "./axios";

export interface Note {
  _id: string;
  title: string;
  fileUrl: string;
  program: string;
  courseCode: string;
  courseName: string;
  semester: string;
  userId: string;
  createdAt?: string;
}

export interface Pyq {
  _id: string;
  title: string;
  fileUrl: string;
  program: string;
  courseCode: string;
  courseName: string;
  semester: string;
  year: string;
  userId: string;
  createdAt?: string;
}

export interface Syllabus {
  _id: string;
  title: string;
  fileUrl: string;
  program: string;
  courseCode: string;
  courseName: string;
  semester: string;
  userId: string;
  createdAt?: string;
}

// Notes
export const getAllNotes = async () => {
  const response = await api.get("/notes/all-notes");
  return response.data;
};

export const getNotes = async () => {
  const response = await api.get("/notes/my-notes");
  return response.data;
};

export const createNote = async (data: FormData) => {
  const response = await api.post("/notes/upload-notes", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateNote = async (
  id: string,
  data: FormData
) => {
  const response = await api.put(`/notes/edit-notes/${id}`, data, {
    headers: {
      "Content-Type":"multipart/form-data",
    },
  });
  return response.data;
};

export const deleteNote = async (id: string) => {
  const response = await api.delete(`/notes/delete-notes/${id}`);
  return response.data;
};

export const searchNotes = async (date: Note) => {
  const response = await api.get("/notes/search-notes", { params: date });
  return response.data;
};

// PYQs
export const getAllPyqs = async () => {
  const response = await api.get("/pyqs/all-pyqs");
  return response.data;
};

export const getPyqs = async () => {
  const response = await api.get("/pyqs/my-pyqs");
  return response.data;
};

export const createPyq = async (data: Pyq | FormData) => {
  const response = await api.post("/pyqs/upload-pyqs", data, {
    headers: {
      "Content-Type":
        data instanceof FormData ? "multipart/form-data" : "application/json",
    },
  });
  return response.data;
};

export const updatePyq = async (id: string, data: Partial<Pyq> | FormData) => {
  const response = await api.put(`/pyqs/edit-pyqs/${id}`, data, {
    headers: {
      "Content-Type":
        data instanceof FormData ? "multipart/form-data" : "application/json",
    },
  });
  return response.data;
};

export const deletePyq = async (id: string) => {
  const response = await api.delete(`/pyqs/delete-pyqs/${id}`);
  return response.data;
};

// Syllabus
export const getAllSyllabus = async () => {
  const response = await api.get("/syllabus/all-syllabus");
  return response.data;
};

export const getSyllabus = async () => {
  const response = await api.get("/syllabus/my-syllabus");
  return response.data;
};

export const createSyllabus = async (data: Syllabus | FormData) => {
  const response = await api.post("/syllabus/upload-syllabus", data, {
    headers: {
      "Content-Type":
        data instanceof FormData ? "multipart/form-data" : "application/json",
    },
  });
  return response.data;
};

export const updateSyllabus = async (
  id: string,
  data: Partial<Syllabus> | FormData
) => {
  const response = await api.put(`/syllabus/edit-syllabus/${id}`, data, {
    headers: {
      "Content-Type":
        data instanceof FormData ? "multipart/form-data" : "application/json",
    },
  });
  return response.data;
};

export const deleteSyllabus = async (id: string) => {
  const response = await api.delete(`/syllabus/delete-syllabus/${id}`);
  return response.data;
};
