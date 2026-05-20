import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 Cloudinary Config Check:');
console.log('  - cloud_name:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ موجود' : '❌ مفقود');
console.log('  - api_key:', process.env.CLOUDINARY_API_KEY ? '✅ موجود' : '❌ مفقود');
console.log('  - api_secret:', process.env.CLOUDINARY_API_SECRET ? '✅ موجود' : '❌ مفقود');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// دالة لرفع الملف إلى Cloudinary من buffer
export const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!buffer || !(buffer instanceof Buffer)) {
      reject(new Error('Invalid buffer provided'));
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'handymasters',
        transformation: options.transformation || [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto' }
        ],
        ...options
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('✅ Upload successful:', result.public_id);
          resolve(result);
        }
      }
    );

    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
    
    readableStream.on('error', (error) => {
      console.error('❌ Stream error:', error);
      reject(error);
    });
  });
};

// دالة لحذف صورة
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (publicId) {
      const result = await cloudinary.uploader.destroy(publicId);
      console.log('✅ Deleted from Cloudinary:', publicId);
      return result;
    }
    return null;
  } catch (error) {
    console.error('❌ Error deleting from Cloudinary:', error);
    return null;
  }
};

// دالة لرفع صور متعددة
export const uploadMultipleImages = async (files, userId) => {
  if (!files || files.length === 0) return [];
  
  const uploadedImages = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      console.log(`📸 Uploading image ${i + 1}/${files.length}: ${file.originalname}`);
      const result = await uploadToCloudinary(file.buffer, {
        folder: `handymasters/posts/${userId}`,
        public_id: `post-${userId}-${Date.now()}-${i}`,
      });
      uploadedImages.push({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      });
      console.log(`✅ Image ${i + 1} uploaded: ${result.secure_url}`);
    } catch (error) {
      console.error(`❌ Failed to upload image ${i + 1}:`, error.message);
    }
  }
  return uploadedImages;
};

export { cloudinary };
export default cloudinary;