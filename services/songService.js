const prisma = require('../prisma/client');
const multer = require('multer');
const formidable = require('formidable');
const path = require('path');
const {processPath, extractDynamicPart} = require('../utils/file');
const file_config = require('../config/filesystem');
const file_disks = file_config.storage;
// const fs = require('fs');
const fs = require('fs-extra');
const {creatorCast} = require('../utils/auth');
const { excludeCast} = require('../utils/generic');
const {songCast, removeTrackLinks} = require('../utils/songs')
const {removeDiskPath} = require('../utils/file');
const {slugify} = require('../utils/generic');
const { stat } = require('fs');
const { moveTrackFileToCloudinary, handleCloudinaryUpload, uploadToCloudinary } = require('./fileService');
const { log } = require('console');

exports.createAlbum = async (req, res) => {
  try {
    const album = await prisma.albums.create({
      data:{
        title: req.body.title,
        slug: await slugify(req.body.title),
        user_id:req.user.id,
        description:req.body.description,
        release_date: req.body.release_date
      },
    })

    return res.status(200).json({
      status:"success",
      message:"New Album Created",
      album_id: album.id
    })
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status:"fail",
      message:"Failed to create Album",
      error:error
    })
  }
}

exports.handleAlbumCover = async (req, directory, res) => {
  if (req.file) {
    const disk = process.env.ACTIVE_DISK;
    let filePath;
    try {
      if (disk === 'cloudinary') {
        filePath = await uploadToCloudinary(req, directory); 
      } else {
          filePath = req.file.path;
      }
          
      const cover_path = disk == 'cloudinary' ? await extractDynamicPart(filePath) : filePath
      const update_album = await this.updateAlbum(req.body.album_id, {cover:cover_path});
      if(update_album.status){
        return res.status(200).json({
          status: 'success',
          message: "Track cover photo updated",
          album_id: req.body.album_id
        });
      }else{
        return res.status(400).json({
          status: 'fail',
          message: update_album.message,
          error:update_album.error
        });
      }
    }catch (error) {
      console.error(error);
      return res.status(200).json({
        status: 'fail',
        message: 'Track cover update failed',
        error: error,
      });
    }
  }else {
    res.send('No file uploaded.');
  }
}

exports.updateAlbum = async (album_id, album_data) => {
  try {
    
    // Find the track by ID
    const album = await prisma.albums.findUnique({
      where: {
        id: parseInt(album_id)
      }
    });

    if (!album) {
     
      return {
        status: false,
        error: "Album not found"
      };
    }
    if(album.cover && album_data.cover){
      if (process.env.ACTIVE_DISK === 'cloudinary') {
        const publicId = track.cover.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } else if (process.env.ACTIVE_DISK === 'local') {
        // Delete local file
        if (fs.existsSync(`./public/uploads/album_covers/${track.cover}`)) {
          fs.unlinkSync(`./public/uploads/album_covers/${track.cover}`);
        }
      }
    }
    const updatedalbum = await prisma.albums.update({
      where: {
        id: parseInt(album_id)
      },
      data: album_data
    });

    return {
      status: true,
      message: 'Album updated successfully',
      data: updatedalbum
    };

  } catch (error) {
    console.log(error);
    return {
      status: false,
      error: error.message || "An error occurred"
    };
  }
};

exports.getArtistAlbums = async (artiste_id, res) => {
  try {
    const albums = await prisma.albums.findMany({
      where: {
        user_id: parseInt(artiste_id)
      }
    });
    return res.status(200).json({
      status:"success",
      data:albums
    })
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status:"fail",
      error:error,
      message:"Something went wrong"
    })
  }
}
exports.create = async(song_data, user) => {
    try {
      if(typeof song_data.featured != 'object' ){
        return {
          status: false,
          error:"featured field must be an array"
        }
      }
        const genres = song_data.genres;
        delete song_data.genres;
        song_data.featured = typeof song_data.featured == 'object' ? song_data.featured.toString() : NULL ;
        song_data.user_id = user.id;
        song_data.slug = await slugify(song_data?.title);
        const add_song_data = await prisma.tracks.create({
            data: song_data
        });
        if(add_song_data){
          
          genres.forEach(async (genre) => {
            
            await prisma.tracktogenres.create({
              data: {
                track_id:add_song_data.id,
                genre_id: parseInt(genre)
              }
            });
            
          });

          return {
            status: true,
            message:'track added successfully',
            data: add_song_data
          }
        }  
    } catch (error) {
      console.log(error);
      
      return {
        status: false,
        error:error
      }
      
    }
}

exports.addTrackCoverPhoto = async (track_id, file, res) => {

    const cover_path = await processPath(file);
    const update_track = await this.update(track_id, {cover:cover_path});
      // console.log(update_track);
    
    if(update_track.status){
      
      return res.status(200).json({
        status: 'success',
        message: "cover photo updated"
      });
    }else{

      return res.status(400).json({
        status: 'fail',
        message: update_track.message,
        error:update_track.error
      });
    }
  
  
}

exports.handleTrackCover = async (req, directory, res) => {
  if (req.file) {
    const disk = process.env.ACTIVE_DISK;
    let filePath;
    try {
      if (disk === 'cloudinary') {
        filePath = await uploadToCloudinary(req, directory); 
      } else {
          filePath = req.file.path;
      }
          
      const cover_path = disk == 'cloudinary' ? await extractDynamicPart(filePath) : filePath
      const update_track = await this.update(req.body.track_id, {cover:cover_path});
      if(update_track.status){
        return res.status(200).json({
          status: 'success',
          message: "Track cover photo updated"
        });
      }else{
        return res.status(400).json({
          status: 'fail',
          message: update_track.message,
          error:update_track.error
        });
      }
    }catch (error) {
      console.error(error);
      return res.status(200).json({
        status: 'fail',
        message: 'Track cover update failed',
        error: error,
      });
    }
  }else {
    res.send('No file uploaded.');
  }
}




exports.update = async (track_id, song_data) => {
  try {
    // Find the track by ID
    const track = await prisma.tracks.findUnique({
      where: {
        id: parseInt(track_id)
      }
    });

    if (!track) {
     
      return {
        status: false,
        error: "Track not found"
      };
    }

    console.log(song_data);
    // Remove fields that are not supposed to be updated
    song_data = await excludeCast(song_data, songCast);
    
    const genres = song_data.genres; // Save potential genres

    if (genres) {
      delete song_data.genres; // Remove genres from song_data for the update

      // Delete existing genre associations
      await prisma.tracktogenres.deleteMany({
        where: {
          track_id: track_id,
        }
      });

      // Add new genre associations
      for (const genre of genres) {
        await prisma.tracktogenres.create({
          data: {
            track_id: track_id,
            genre_id: parseInt(genre)
          }
        });
      }
    }
    
    // If there are still fields in song_data to update
    if (Object.keys(song_data).length > 0) {
      console.log('updating');
      
      const updatedTrack = await prisma.tracks.update({
        where: {
          id: parseInt(track_id)
        },
        data: song_data
      });

      return {
        status: true,
        message: 'Track updated successfully',
        data: updatedTrack
      };
    }

    return {
      status: true,
      message: 'Track updated successfully, but no song data provided for update'
    };

  } catch (error) {
    console.log(error);
    return {
      status: false,
      error: error.message || "An error occurred"
    };
  }
};


exports.addTrackFile = async (req, res, disk = 'local', type='audio') => {
  console.log("type", type);
  
  const { originalname, chunkIndex, totalChunks, track_id } = req.body;
  const tempPath = req.file.path;
  let uploadDir = file_disks[disk]['root'];
  let tempUploadDir = path.join(uploadDir, "tracks");
  const finalPath = path.join(tempUploadDir, originalname);

  // Ensure the upload directory exists
  await fs.ensureDir(tempUploadDir);

  // Append the chunk to the final file
  fs.appendFileSync(finalPath, fs.readFileSync(tempPath));

  // Remove the temporary chunk file
  await fs.remove(tempPath);

  // Check if this is the last chunk
  if (parseInt(chunkIndex) === parseInt(totalChunks) - 1) {
    // Rename the file after the final chunk is uploaded
    const newFileName = `${Date.now()}_${originalname}`;
    let newFilePath = path.join(tempUploadDir, newFileName);

    try {
      await fs.rename(finalPath, newFilePath);
      console.log(`File renamed to: ${newFileName}`);
      if(disk = 'cloudinary'){
        console.log('uploading to cloudinary');
        
        newFilePath = await moveTrackFileToCloudinary(newFilePath, 'tracks');
      }

      // Optionally, you can do something with the final file here
      const songFile = disk == 'local' ? 
      await removeDiskPath(newFilePath) : 
      await extractDynamicPart( newFilePath)
      console.log("sing file: "+songFile);
      
      // console.log(`Upload completed: ${songFile}`);

      // Update the track in the database with the new file path
      let save_file_on_db = '';
      if(type === 'audio'){
        save_file_on_db = await this.update(track_id, { file: songFile });
      }

      if(type === 'video'){
        save_file_on_db = await this.update(track_id, { video_file: songFile });
      }
      

      if (save_file_on_db.status) {
        return res.status(200).json({
          status: 'success',
          message: "Chunk uploaded and file renamed",
          completed: true,
          file_path: newFilePath,
        });
      } else {
        return res.status(200).json({
          status: 'fail',
          error: save_file_on_db.error,
        });
      }
    } catch (error) {
      console.error("Error renaming file:", error);
      return res.status(500).json({
        status: 'error',
        error:error,
        message: 'Failed to rename the file after upload.',
      });
    }
  }

  let percentage_upload = 100 * ((parseFloat(chunkIndex) + 1) / parseFloat(totalChunks));
  console.log("Upload progress: " + Math.round(percentage_upload) + "%");

  // Return chunk upload success response
  return res.status(200).json({
    status: 'success',
    message: "Chunk uploaded",
    completed: false,
  });
};


exports.list = async (parsedUrl, user, res) => {
  try {
    const queryString = parsedUrl.query;
    const query = {};
    let where = {};
    where.approved = true;
    if (queryString.creator_id) {
      where.user_id = parseInt(queryString.creator_id);
    }

    if (queryString.genre && queryString?.genre !== 'all') {
      where.genres = { some: { genre: { id: parseInt(queryString.genre) } } };
    }

    // Check for the 'like' query string
    if (queryString.like && queryString.like === 'true') {
      // If authenticated user is present, filter by liked tracks
      if (user) {
        where.likes = { some: { user: { id: parseInt(user.id) } } };
      } else {
        // Handle case where user is not authenticated (return empty list)
        return res.status(200).json({
          status: 'success',
          data: { tracks: [], meta: { total: 0, page: 1, last_page: 1, page_size: 10, nextPage: null } }
        });
      }
    }

    // exclude tracks where both "file" and "video_file" fields are NULL or empty at the same timee
    where.OR = [
      { file: { not: null } },
      { video_file: { not: null } },
    ];

    query.where = where;

    if (queryString.latest && queryString.latest === 'true') {
      query.orderBy = { id: 'desc' };
    }

    const page = queryString.page ? parseInt(queryString.page) : 1;
    console.log("page: " + page);
    
    const page_size = parseInt(process.env.TRACK_PER_PAGE);

    query.skip = (page - 1) * page_size;
    query.take = page_size;

    // Include user details (creator of the track)
    query.include = {
      artiste: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          profile_photo: true,
        },
      },
    };

    const tracks = await prisma.tracks.findMany(query);
    if (tracks) {
      const totalTracksCount = await prisma.tracks.count({ where });
      const totalPages = Math.ceil(totalTracksCount / page_size);
      const paginatedResult = {
        tracks: tracks,
        meta: {
          total: totalTracksCount,
          page,
          last_page: totalPages,
          page_size,
          nextPage: page === totalPages ? null : page + 1,
        },
      };
      return res.status(200).json({
        status: 'success',
        data: paginatedResult,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status: 'fail',
      error: error,
      message: 'Could not fetch tracks.',
    });
  }
};

  exports.guest_list = async (parsedUrl, user, res) => {
    try {
      const queryString = parsedUrl.query;
      const query = {};
      let where = {};

      if (queryString.creator_id) {
        where.user_id = parseInt(queryString.creator_id);
      }

      if (queryString.genre && queryString?.genre !== 'all') {
        where.genres = { some: { genre: { id: parseInt(queryString.genre) } } };
      }

      // Check for the 'like' query string
      if (queryString.like && queryString.like === 'true') {
        // If authenticated user is present, filter by liked tracks
        if (user) {
          where.likes = { some: { user: { id: user.id } } };
        } 
      }

      query.where = where;

      if (queryString.latest && queryString.latest === 'true') {
        query.orderBy = { id: 'desc' };
      }

      const page = queryString.page ? parseInt(queryString.page) : 1;
      const page_size = parseInt(process.env.TRACK_PER_PAGE);

      query.skip = (page - 1) * page_size;
      query.take = page_size;

      // Include user details (creator of the track)
      query.include = {
        artiste: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            profile_photo: true,
          },
        },
      };

      const tracks = await prisma.tracks.findMany(query);
      if (tracks) {
        const sanitizedTracks = removeTrackLinks(tracks)
        // tracks.map(track => {
        //   const { file, video_file, ...rest } = track; // Exclude the 'file' property
        //   return rest;
        // });
        const totalTracksCount = await prisma.tracks.count({ where });
        const totalPages = Math.ceil(totalTracksCount / page_size);
        const paginatedResult = {
          tracks: sanitizedTracks,
          meta: {
            total: totalTracksCount,
            page,
            last_page: totalPages,
            page_size,
            nextPage: page === totalPages ? null : page + 1,
          },
        };
        return res.status(200).json({
          status: 'success',
          data: paginatedResult,
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        status: 'fail',
        error: error,
        message: 'Could not fetch tracks.',
      });
    }
  };


exports.creators = async (req, res) => {
  try {
    console.log(req.user);
    const where = req.user ? {is_artise: true, NOT: { id: req.user?.id } } : {is_artise: true}
    const allCreators = await prisma.users.findMany({
      where: where,
      include: {
        socialProfiles: {
          select: {
            id: true,
            url: true,
            social: {
              select: {
                title: true,
                logo: true,
                slug: true,
              },
            },
          },
        },
        _count: {
          select: {
            followers: true, // Counting the followers
          },
        },
      },
    });

    if (allCreators.length) {
      const formattedCreators = await Promise.all(
        allCreators.map(async (creator) => {
          const formattedCreator = await excludeCast(creator, creatorCast);
          return formattedCreator;
        })
      );

      return res.status(200).json({
        status: 'success',
        data: formattedCreators,
      });
    } else {
      // Handle empty creators case (optional)
      return res.status(200).json({
        status: 'success',
        data: [], // Empty array
        message: 'No creators found', // Informative message
      });
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error', // Generic error message for user
    });
  }
};


exports.genres = async (res) => {
  return res.status(200).json({
    status:'success',
    data:await prisma.genres.findMany({})
  });
}
// exports.likeTrack = async (req_data, res) => {
//   const {track_id, user_id} = req_data
//   // const {user_id} = req.user.id;
//   try {
//     let message = "";
//     const existingLike = await prisma.tracklike.findMany({
//       where: { track_id, user_id },
//     });

//     if (existingLike.length > 0) {
//        await prisma.tracklike.deleteMany({
//         where: { track_id, user_id },
//       });
//       message = "unliked";
//       // return res.status(200).json({status:"success", message: 'unliked' });
//     }else{
//       await prisma.tracklike.create({
//         data: { track_id, user_id },
//       });
    
//       message = "liked";
//       // return res.status(200).json({status:"success", message: 'liked', data:likedtracks });
//     }

//     const likedtracks = await prisma.tracklike.findMany({
//       where: { user_id },
//     }).map((track) => {
//       return {track_id: track.track_id}
//     });
  

//     return res.status(200).json({status:"success", message: message, data:likedtracks });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'Error liking track' });
//   }
// }


exports.likeTrack = async (req_data, res) => {
 
  const track_id = parseInt(req_data.track_id);
  const user_id =  parseInt(req_data.user_id);
  // console.log(track_id, user_id);
  
  try {
    const existingLike = await prisma.tracklike.findFirst({
      where: { track_id:track_id, user_id:user_id },
    });
    let message ="";
    if (existingLike) {
      await prisma.tracklike.delete({
        where: { id:existingLike.id },
      });
      message = "unliked";
    } else {
      await prisma.tracklike.create({
        data: { track_id, user_id },
      });
      message = "liked";
    }

    const likedtracks = await prisma.tracklike.findMany({
      where: { user_id: user_id },
      select: { track_id:true },
    });

    return res.status(200).json({ status: "success", message, data: likedtracks });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error liking track' });
  }
};

exports.tracksList = async (options, user, selected_track_id, res) => {
  try {
    // Construct filters
    const where = {
      approved: true,
      id: {
        not: parseInt(selected_track_id),
      },
    };

    if (options.creator_id) {
      where.user_id = parseInt(options.creator_id);
    }

    if (options.genre && options.genre !== 'all') {
      where.id = {
        in: await prisma.tracktogenres.findMany({
          where: { genre_id: parseInt(options.genre) },
          select: { track_id: true },
        }).then((res) => res.map((row) => row.track_id)),
      };
    }

    if (options.like && user) {
      where.id = {
        in: await prisma.tracklike.findMany({
          where: { user_id: user.id },
          select: { track_id: true },
        }).then((res) => res.map((row) => row.track_id)),
      };
    }

    // Use Prisma's findMany to get the tracks
    const tracks = await prisma.tracks.findMany({
      where,
      include: {
        artiste: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            profile_photo: true,
          },
        },
      },
      orderBy: options.latest
        ? { created_at: 'desc' }
        : { id: 'asc' }, // For randomization, consider adding custom order logic
      take: 50,
    });

    const totalTracksCount = await prisma.tracks.count({
      where,
    });

    // Format response
    const formattedTracks = tracks.map((track) => ({
      id: track.id,
      title: track.title,
      user_id: track.user_id,
      slug: track.slug,
      duration: track.duration,
      cover: track.cover,
      file: track.file,
      album_id: track.album_id,
      release_date: track.release_date,
      featured: track.featured,
      about: track.about,
      created_at: track.created_at,
      updated_at: track.updated_at,
      artiste: {
        id: track.artiste.id,
        first_name: track.artiste.first_name,
        last_name: track.artiste.last_name,
        email: track.artiste.email,
        profile_photo: track.artiste.profile_photo,
      },
    }));

    const paginatedResult = {
      tracks: formattedTracks,
      meta: {
        total: totalTracksCount + 1, // Adding 1 for the excluded track
        page: 1,
        last_page: 1,
        page_size: 10,
        nextPage: null,
      },
    };

    return res.status(200).json({
      status: 'success',
      data: paginatedResult,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status: 'fail',
      error,
      message: 'Could not fetch tracks.',
    });
  }
};





exports.playTrack = async (trackId, parsedUrl, user, res) => {
  
  const queryString = parsedUrl.query;
  
  let option = {}
  if (queryString.list_type) {
    switch (queryString.list_type) {
      case "artiste":
          option.creator_id = queryString.value
        break;
      case "genre":
          option.genre = queryString.value
        break;
      case "recent_release":
          option.latest = queryString.value
        break;
      default:
        break;
    }
  }
 
  return this.tracksList(option, user, trackId, res)
 
}

exports.playTrackBySlug = async (slug, res) => {
  const track = await prisma.tracks.findFirst({
    where: {
      slug: slug
    }
   });

  if (!track) {
    return res.status(404).json({
      status: "fail",
      message: "Track not found",
    });
  }
 
  return res.status(404).json({
    status: "success",
    track: track,
  });
  
}



exports.recordPlayback = async (user, track_id, type, res) => {
  const recordPlay = await prisma.tracklisten.create({
    data: {
      user_id: user.id,
      track_id: parseInt(track_id),
      duration: 0,
      type: type,
      status: "playing",
    },
  });

  if(recordPlay){ 
    return res.status(200).json({
      status: "success",
      playback_id: recordPlay.id
    })
  }
  
};

exports.updatePlayDuration = async (user, track_id, play_id, duration, res) => {

  const existingPlay =  await prisma.tracklisten.findFirst({
    where:{
        user_id:user.id,
        track_id:parseInt(track_id),
        id: parseInt(play_id),
       
    }

  })
  if(existingPlay){
    await prisma.tracklisten.update({
      where: {
        id: existingPlay.id, // Using the fetched item's ID
      },
      data: {
        duration: parseInt(existingPlay.duration) + parseInt(duration),
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Playback duration updated successfully',
    })
  }else{
    return res.status(404).json({
      status: 'fail',
      message: 'Playback instance not found',
    })
  }
    // await prisma.tracklisten.create({
    //     data: {
    //       user_id: user.id,
    //       track_id: track_id,
    //       duration: 0,
    //       status: "playing", // Updating the status
    //     },
    //   });
}

   


exports.updatePlayStatus = async (user, track_id, play_id, status, res) => {

 const existingPlay =  await prisma.tracklisten.findFirst({
    where:{
        user_id:user.id,
        track_id:parseInt(track_id),
        id: parseInt(play_id),
    }

  })
  if(existingPlay){
    await prisma.tracklisten.update({
      where: {
        id: existingPlay.id, // Using the fetched item's ID
      },
      data: {
        status: status,
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Playback status updated successfully',
    })
  }else{
    return res.status(404).json({
      status: 'fail',
      message: 'Playback instance not found',
    })
  }
}

exports.createPlaylist = async (req, res) => {
  try {
    const new_playlist = await prisma.playlists.create({
      data:{
        owner_id: req.user.id,
        title: req.body.title,
        description: req.body.description,
      }
    })

    if(new_playlist){

    }

    // if(new_playlist){
      return res.status(200).json({
        status:"success",
        playlist: new_playlist,
        message:"Playlist successfully created"
      })
    // }
    
  } catch (error) {
    
    return res.status(400).json({
      status:"fail",
      error: error,
      message:"Failed to create Playlist"
    })
  }
  
}

exports.addTracksToPlayList = async (req_data, res) => {
    
  const track_ids = req_data.track_ids;
  const playlist_id = parseInt(req_data.playlist_id);
  const user_id =  parseInt(req_data.user_id);
  
  try {
    
    const playList = await prisma.playlists.findFirst({
      where: { id:playlist_id, owner_id:user_id },
      include:{
        tracks: true,
      }
    });
    if(!playList){
      return res.status(404).json({ status: "fail", message:"Playlist not found" });
    }
    
    playListTrackIds = playList.tracks.map(track => track.track_id)
    
    track_ids.forEach( async track_id => {
      if(!playListTrackIds.includes(track_id)){
        await prisma.playlisttracks.create({
          data:{
            playlist_id: playlist_id,
            track_id:track_id,
          }
        })
      }
    });

    return res.status(200).json({ status: "success", message:"song added to playlist "+playList.title });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error adding song to playlist' });
  }
};

exports.removeTracksToPlayList = async (req_data, res) => {
    
  const track_ids = req_data.track_ids;
  const playlist_id = parseInt(req_data.playlist_id);
  const user_id =  parseInt(req_data.user_id);
  
  try {
    
    const playList = await prisma.playlists.findFirst({
      where: { id:playlist_id, owner_id:user_id },
    });
    if(!playList){
      return res.status(404).json({ status: "fail", message:"Playlist not found" });
    }
    
    await prisma.playlisttracks.deleteMany({
      where: {
        playlist_id:playList.id,
        track_id: {
          in: track_ids, 
        },
      },
    })
    

    return res.status(200).json({ status: "success", message:"song removed from playlist "+playList.title });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error removing song to playlist' });
  }
};

exports.deletePlaylist = async (id, user_id, res) => {
  try {
    const playlist = await prisma.playlists.findFirst({
      where: {
        id: id,
        owner_id: user_id
      }
    });

    if (!playlist) {
      return res.status(200).json({
        status: 'fail',
        message: "Playlist does not exist or you are not authorised to modify the playlist"
      });
    }

    // Delete associated tracks first
    await prisma.playlisttracks.deleteMany({
      where: {
        playlist_id: parseInt(id),
      }
    });

    // Delete the playlist after deleting tracks
    await prisma.playlists.delete({
      where: {
        id: parseInt(id)
      }
    });

    // Send success response after deleting the playlist
    return res.status(200).json({
      status: 'success',
      message: "Playlist deleted"
    });

  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status: 'fail',
      message: "Something went wrong",
      error: error
    });
  }
}


exports.myPlaylists = async (req, res) => {
  try {
    const playlists = await prisma.playlists.findMany({
      where:{
        owner_id:req.user.id,
      },
      include:{
        tracks:{
          include:{
            track:true
          }
        }
        
      }
    });

    return  res.status(200).json({
      status:"success",
      data: playlists,
    })
  } catch (error) {
    console.log(error);
    
    return  res.status(400).json({
      status:"fail",
      error: error,
      message: "Error getting playlist"
    })
  }
  
}

exports.reorderPlaylist = async (playlist_id, user_id, track_ids, res) => {
  try {
    const playList = await prisma.playlists.findFirst({
      where: { id:playlist_id, owner_id:user_id },
    });
    if(!playList){
      return res.status(404).json({ status: "fail", message:"Playlist not found" });
    }
    
    
    await prisma.playlisttracks.deleteMany({
      where: {
        playlist_id:playList.id,
        track_id: {
          in: track_ids, 
        },
      },
    });

    track_ids.forEach( async track_id => {
        await prisma.playlisttracks.create({
          data:{
            playlist_id: playlist_id,
            track_id:track_id,
          }
        })
    });
    
    return res.status(200).json({ status: "success", message:"playlist reordered successfully" });
  } catch (error) {
    console.log(error);
    
    return  res.status(400).json({
      status:"fail",
      error: error,
      message: "Something went wrong"
    })
  }
  
}

exports.trendingTracks = async (req, res) => {
  try {
    const page_size = parseInt(process.env.TRACK_PER_PAGE);
    const page = parseInt(req.query.page) || 1;

    const query = {
      skip: (page - 1) * page_size,
      take: page_size,
      orderBy: {
        listens: {
          _count: 'desc',
        },
      },
      where: {
        approved:true,
        listens: {
          some: {
            created_at: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
      },
    };

    const tracks = await prisma.tracks.findMany({
      ...query
    });

// ... rest of your pagination logic

    if (tracks) {
      const sanitizedTracks = req.user ? tracks : await removeTrackLinks(tracks)
      const totalTracksCount = await prisma.tracks.count({ where: query.where });
      const totalPages = Math.ceil(totalTracksCount / page_size);

      const paginatedResult = {
        tracks: sanitizedTracks,
        meta: {
          total: totalTracksCount,
          page,
          last_page: totalPages,
          page_size,
          nextPage: page === totalPages ? null : page + 1,
        },
      };

      return res.status(200).json({
        status: 'success',
        data: paginatedResult,
      });
    } else {
      return res.status(404).json({
        status: 'error',
        message: 'No trending tracks found',
      });
    }
  } catch (error) {
    log(error);
    return  res.status(400).json({
      status:"fail",
      error: error,
      message: "Something went wrong"
    })
  }
  
}


exports.topArtistes = async (res) => {
  try {
    const trendingArtistes = await prisma.tracks.findMany({
      where: {
        listens: {
          some: {
            created_at: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
      },
      groupBy: {
        user_id: true,
      },
      _count: {
        user_id: true,
      },
      orderBy: {
        _count: {
          _all: 'desc',
        },
      },
      take: 15, // Adjust to the desired number of trending artistes
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            profile_photo: true,
            is_artise: true,
            include: {
              socialProfiles: {
                select: {
                  id: true,
                  url: true,
                  social: {
                    select: {
                      title: true,
                      logo: true,
                      slug: true,
                    },
                  },
                },
              },
              _count: {
                select: {
                  followers: true, // Counting the followers
                },
              },
            },
          },
        },
      },
    });

    if(trendingArtistes){
      return res.status(200).json({
        status:"success",
        data:trendingArtistes
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status:"fail",
      error:error,
      message:"Something went wrong"
    });
  }
  
  
}

// exports.deletePlaylist = async (user_id, playlist_id) => {
//   const delete_list = await prisma.playlists.delete({
//     where:{
//       id:playlist_id,
//       owner_id:user_id
//     }
//   });
//   return delete_list; 
  
// }