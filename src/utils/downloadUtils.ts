import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const downloadSinglePhoto = (photoUrl: string, fileName: string) => {
  const link = document.createElement('a');
  link.href = photoUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadAllPhotos = async (photos: string[], studentName: string) => {
  const zip = new JSZip();
  
  photos.forEach((photoUrl, index) => {
    // Convert base64 to blob
    const base64Data = photoUrl.split(',')[1];
    const blob = base64ToBlob(base64Data);
    zip.file(`${studentName}_photo_${index + 1}.jpg`, blob);
  });
  
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${studentName}_photos.zip`);
};

const base64ToBlob = (base64: string) => {
  const byteString = atob(base64);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ab], { type: 'image/jpeg' });
};