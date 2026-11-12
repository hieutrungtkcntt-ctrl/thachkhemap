// src/utils/uploadImage.js
const CLOUD_NAME = 'thachkhe_news';
const UPLOAD_PRESET = 'thachkhe_news';

// Nén ảnh trên trình duyệt trước khi upload để tiết kiệm băng thông & tải siêu nhanh
function compressImage(file, maxWidth = 1280, quality = 0.82) {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) return resolve(file);

    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          resolve(blob || file);
        },
        'image/jpeg',
        quality
      );
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export async function uploadImageToCloudinary(file) {
  const compressedBlob = await compressImage(file);
  const formData = new FormData();
  formData.append('file', compressedBlob, file.name || 'news.jpg');
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'thachkhe_news');

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Không thể tải ảnh lên Cloudinary');
  }

  const data = await res.json();
  return data.secure_url; // Trả về link HTTPS vĩnh viễn để lưu vào Firestore
}