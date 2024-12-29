const prisma = require('../prisma/client');

exports.addFollower = async (req, res) => {
    try {
        const { creator_id } = req.body;
        
        const user = req.user;

        // Check if the user is already following the creator
        const existingFollower = await prisma.artistetofollower.findFirst({
            where: {
                artiste_id: creator_id,
                follower_id: user.id,
            },
        });

        if (existingFollower) {
            // If they are following, remove the follower
            await prisma.artistetofollower.delete({
                where: { id: existingFollower.id },
            });
            return res.status(200).json({
                status: 'success',
                message: 'unfollowed',
            });
        }

        // If not following, add as a follower
        await prisma.artistetofollower.create({
            data: {
                artiste_id: creator_id,
                follower_id: user.id,
            },
        });

        return res.status(200).json({
            status: 'success',
            message: 'followed',
        });

    } catch (error) {
        return res.status(400).json({
            status: 'fail',
            error: error.message || 'An error occurred',
        });
    }
};

exports.topArtistes = async (res) => {
    try {
      // Get the date 7 days ago
      const trendingDays = process.env.TRENDING_ARTISTE_TIME
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - trendingDays); 

      // Fetch artistes and their listen counts
      const artistes = await prisma.users.findMany({
          where: {
              tracks: {
                  some: {
                      listens: {
                          some: {
                              created_at: {
                                  gte: daysAgo,
                              },
                          },
                      },
                  },
              },
              deleted_at: null
          },
          include: {
              tracks: {
                  select: {
                      listens: {
                          where: {
                              created_at: {
                                  gte: daysAgo,
                              },
                          },
                      },
                  },
              },
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
          },
      });

      // Calculate total listens for each artiste
      const artisteListenData = artistes.map(artiste => {
          const totalListens = artiste.tracks.reduce((sum, track) => sum + track.listens.length, 0);
          return {
              id: artiste.id,
              email: artiste.email,
              first_name: artiste.first_name,
              last_name: artiste.last_name,
              profile_photo: artiste.profile_photo,
              cover_photo: artiste.cover_photo,
              is_verified: artiste.is_verified,
              is_artise: artiste.is_artise,
              slug: artiste.slug,
              socialProfiles: artiste.socialProfiles,
              listenCount: totalListens,
          };
      });

      // Sort artistes by listen count in descending order
      const sortedArtistes = artisteListenData.sort((a, b) => b.listenCount - a.listenCount);

      // Return the result
      res.json({
        status:"success",
        data: sortedArtistes,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        status:"fail",
        error:error,
        message:"Something went wrong"
      });
    }
    
    
  }




