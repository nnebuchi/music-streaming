exports.processPath = async (file) => {
  let file_path_on_db;

      if(file?.path.split("\\").length > 1 && file?.path.split("\\")[0] === "public"){
          
          const  file_path_to_array = file.path.split("\\");
          file_path_to_array.shift();
          
          file_path_on_db = file_path_to_array.join("/");
      }else{
          file_path_on_db = file.path.split("\\").replaceAll("\\","/");
      } 

      return file_path_on_db;
}

exports.removeDiskPath = async (filePath) => {
  // Determine the OS path separator based on the environment
  const pathSeparator = process.platform === 'win32' ? '\\' : '/';

  // Split the file path into segments using the path separator
  const pathSegments = filePath.split(pathSeparator);

  // Remove the disk path segments (usually the first one or two)
  const dynamicPathSegments = pathSegments.slice(1); // Adjust the index if necessary

  // Join the remaining segments to form the dynamic path
  return dynamicPathSegments.join('/');
}


exports.extractDynamicPart = async (filePath) => {
  const regex = /upload\/(.*)/;
  const match = filePath.match(regex);
  return match ? match[1] : null;
}

exports.fileBaseUrl = async (filePath) => {
  if(!filePath){
    return null;
  }
  const fileArray = filePath.split('.');
  // console.log(fileArray);
  
  const images = ["jpg, jpeg, png, svg, gif, webp"];

  const videos = [ "mp4", "mov", "avi", "wmv", "flv", "mkv", "webm", "mpg", "vob", "rmvb", "3gp", "3g2", "asf", "mxf", "rm", "swf"];

  const audios  = [ "mp3", "wav", "aac", "ogg", "flac", "wma", "alac", "aiff", "m4a", "m4b", "m4r", "mp2", "mp1", "ape", "mac", "shn", "cue", "m3u", "m3u8", "pls", "xsp", "ram", "ra", "rm", "ogg", "vorbis", "opus", "ac3", "dts", "dts-hd", "dtsx", "thd", "thd-ma", "thd-hr", "thd-hr-ma"];

  const fileType =  images.includes(fileArray[fileArray.length - 1]) ? "image" : videos.includes(fileArray[fileArray.length - 1]) ? "video" : audios.includes(fileArray[fileArray.length - 1]) ? "video" : "image";
  // console.log(`${process.env.ASSET_URL}/${fileType}/upload/${filePath}`);
  
  return `${process.env.ASSET_URL}/${fileType}/upload/${filePath}`;
}
