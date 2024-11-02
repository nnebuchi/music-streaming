const { PrismaClient } = require('@prisma/client');
const prisma  = new PrismaClient();

exports.validateCommentOwnership = async (req, res, next) => {
    
    
  const comment = await prisma.discussionComments.findFirst({
    where: {
      id: parseInt(req?.params?.comment_id),
      user_id: parseInt(req?.user?.id)
    }
  })
  if(comment){
    next()
  }else{
    res.status(300).json({
      status: 'fail',
      message: 'You are not Authorized to modify this comment'
    })
  }
}