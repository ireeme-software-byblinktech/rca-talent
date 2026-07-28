import { apiClient } from "./client";
import { isMockMode } from "@/lib/config/env";

export interface UploadedFile {
  key: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
}

function mockUpload(file: File, folder: string): UploadedFile {
  return {
    key: `${folder}/${file.name}`,
    url: URL.createObjectURL(file),
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
  };
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

  async uploadBlogCover(file: File): Promise<UploadedFile> {
    if (isMockMode()) {
      return mockUpload(file, "blog/covers");
    }
    const formData = new FormData();
    formData.append("file", file);
    return apiClient<UploadedFile>("files/upload/blog-cover", {
      method: "POST",
      body: formData,
    });
  },

  async uploadBlogMedia(file: File): Promise<UploadedFile> {
    if (isMockMode()) {
      return mockUpload(file, "blog/media");
    }
    const formData = new FormData();
    formData.append("file", file);
    return apiClient<UploadedFile>("files/upload/blog-media", {
      method: "POST",
      body: formData,
    });
  },
};
