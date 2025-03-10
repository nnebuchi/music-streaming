
const prisma = require('../prisma/client');
const argon2 = require('argon2');
const {userCast, creatorCast} = require('../utils/auth');
const { excludeCast} = require('../utils/generic');
const multer = require('multer');
const fs = require('fs');
const {processPath, extractDynamicPart} = require('../utils/file');
const fileService = require('./fileService');


exports.changePassword = async (old_password, new_password, user, res) => {
    try {
        
        const user_db_data = await prisma.users.findFirst({
            where: {email: user.email, deleted_at: null},
            select: { password: true },
        })

        
        const passwordCheck = await argon2.verify(user_db_data.password, old_password);
        
        if(!passwordCheck) {
            return res.status(400).json({ 
                status: 'fail',
                error: "Old password is incorrect"
            });
        }
        const HashedPassword = await argon2.hash(new_password)

        const updatePassword = await prisma.users.update({
            where: {email: user.email},
            data: {password: HashedPassword},
        });

        console.log(updatePassword);

        if(updatePassword) {
            return res.status(200).json({
                status:"success",
                message:"Password updated successfully",
            });
        }
    } catch (error) {
        res.status(400).json({ 
            status: 'fail',
            error: error
        });
    }
}

exports.profile = async (user, res) => {
    try {
        
        // prisma.$middleware(user_middleware);
        const user_data = await prisma.users.findFirst({
            where:{email:user.email, deleted_at: null},
            include: {
                socialProfiles: {
                    select: { id: true, url:true, social_id:true, social:{
                        select: {logo:true, slug:true, title:true}
                    }}
                },
                followers:{
                    select: {follower_id:true}
                },
                artistes:{
                    select: {artiste_id:true}
                },
                likedtracks:{
                    where: { // Corrected here
                        track: {
                          approved: true,
                          deleted_at: null
                        }
                    },
                    include:{
                        track:{ 
                            include: {
                                artiste:{
                                    select: {
                                        id: true,
                                        first_name: true,
                                        last_name: true,
                                        profile_photo: true,
                                        slug:true
                                    }
                                }
                            }
                        }
                    }
                },
                tracks:{
                    where: {
                        deleted_at: null,
                      },
                },
              },
        })
        return res.status(200).json({
            status: "success",
            message: "Profile Fetched",
            data: await excludeCast(user_data, userCast)
        });

    } catch (error) {
        return res.status(400).json({
            status: "fail",
            message: "Request Failed",
            data: error
        });
    }
}

exports.getThirdPartyProfile = async (slug, res) => {
    try {
        
        // prisma.$middleware(user_middleware);
        const user_data = await prisma.users.findFirst({
            where:{slug:slug, deleted_at: null},
            include: {
                socialProfiles: {
                    select: { id: true, url:true, social_id:true, social:{
                        select: {logo:true, slug:true, title:true}
                    }}
                },
                discussions:{
                    where: {
                        deleted_at: null,
                        song_id: null
                      },
                },
                tracks:{
                    where: {
                        deleted_at: null,
                        approved: true
                      },
                },
                followers:{
                    select: {follower_id:true},
                    where:{
                        deleted_at: null
                    }
                },
                artistes:{
                    select: {artiste_id:true},
                    where:{
                        deleted_at: null
                    }
                },
                likedtracks:{
                    select: {track_id:true},
                    where:{
                        deleted_at: null
                    }
                }
              },
        })
        if(!user_data){
            return res.status(404).json({
                status: "fail",
                message: "User not found",
            });
        }
        return res.status(200).json({
            status: "success",
            message: "Profile Fetched",
            data: await excludeCast(user_data, userCast)
        });

    } catch (error) {
        return res.status(400).json({
            status: "fail",
            message: "Request Failed",
            data: error
        });
    }
}


exports.updateProfile = async (req, res) => {
    try {
        const user = await prisma.users.findFirst({
            where: {email: req.user.email, deleted_at: null},
        });
        if(user){
            const request_data = req.body 
            let update_data = {}
            for(let prop in request_data){
                if(prop in user && !userCast.includes(prop)){
                    console.log(prop);
                    
                    update_data[prop] = request_data[prop];
                }
            }

            const updateUser = await prisma.users.update({
                where: {id: user.id},
                data: update_data,
            });

            return res.status(200).json({
                status: "success",
                message: "Profile Updated",
                data: await excludeCast(updateUser, userCast)
            })
        }else{
            return res.status(404).json({
                status: "fail",
                error:"User not found",
                message: "User not found"
            })
        }
    } catch (error) {
        console.log(error);
        
        return res.status(404).json({
            status: "fail",
            error:error,
            message: "Something went wrong"
        })
    }
}

// exports.updateSocials = async (req_user, request_data, res) => {
   
//     try {
//         const user = await prisma.users.findUnique({
//             where: {email: req_user.email}
//         });
//         if(user){
//             const socials = await prisma.socials.findMany();
//             // console.log(request_data);
//             socials.forEach( async social=>{
//                 // console.log(social.slug);
//                 if(social.slug in request_data){
//                     let existing_social = await prisma.usersocialprofiles.findFirst({
//                         where:{
//                             social_id:social.id,
//                             user_id:user.id
//                         }
//                     });
                   
                    
//                     if(existing_social){
//                         //  console.log(existing_social);
//                         await prisma.usersocialprofiles.update({
//                             where:{
//                                 id:existing_social.id
//                             },
//                             data:{
//                                 url:request_data[social.slug]
//                             }
//                         })
//                     }else{
//                         await prisma.usersocialprofiles.create({
//                             data:{
//                                 user_id:user.id,
//                                 social_id:social.id,
//                                 url:request_data[social.slug]
//                             }
//                         })
//                     } 
//                 }
                
//             })

//             await prisma.usersocialprofiles.deleteMany({
//                 where: {
//                   user_id: req_user.id,
//                   url: '' 
//                 }
//               });
              
            

//             return res.status(200).json({
//                 status: "success",
//                 message: "Socials Updated"
//             })
//         }else{
//             return res.status(404).json({
//                 status: "fail",
//                 error:"User not found",
//                 message: "User not found"
//             })
//         }
//     } catch (error) {
//         console.log(error);
        
//         return res.status(400).json({
//             status: "fail",
//             error:error,
//             message: "Request Failed"
//         })
//     }
// }

exports.updateSocials = async (req_user, request_data, res) => {
    try {
        const user = await prisma.users.findFirst({
            where: { email: req_user.email, deleted_at: null }
        });

        if (!user) {
            return res.status(404).json({
                status: "fail",
                message: "User not found"
            });
        }

        const socials = await prisma.socials.findMany();

        // Collect operations to execute them in a batch.
        const operations = [];

        for (const social of socials) {
            if (social.slug in request_data) {
                const socialUrl = request_data[social.slug];

                const existingSocialProfile = await prisma.usersocialprofiles.findFirst({
                    where: {
                        social_id: social.id,
                        user_id: user.id
                    }
                });

                if (existingSocialProfile) {
                    operations.push(
                        prisma.usersocialprofiles.update({
                            where: { id: existingSocialProfile.id },
                            data: { url: socialUrl }
                        })
                    );
                } else {
                    operations.push(
                        prisma.usersocialprofiles.create({
                            data: {
                                user_id: user.id,
                                social_id: social.id,
                                url: socialUrl
                            }
                        })
                    );
                }
            }
        }

        // Handle removal of empty URL profiles in the same transaction.
        operations.push(
            prisma.usersocialprofiles.deleteMany({
                where: {
                    user_id: user.id,
                    url: ''
                }
            })
        );

        // Execute all operations in a transaction
        await prisma.$transaction(operations);

        return res.status(200).json({
            status: "success",
            message: "Socials Updated"
        });

    } catch (error) {
        console.error("Error updating socials:", error);

        return res.status(500).json({
            status: "fail",
            message: "Internal Server Error",
            error: error.message
        });
    }
};

exports.socials = async (user, res) => {
    try {
        // const socials = await prisma.socials.findMany();
        
        const user_socials = await prisma.socials.findMany({
            include: {
              usersocialprofiles: {
                where: { user_id: user.id },
                select: { id: true, url:true, social_id:true}, // Select only the ID from UserSocialProfiles
              },
            },
          });

        return res.status(200).json({
            status:"success",
            data:  user_socials
        });
        
        // user_socials.map((social)=>{
        //     social.url = ``
        // })


    } catch (error) {
        console.log(error);
        return res.status(400).json({
            status:"fail",
            error:error,
            message:"Request Failed"
        });
    }
    
}

exports.deleteAccount = async (req, res) => {
    const now = new Date();

    try {;
        const user = req.user;
        console.log(user);
        
        const { password } = req.body;
        const user_db_data = await prisma.users.findFirst({
            where: {email: user.email, deleted_at: null},
            select: { password: true },
        })

        if(!user_db_data) {
            return res.status(400).json({ 
                status: 'fail',
                error: "User not found"
            });
        }
        
        const passwordCheck = await argon2.verify(user_db_data.password, password);
        // console.log(passwordCheck);
        
        
        if(!passwordCheck) {
            return res.status(400).json({ 
                status: 'fail',
                error: "password is incorrect"
            });
        }
        
        // Start a transaction
        await prisma.$transaction(async (tx) => {
            // Delete from tables with no dependencies first
            await tx.commentlikes.updateMany({ where: { user_id: user.id }, data: { deleted_at: now } });
            await tx.tracklike.updateMany({ where: { user_id: user.id }, data: { deleted_at: now } });
            await tx.tracklisten.updateMany({ where: { user_id: user.id }, data: { deleted_at: now } });
            await tx.discussionlike.updateMany({ where: { user_id: user.id }, data: { deleted_at: now } });
            await tx.playlistsubscribers.updateMany({ where: { user_id: user.id }, data: { deleted_at: now } });
            await tx.artistetofollower.updateMany({
                where: {
                    OR: [{ artiste_id: user.id }, { follower_id: user.id }],
                },
                data: { deleted_at: now },
            });

            // Delete from tables with dependencies next
            await tx.discussioncomments.updateMany({ where: { user_id: user.id }, data: { deleted_at: now } });
            await tx.discussions.updateMany({ where: { user_id: user.id }, data: { deleted_at: now } });
            await tx.orders.updateMany({ where: { user_id: user.id }, data: { deleted_at: now } });
            await tx.transactions.updateMany({ where: { user_id: user.id }, data: { deleted_at: now } });
            await tx.studio_bookings.updateMany({ where: { user_id: user.id }, data: { deleted_at: now } });

            // Handle playlist tracks and playlists
            await tx.playlisttracks.deleteMany({
                where: {
                    playlist: { owner_id: user.id },
                },
            });
            await tx.playlists.updateMany({ where: { owner_id: user.id }, data: { deleted_at: now } });

            // Handle tracks and albums
            await tx.tracks.updateMany({ where: { user_id: user.id }, data: { deleted_at: now } });
            await tx.albums.updateMany({ where: { user_id: user.id }, data: { deleted_at: now } });

            // Delete social profiles
            await tx.usersocialprofiles.updateMany({ where: { user_id: user.id }, data: { deleted_at: now } });

            // Finally, soft delete the user
            await tx.users.update({ where: { id: user.id }, data: { deleted_at: now } });
        });

        console.log(`User with ID ${user.id} and all related instances have been deleted.`);
        return res.status(200).json({ 
            status: 'success',
            message: "Account Deleted"
        });
    } catch (error) {
        console.error(`Error during delete: ${error}`);
        return res.status(400).json({ 
            status: 'fail',
            error: error?.message
        });
    } finally {
        await prisma.$disconnect();
    }
};




// exports.deleteAccount = async (user, res) => {
//     try {
//         const user_db_data = await prisma.users.findUnique({
//             where: {email: user.email}
//         })

//         if(user_db_data) {
//            await prisma.users.delete({
//                 where: {email: user.email}
//               });

//               return res.status(200).json({ 
//                 status: 'success',
//                 error: "Account Deleted"
//             });
//         }else{
//             return res.status(404).json({ 
//                 status: 'fail',
//                 error: "User not found"
//             });
//         }
        

//     } catch (error) {
//         return res.status(400).json({ 
//             status: 'fail',
//             error: error
//         });
//     }
// }



// exports.updateProfilePhoto = async (user, file, res) => {
//     const file_path_on_db = await processPath(file);
//     console.log(file_path_on_db);
    
//     await prisma.users.findFirst({
//        where:{ id:user.id}
//     })
//     .then(user_profile => {
//          prisma.users.update({
//             where:{
//                 id:user.id
//             },
//             data:{
//                 profile_photo:file_path_on_db
//             }
//         })
//         .then(update_user_photo => {
            
//             // delete old photo from folder
//             if(user_profile.profile_photo){
//                 // check of file path exists and delete it
//                 if (fs.existsSync(`./public/${user_profile.profile_photo}`)) {
//                     fs.unlinkSync(`./public/${user_profile.profile_photo}`);
//                 }
                
//             }
//             return res.status(200).json({
//                 status:"success",
//                 message:"Profile Photo Updated",
//                 file:file_path_on_db
//             });
//         })
//     })
//     .catch(err => {
//         console.log(err);
//         return res.status(200).json({
//             status:"fail",
//             message:"Profile Photo update failed",
//             error: err
//         });
//     })

// }

exports.updateProfilePhoto = async (req, directory, res, db_col=null) => {
    
    if (req.file) {
        const disk = process.env.ACTIVE_DISK;
        let filePath;
        try {
            if (disk === 'cloudinary') {
                filePath = await fileService.uploadToCloudinary(req, directory);
                
                
            } else {
                filePath = req.file.path; // or req.file.filename, depending on your setup
            }
            const data = {};
            const user = req.user;
            if(db_col) {
                
                data[db_col] = disk == 'cloudinary' ? await extractDynamicPart(filePath) : filePath
                await prisma.users.update({
                    where: {
                        id: user.id,
                    },
                    data: data
                });
            }
            // Delete old photo
            if (user[db_col] && process.env.ACTIVE_DISK === 'cloudinary') {
              const publicId = user[db_col].split('/').pop().split('.')[0];
              await cloudinary.uploader.destroy(publicId);
            } else if (user[db_col] && process.env.ACTIVE_DISK === 'local') {
              // Delete local file
              if (fs.existsSync(`./public/${user[db_col]}`)) {
                fs.unlinkSync(`./public/${user[db_col]}`);
              }
            }
        
            return res.status(200).json({
              status: 'success',
              message: 'User file Updated',
              file: filePath,
            });
          } catch (error) {
            console.error(error);
            return res.status(200).json({
              status: 'fail',
              message: 'User file update failed',
              error: error,
            });
          }
    } else {
    // No file uploaded
        res.send('No file uploaded.');
    }
    
};

exports.updateCoverPhoto = async (user, file, res) => {
    try {
        if (!file || !file.path) {
            return res.status(400).json({
                status: "fail",
                message: "No file provided"
            });
        }

        let filePathOnDb = file.path.replace(/^public[\\\/]/, "").replace(/\\/g, "/");

        // Fetch the user profile
        const userProfile = await prisma.users.findFirst({ where: { id: user.id } });

        if (!userProfile) {
            return res.status(404).json({
                status: "fail",
                message: "User not found"
            });
        }

        // Update the user's cover photo
        await prisma.users.update({
            where: { id: user.id },
            data: { cover_photo: filePathOnDb }
        });

        // Delete the old cover photo if it exists
        if (userProfile.cover_photo && fs.existsSync(`./public/${userProfile.cover_photo}`)) {
            fs.unlinkSync(`./public/${userProfile.cover_photo}`);
        }

        return res.status(200).json({
            status: "success",
            message: "Cover Photo Updated",
            file: filePathOnDb
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: "fail",
            message: "Profile Photo update failed",
            error
        });
    }
};

exports.getFollowers = async (req, res) => {
    
    const {id} = req.user   
    try {
        const followers = await prisma.artistetofollower.findMany({
            where: {
                artiste_id: id, // ID of the artiste
            },
            include: {
                follower: true, // Get only the listener details
            },
        });
        if(followers){
            const formattedFollowers = await Promise.all(
                followers.map(async (follower) => {
                  const formattedFollower = await excludeCast(follower.follower, creatorCast);
                  return formattedFollower;
                })
              );
            return res.status(200).json({
                status: 'success',
                data: await formattedFollowers,
            }); 
        }
    
    } catch (error) {
        console.log(error);
        
        return res.status(400).json({
            status: 'fail',
            error: error,
        });
    }  
}

exports.getFollowings = async (req, res) => {
    
    const {id} = req.user   
    try {
        const followings = await prisma.artistetofollower.findMany({
            where: {
                follower_id: id, // ID of the artiste
            },
            include: {
                artiste: true, // Get only the listener details
            },
        });
        if(followings){
            const formattedFollowings = await Promise.all(
                followings.map(async (following) => {
                  const formattedFollowing = await excludeCast(following.artiste, creatorCast);
                  return formattedFollowing;
                })
              );
            return res.status(200).json({
                status: 'success',
                data: await formattedFollowings,
            }); 
        }
    
    } catch (error) {
        console.log(error);
        
        return res.status(400).json({
            status: 'fail',
            error: error,
        });
    }  
}
exports.getlikedtracks = async (req, res) => {
    
    const {id} = req.user   
    try {
        const likedtracks = await prisma.tracklike.findMany({
            where: {
                user_id: id, // ID of the artiste
            },
            include: {
                track: true, // Get only the listener details
            },
        });
        if(likedtracks){
            // const formattedFollowings = await Promise.all(
            //     likedtracks.map(async (likedTrack) => {
            //       const formattedFollowing = await excludeCast(following.artiste, creatorCast);
            //       return formattedFollowing;
            //     })
            //   );
            return res.status(200).json({
                status: 'success',
                data: await likedtracks,
            }); 
        }
    
    } catch (error) {
        console.log(error);
        
        return res.status(400).json({
            status: 'fail',
            error: error,
        });
    }  
}


exports.toggleNotification = async (req) => {
    try {
        const update = await prisma.users.update({
            where:{
                id:req.user.id
            },
            data:{
                receive_notification:req.body.notification_status
            }
        });
        if(update){
            return {
                status:true
            }
        }
    } catch (error) {
        console.log(error);
        return {
            status:false,
            error:error
        }
    }
    
    
}