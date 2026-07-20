import { apiClient } from "./client";

export interface UploadedFile {
  key: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export const filesApi = {
  async uploadProfilePhoto(file: File): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient<UploadedFile>("files/upload/profile-photo", {
      method: "POST",
      body: formData,
    });
  },

  async uploadResume(file: File): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient<UploadedFile>("files/upload/resume", {
      method: "POST",
      body: formData,
    });
  },
};
