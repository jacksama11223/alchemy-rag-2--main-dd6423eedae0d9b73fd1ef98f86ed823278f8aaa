import { processImageWithVisionAPI } from '../../services/mockBackend';

export const processImageWithVision = async (
  imageUrl: string,
  onProgress?: (status: string, progress: number) => void
): Promise<string> => {
  try {
    if (onProgress) onProgress('Đang tải ảnh lên máy chủ Vision AI...', 20);
    
    // Call the new backend proxy
    const markdownText = await processImageWithVisionAPI(imageUrl);
    
    if (onProgress) onProgress('Hoàn tất trích xuất cấu trúc văn bản!', 100);
    return markdownText;
  } catch (error) {
    console.error('Error processing image with Vision API:', error);
    throw error;
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
