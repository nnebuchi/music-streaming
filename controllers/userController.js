const { runValidation } = require('../lib/buchi');
const userService =  require('../services/userService');


exports.changePassword = async (req, res) => {
    const { old_password, new_password } = req.body;
    const validate = await runValidation([
        {
          input: { value: old_password, field: "old_password", type: "text" },
          rules: { required: true},
        },
        {
          input: { value: new_password, field: "new_password", type: "text" },
          rules: {
            required: true,
            has_special_character: true,
            min_length: 6,
            must_have_number: true,
          },
        },
  
    ]);

    if(validate){
        if(validate?.status === false) {
          return res.status(409).json({
              status:"fail",
              errors:validate.errors,
              message:"Request Failed",
          });
        }else{
          // const user_data = {}
          const user = req.user;
            return userService.changePassword(old_password, new_password, user, res);
          
        }
      }
    
}

exports.profile = (req, res) => {
  return userService.profile(req.user, res);
}

exports.getThirdPartyProfile = (req, res) => {
  return userService.getThirdPartyProfile(req.params.slug, res);
}

exports.updateProfile = async (req, res) => {
  return userService.updateProfile(req, res);
}

exports.socials = async(req, res) => {
  return userService.socials(req.user, res);
}


exports.deleteAccount = async (req, res) => {
  const validate = await runValidation([
    {
      input: { value: req.body.password, field: "password", type: "text" },
      rules: { required: true },
    },
  ]);

  if(validate){
    if(validate?.status === false) {
      return res.status(409).json({
          status:"fail",
          errors:validate.errors,
          message:"Request Failed",
      });
    }
  }
  return userService.deleteAccount(req, res)
}

exports.updateSocials = (req, res) => {
  return userService.updateSocials(req.user, req.body, res);
}

// exports.updateProfilePhoto = async(req, res) => {
  
//   if (req.file) {
//     return await userService.updateProfilePhoto(req.user, req.file, res)
//   } else {
//     // No file uploaded
//     res.send('No file uploaded.');
//   }
// }

// exports.updateProfilePhoto = async (req, res) => {
//   if (req.file) {
//     const directory = 'profile_photos';
//     const filePath = await fileService.uploadToCloudinary(req, directory);
//     return await userService.updateProfilePhoto(req.user, filePath, res);
//   } else {
//     // No file uploaded
//     res.send('No file uploaded.');
//   }
// };

exports.updateProfilePhoto = async (req, res) => {
  if (req.file) {
    const directory = 'profile_photos';
    return await userService.updateProfilePhoto(req, directory, res, 'profile_photo');
  } else {
    res.send('No file uploaded.');
  }
};
exports.updateCoverPhoto = async(req, res) => {
  if (req.file) {
    const directory = 'cover_photos';
    return await userService.updateProfilePhoto(req, directory, res, 'cover_photo');
  } else {
    res.send('No file uploaded.');
  }
}

exports.getFollowers = async (req, res) => {
  return userService.getFollowers(req, res);
}

exports.getFollowings = async (req, res) => {
  return userService.getFollowings(req, res);
}

exports.getLikedTracks = async (req, res) => {
  return userService.getLikedTracks(req, res);
}

exports.toggleNotification = async (req, res) => {
  const validate = await runValidation([
    {
        input: { value: req?.body?.notification_status, field: "notification_status", type: "boolean" },
        rules: { required: true, boolean:true},
    }

   
  ]);

  if(validate){
    if(validate.status === false){
        return res.status(409).json({
            status:"fail",
            errors:validate.errors,
            message:"Something went wrong",
        });
    }else{
        const updateStatus = await userService.toggleNotification(req)
        if(updateStatus.status){
            return res.status(200).json({
                status:"success",
                message:"notification status updated"
            })
        }else{
            console.log(updateStatus.error);
            
            return res.status(400).json({
                status:"fail",
                message:"Could not save token",
                error:updateStatus.error
            })
        }
    }
}
}