import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const downloadSinglePhoto = async (photoUrl: string, fileName: string) => {
  try {
    const response = await fetch(photoUrl);
    const blob = await response.blob();
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Error downloading photo:', error);
  }
};

export const downloadAllPhotos = async (photos: string[], studentName: string) => {
  try {
    const zip = new JSZip();
    
    // Create an array of promises for fetching all photos
    const photoPromises = photos.map(async (photoUrl, index) => {
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      zip.file(`${studentName}_photo_${index + 1}.jpg`, blob);
    });
    
    // Wait for all photos to be fetched and added to the zip
    await Promise.all(photoPromises);
    
    // Generate and download the zip file
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${studentName}_photos.zip`);
  } catch (error) {
    console.error('Error creating zip file:', error);
  }
};