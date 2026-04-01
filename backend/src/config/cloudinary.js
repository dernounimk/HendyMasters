// backend/src/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

// التحقق من وجود المتغيرات
console.log('🔧 Cloudinary Config Check:');
console.log('  - cloud_name:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ موجود' : '❌ مفقود');
console.log('  - api_key:', process.env.CLOUDINARY_API_KEY ? '✅ موجود' : '❌ مفقود');
console.log('  - api_secret:', process.env.CLOUDINARY_API_SECRET ? '✅ موجود' : '❌ مفقود');

// تكوين Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// دالة لرفع الملف إلى Cloudinary من buffer
export const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'handymasters',
        transformation: options.transformation || [{ width: 1200, height: 1200, crop: 'limit' }],
        ...options
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // تحويل buffer إلى stream
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

// دالة لحذف صورة
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (publicId) {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    }
    return null;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return null;
  }
};

export { cloudinary };
export default cloudinary;