const {fileBaseUrl} = require('../utils/file');
exports.user_middleware = async (params, next) => {
    const result = await next(params);
  
    if (params.model === 'Users' && 
        [
          'findUnique', 
          'findMany', 
          'findFirst', 
          'groupBy', 
          'aggregate'
        ].includes(params.action)
    ) {
      if (Array.isArray(result)) {
        result.forEach(async (user) => {
          user.profile_photo = await fileBaseUrl(user.profile_photo);
          user.cover_photo =  await fileBaseUrl(user.cover_photo);
        });
      } else {
        result.profile_photo = await fileBaseUrl(result.profile_photo);
        result.cover_photo = await fileBaseUrl(result.cover_photo);
      }
    }
  
    return result;
};

exports.song_middleware = async (params, next) => {
  
  try {
    const result = await next(params);

    if (params.model === 'Tracks' && 
        [
          'findUnique', 
          'findMany', 
          'findFirst', 
          'groupBy', 
          'aggregate'
        ].includes(params.action)
    ) {
      
      if (Array.isArray(result)) {
        result.forEach(async (track) => {
          try {
            track.file = await fileBaseUrl(track.file);
            track.video_file = await fileBaseUrl(track.video_file);
            track.cover = await fileBaseUrl(track.cover);
          } catch (error) {
            console.error('Error updating track:', error);
          }
        });
      } else {
        try {
          result.file = await fileBaseUrl(result.file);
          result.video_file = await fileBaseUrl(result.video_file);
          result.cover = await fileBaseUrl(result.cover);
        } catch (error) {
          console.error('Error updating track:', error);
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('Middleware error:', error);
    throw error;
  }
};


exports.discussionComments_middleware = async (params, next) => {
    const result = await next(params);

    // Check if the model is 'DiscussionComments' and the action is relevant
    if (params.model === 'DiscussionComments' &&
        [
            'findUnique',
            'findMany',
            'findFirst',
            'groupBy',
            'aggregate'
        ].includes(params.action)
    ) {
        // Handle multiple results (findMany, aggregate, groupBy)
        if (Array.isArray(result)) {
            await Promise.all(result.map(async (comment) => {
                if (comment.user) {
                    // Modify the profile_photo of the nested user
                    comment.user.profile_photo = await fileBaseUrl(comment.user.profile_photo);
                }
                if (comment.likes) {
                  // Modify the profile_photo of the nested user
                  comment.likedByUser = comment.likes.length > 0 ? true : false;
                  delete comment.likes;
                }
            }));
        } else {
            // Handle a single result (findUnique, findFirst)
            if (result.user) {
                // Modify the profile_photo of the nested user
                result.user.profile_photo = await fileBaseUrl(result.user.profile_photo);
            }
            if (result.likes) {
              // Modify the profile_photo of the nested user
              result.likedByUser = result.likes.length > 0 ? true : false;
              delete result.likes;
            }
        }
    }

    return result;
};

//       [
//         'findUnique', 
//         'findMany', 
//         'findFirst', 
//         'groupBy', 
//         'aggregate'
//       ].includes(params.action)
//   ) {
//     if (Array.isArray(result)) {
//       result.forEach(async (track) => {
//         track.file = await fileBaseUrl(track.file);
//         track.video_file = await fileBaseUrl(track.video_file);
//         track.cover =  await fileBaseUrl(track.cover);
//       });
//     } else {
//       result.file = await fileBaseUrl(result.file);
//       result.video_file = await fileBaseUrl(result.video_file);
//       result.cover = await fileBaseUrl(result.cover);
//     }
//   }

//   return result;
// };