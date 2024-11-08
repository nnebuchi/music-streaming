const { PrismaClient } = require('@prisma/client');
const prisma  = new PrismaClient();

exports.songCast = ["slug", "user_id", "created_at"];

exports.validateTrackOwnership = async (req, res, next) => {
    
    const track = await prisma.tracks.findFirst({
      where: {
        id: parseInt(req?.body?.track_id),
        user_id: req?.user?.id
      }
    })
    if(track){
      next()
    }else{
      res.status(300).json({
        status: 'fail',
        message: 'You are not Authorized to modify this track'
      })
    }
  }

  
exports.validateAlbumOwnership = async (req, res, next) => {
  console.log(req?.body);
  
  const album = await prisma.albums.findFirst({
    where: {
      id: parseInt(req?.body?.album_id),
      user_id: parseInt(req?.user?.id)
    }
  })
  if(album){
    next()
  }else{
    res.status(300).json({
      status: 'fail',
      message: 'You are not Authorized to modify this album'
    })
  }
}