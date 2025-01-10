const {fileBaseUrl} = require('../utils/file');
/*exports.user_middleware = async (params, next) => {
  
  
    const result = await next(params);
  
    if (params.model === 'users' && 
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

*/
exports.user_middleware = async (params, next) => {
  
  const result = await next(params);

  const processUser = async (user) => {
    if (user) {
      user.profile_photo = await fileBaseUrl(user.profile_photo);
      user.cover_photo = await fileBaseUrl(user.cover_photo);
    }
  };

  // const processNestedInclude = async (include) => {
  //   for(prop in include){
  //     if(include[prop] && include[prop].user){
  //       await processUser(include[prop].user);
  //     }else if(include[prop] && include[prop].author){
  //       await processUser(include[prop].author);
  //     }
  //   }
  // }

  if (
    params.model === 'users' ||
    (params.args && params.args.include && (params.args.include.user || params.args.include.author || (params.args.include.replies && params.args.include.replies.include && params.args.include.replies.include.user)))

  ) {
    if (params.model === 'users') {
      // Directly processing users model
      if (Array.isArray(result)) {
        await Promise.all(result.map(processUser));
      } else {
        await processUser(result);
      }
    } 
    if (params.args.include.user) {
      // Handling included 'user' relationship
      if (Array.isArray(result)) {
        await Promise.all(
          result.map(async (item) => {
            if (item.user) {
              await processUser(item.user);
            }
          })
        );
      }else if (result && result.user) {
        await processUser(result.user);
      }
    }
    if (params.args.include.author) {
      // Handling included 'author' relationship
      if (Array.isArray(result)) {
        await Promise.all(
          result.map(async (item) => {
            if (item.author) {
              await processUser(item.author);
            }
          })
        );
      }else if (result && result.author) {
        await processUser(result.author);
      }
    }
    if(params.args.include.replies && params.args.include.replies.include.user){
      
      if (Array.isArray(result)) {
        await Promise.all(
          result.map(async (item) => {
            await Promise.all(
              item.replies.map(async (reply) => {
                await processUser(reply.user);
              })
            )
            
          })  
        );
      }else if (result && result.replies && result.replies.include && result.replies.include.user) {
        await Promise.all(
          result.replies.map(async (reply) => {
            await processUser(reply.user);
          })
        )
      }
    }
  }

  return result;
};

/*exports.song_middleware = async (params, next) => {
  try {
    const result = await next(params);

    if (params.model === 'tracks' && 
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
};*/


exports.song_middleware = async (params, next) => {
  try {
    const result = await next(params);
    
    const processTracks = async (tracks) => {
      
      if (Array.isArray(tracks)) {
        // Process multiple tracks
        for (const track of tracks) {
          try {
            track.file = await fileBaseUrl(track.file);
            track.video_file = await fileBaseUrl(track.video_file);
            track.cover = await fileBaseUrl(track.cover);
          } catch (error) {
            console.error('Error updating track:', error);
          }
        }
      } else if (tracks) {
        // Process a single track
        try {
          tracks.file = await fileBaseUrl(tracks.file);
          tracks.video_file = await fileBaseUrl(tracks.video_file);
          tracks.cover = await fileBaseUrl(tracks.cover);
        } catch (error) {
          console.error('Error updating track:', error);
        }
      }
    };

    // Check if the current model is 'tracks' or if 'tracks' is included in a relation
    if (
      params.model === 'tracks' ||
      (params.args && params.args.include && (params.args.include.tracks || (params.args.include.likedtracks  && params.args.include.likedtracks.include && params.args.include.likedtracks.include.track) ))
    ) {
      
      if (params.model === 'tracks') {
        // Directly processing tracks model
        await processTracks(result);
      } 
      if (params.args.include.tracks) {
        // Handling included 'tracks' relationship
        if (Array.isArray(result)) {
          // Process each item in the result array
          for (const item of result) {
            if (item.tracks) {
              await processTracks(item.tracks);
            }
          }
        } else if (result && result.tracks) {
          // Process the included tracks in a single result object
          await processTracks(result.tracks);
        }
      }
      if(params.args.include.likedtracks  && params.args.include.likedtracks.include && params.args.include.likedtracks.include.track){
         
        if (Array.isArray(result)) {
          // Process each item in the result array
          for (const item of result) {
            console.log(item.likedtracks);
            
            if (item.likedtracks) {
              for (const likedTrack of item.likedtracks) {
                
                if (likedTrack.track) {
                  await processTracks(likedTrack.track);
                }
              }
             
            }
          }
        } else if (result && result.likedtracks) {
          for (const likedTrack of result.likedtracks) {
            
            if (likedTrack.track) {
              await processTracks(likedTrack.track);
            }
          }
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
    if (params.model === 'discussioncomments' &&
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

exports.slider_middleware = async (params, next) => {
  
  
  const result = await next(params);

  if (params.model === 'sliders' && 
      [
        'findUnique', 
        'findMany', 
        'findFirst', 
        'groupBy', 
        'aggregate'
      ].includes(params.action)
  ) {
    if (Array.isArray(result)) {
      result.forEach(async (slider) => {
        slider.file = await fileBaseUrl(slider.file);
      });
    } else {
      result.file = await fileBaseUrl(result.file);
    }
  }

  return result;
};

exports.product_middleware = async (params, next) => {
  const result = await next(params);

  // Check if the current model is 'product_photos' or if 'product_photos' is included in a relation
  if (
    params.model === 'product_photos' ||
    (params.args && params.args.include && params.args.include.product_photos)
  ) {
    const processPhotos = async (photos) => {
      if (Array.isArray(photos)) {
        // Process multiple product photos
        for (const photo of photos) {
          photo.file = await fileBaseUrl(photo.file);
        }
      } else if (photos) {
        // Process a single product photo
        photos.file = await fileBaseUrl(photos.file);
      }
    };

    if (params.model === 'product_photos') {
      // Directly processing product_photos model
      await processPhotos(result);
    } else if (params.args.include.product_photos) {
      // Handling included 'product_photos' relationship
      if (Array.isArray(result)) {
        // Process each item in the result array
        for (const item of result) {
          if (item.product_photos) {
            await processPhotos(item.product_photos);
          }
        }
      } else if (result && result.product_photos) {
        // Process the included product_photos in a single result object
        await processPhotos(result.product_photos);
      }
    }
  }

  return result;
};



