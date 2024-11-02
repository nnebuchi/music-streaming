const multer = require('multer');
const {renameUploadedFile} = require('../utils/generic');
const file_config = require('../config/filesystem');
const file_disks = file_config.storage;
const fs = require('fs-extra');
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const diskName = req.body.disk || 'local'; // Default to 'local'
        const uploadPath = diskName === 'local' ? './uploads' : ''; // Handle other file_disks
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});


// const saveFile = (directory, disk='local') => {
  
//   const file_path = file_disks[disk]['root'];
//   switch (disk) {
//     case "local":
//       return multer.diskStorage({
//         destination: async (req, file, cb) => {
//           await fs.ensureDir(`${file_path}/${directory}`);
//           cb(null, `${file_path}/${directory}`); // Specify the directory where files will be stored
//         },
//         filename: async (req, file, cb) => {
//           cb(null, await renameUploadedFile(file.originalname));
//         }
//       });
//       break;

//     case "cloudinary":
      
//       return {
//         destination: async (req, file, cb) => {
//           console.log(req.file);

          
//           try {
//             console.log(req.file);
            
//             const result = await cloudinary.uploader.upload(file.path, {
//               folder: directory, // Specify the folder in Cloudinary
//               resource_type: 'auto' // Auto detects file type
//             });
//             cb(null, result.secure_url); // Upload successful, return Cloudinary URL
//           } catch (error) {
//             console.error(error);
//             cb(error, null); // Upload failed, return error
//           }
//         },
//         filename: async (req, file, cb) => {
//           cb(null, await renameUploadedFile(file.originalname));
//         }
//       };
//       // imlement cloudinary upload
//       break;
  
//     default:
//       break;
//   }
// }


 

// const cloudUploader =  {

//     single: async (name) => await storeInCloud(name, 'profile_photos')
//   }
  
// exports.uploadProfilePhoto = process.env.ACTIVE_DISK === 'local' ? multer({ storage: saveFile('profile_photos') }) :  cloudUploader
  


// exports.uploadProfilePhoto = multer({ storage: saveFile('profile_photos', 'cloudinary')});

const saveFile = (directory, disk = 'local') => {
  const file_path = file_disks[disk]['root'];
  switch (disk) {
    case 'local':
      return multer.diskStorage({
        destination: async (req, file, cb) => {
          await fs.ensureDir(`${file_path}/${directory}`);
          cb(null, `${file_path}/${directory}`);
        },
        filename: async (req, file, cb) => {
          console.log("file", file);
          
          cb(null, await renameUploadedFile(file.originalname));
        },
      });
      break;

    case 'cloudinary':
      return {
        storage: multer.memoryStorage(),
        fileFilter: (req, file, cb) => {
          console.log("file: ", file)
          if (!file.mimetype.match(/jpg|jpeg|png|gif$/i)) {
            cb(null, false);
          } else {
            cb(null, true);
          }
        },
      };
      break;

    default:
      break;
  }
};


// const uploadToCloudinary = async (req, directory) => {
//   try {
//     const file = req.file;
//     const uploadStream = cloudinary.uploader.upload_stream({
//       folder: directory,
//       resource_type: 'image',
//     }, (error, result) => {
//       if (error) {
//         console.error(error);
//         throw error;
//       }
//       return result.secure_url;
//     });

//     uploadStream.write(file.buffer);
//     uploadStream.end();

//     return await new Promise((resolve) => {
//       uploadStream.on('finish', () => {
//         resolve(uploadStream.result.secure_url);
//       });
//     });
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// };

exports.uploadToCloudinary = async (req, directory) => {
  return this.handleCloudinaryUpload(req.file, directory);
};

exports.uploadFile = (directory, disk = process.env.ACTIVE_DISK) => {
  const storage = saveFile(directory, disk);
  return multer(storage);
};


exports.uploadCoverPhoto = multer({ storage: saveFile('cover_photos')});

exports.uploadTrackCoverPhoto = multer({ storage: saveFile('track_covers')});

exports.uploadTrackFile = multer({ dest: 'public/uploads/temp/' });


exports.handleCloudinaryUpload = async (file, directory) => {
  try {
    
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({
        folder: process.env.CLOUDINARY_ROOT+directory,
      }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.url);
        }
      });

      uploadStream.write(file.buffer);
      uploadStream.end();
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}
exports.moveTrackFileToCloudinary = async (localFilePath, directory) => {
  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: process.env.CLOUDINARY_ROOT+directory,
      resource_type: 'auto',
    });
    return result.url;
  } catch (error) {
    console.error(error);
    throw error;
  } 
}




