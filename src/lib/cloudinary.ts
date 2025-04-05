// Client-side utility for uploading images
export const uploadImage = async (file: File) => {
  try {
    // Convert file to base64
    const base64data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

    // Upload to Cloudinary via our API route
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: base64data }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Upload failed: ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    console.log('Cloudinary upload successful:', result.secure_url);
    return result;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    throw error;
  }
};
