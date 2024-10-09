import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises'; // Use promises version of fs for better async handling
import multer from 'multer';
import config from '../config';

cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret,
});

export const sendImageToCloudinary = (
  imageName: string,
  path: string,
): Promise<Record<string, unknown>> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      path,
      { public_id: imageName.trim() },
      async function (error, result) {
        if (error) {
          return reject(error);
        }

        resolve(result as UploadApiResponse);

        try {
          // Delete the file asynchronously after resolving the upload promise
          await fs.unlink(path);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      },
    );
  });
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.cwd() + '/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  },
});

export const upload = multer({ storage: storage });
