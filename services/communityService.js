const prisma = require('../prisma/client');

exports.createPost = async (req, res) => {

    try {
        const tags = req.body.tags;
        if(typeof tags != 'object' ){
            return {
              status: false,
              errors:{
                tags:[
                    "tags field must be an array"
                ]
              }
            }
          }
        const post = await prisma.discussions.create({ 
            data: {
                title: req.body.title,
                body: req.body.content,
                user_id: req.user.id
            }
        });
        
        tags.forEach(async (tag) => {
            
            await prisma.tagstodiscussions.create({
              data: {
                discussion: {
                    connect: { id: post.id }
                  },
                  tag: {
                    connect: { id: parseInt(tag) }
                  }
              }
            });
            
          });

        return res.status(200).json({
            status: 'success',
            message: 'Post created successfully',
            data: post
        });
    } catch (error) {
        return res.status(400).json({
            status: 'fail',
            error: error
        });
    }
}


exports.getPosts = async (parsedUrl, user, res) => {
  try {
    const queryString = parsedUrl.query;
    const query = {};
    let where = {};
    query.where = where;

    // Filter by creator ID if provided
    if (queryString.creator_id) {
      where.user_id = parseInt(queryString.creator_id);
    }

    // Sort by latest if needed
    if (queryString.latest && queryString.latest === 'true') {
      query.orderBy = { id: 'desc' };
    }

    // Filter by tag if provided
    if (queryString.tag && queryString.tag !== 'all') {
      where.tags = { some: { tag: { slug: queryString.tag } } };
    }

    // Pagination setup
    const page = queryString.page ? parseInt(queryString.page) : 1;
    const page_size = parseInt(process.env.POST_PER_PAGE);

    query.skip = (page - 1) * page_size;
    query.take = page_size;

    // Include related data in the query
    query.include = {
      author: {
        select: {
          first_name: true,
          last_name: true,
          profile_photo: true,
        },
      },
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      },
      _count: {
        select: { likes: true, comments: true },
      },
      likes: {  // Include likes and filter by the authenticated user
        select: {
          user_id: true,  // Select only the user IDs of users who liked the post
        },
        where: {
          user_id: user.id,  // Filter likes to check if the authenticated user liked this post
        },
      },
    };

    // Fetch the posts based on the query
    const posts = await prisma.discussions.findMany(query);

    if (posts) {
      const totalPostsCount = await prisma.discussions.count({ where });
      const totalPages = Math.ceil(totalPostsCount / page_size);

      // Add the "likeByUser" flag to each post
      const modifiedPosts = posts.map(post => {
        post.likeByUser = post.likes.length > 0;  // If there's a like by the user, set likeByUser to true
        delete post.likes;  // Remove the 'likes' field from the response if not needed
        return post;
      });

      const paginatedResult = {
        posts: modifiedPosts,
        meta: {
          total: totalPostsCount,
          page,
          last_page: totalPages,
          page_size,
          nextPage: page === totalPages ? null : page + 1,
        },
      };

      // Return the result
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
      message: 'Could not fetch post.',
    });
  }
};


exports.tags = async (res) => {
    const tags = await prisma.tags.findMany({});
    return res.status(200).json({
        status: 'success',
        data: tags
    });
}

exports.addComment = async (user_id,  discussion_id, parent, comment, res) => {

  try {
    const postComment = await prisma.discussioncomments.create({
      data:{
        comment:comment,
        discussion_id: parseInt(discussion_id),
        user_id: parseInt(user_id),
        parent:parent ? parseInt(parent) : null
      },
      include:{
        user:{
          select:{
            first_name:true, last_name:true, profile_photo:true
          }
        },
        replies:{
          take: 2,
          include:{
            user:{
              select:{
                first_name:true, last_name:true, profile_photo:true
              }
            },
            likes: {  // Include likes and filter by the authenticated user
              select: {
                user_id: true,  // Select only the user IDs of users who liked the post
              },
              where: {
                user_id: user_id,  // Filter likes to check if the authenticated user liked this post
              },
            },
            _count:{
              select:{
                likes:true,
                replies:true
              }
            }
          },
  
        },
        likes: {  // Include likes and filter by the authenticated user
          select: {
            user_id: true,  // Select only the user IDs of users who liked the post
          },
          where: {
            user_id: user_id,  // Filter likes to check if the authenticated user liked this post
          },
        },
        _count:{
          select:{
            likes:true,
            replies:true
          }
        }
      }

    })
    if(postComment){
      return res.status(200).json({
        status:'success',
        message:"comment added",
        data: postComment
      })
    }
  } catch (error) {
    console.log(error);
    
    return res.status(400).json({
      status:'fail',
      message:"could not add comment",
      error:error
    })
  }
  
}

exports.fetchPostComments = async (parsedUrl, discussion_id, user_id, res) => {
  try {
    const queryString = parsedUrl.query;
    const query = {};
    const where = {
      discussion_id:parseInt(discussion_id),
      parent:null
    }
    const page = queryString.page ? parseInt(queryString.page) : 1;
    const page_size = parseInt(process.env.COMMENT_PER_PAGE);

    query.skip = (page - 1) * page_size;
    query.take = page_size;
    query.where = where
    query.include = {
      user:{
        select:{
          first_name:true, last_name:true, profile_photo:true
        }
      },
      replies:{
        take: 2,
        include:{
          user:{
            select:{
              first_name:true, last_name:true, profile_photo:true
            }
          },
          likes: {  // Include likes and filter by the authenticated user
            select: {
              user_id: true,  // Select only the user IDs of users who liked the post
            },
            where: {
              user_id: user_id,  // Filter likes to check if the authenticated user liked this post
            },
          },
          _count:{
            select:{
              likes:true,
              replies:true
            }
          }
        },

      },
      likes: {  // Include likes and filter by the authenticated user
        select: {
          user_id: true,  // Select only the user IDs of users who liked the post
        },
        where: {
          user_id: user_id,  // Filter likes to check if the authenticated user liked this post
        },
      },
      _count:{
        select:{
          likes:true,
          replies:true
        }
      }
    }
    const comments = await prisma.discussioncomments.findMany(query);
    
    if(comments){
      // const modifiedcomments = comments.map(comment => {
      //   comment.likeByUser = comment.likes.length > 0;  // If there's a like by the user, set likeByUser to true
      //   delete comment.likes;  // Remove the 'likes' field from the response if not needed
      //   return comment;
      // });
      
      const totalCommentsCount = await prisma.discussioncomments.count({where});
      const totalPages = Math.ceil(totalCommentsCount / page_size);
      const paginatedResult = {
        comments: comments,
        meta: {
          total: totalCommentsCount,
          page,
          last_page: totalPages,
          page_size,
          nextPage: page === totalPages ? null : page + 1,
        },
      };
      return res.status(200).json({
        status:'success',
        data:paginatedResult
      })
    }
  } catch (error) {
    console.log(error);
    
    return res.status(400).json({
      status:'fail',
      error:error,
      message:"could not retrieve comments"
    })
  }
  
}

exports.commentReplies = async (parsedUrl, comment_id, res) => {
  try {
    const queryString = parsedUrl.query;
    const query = {};
    const where = {
      parent:parseInt(comment_id)
    }
    query.where = where
    query.include = {
      user:{
        select:{
          first_name:true, last_name:true, profile_photo:true
        }
      },
      _count:{
        select:{
          likes:true,
          replies:true
        }
      }
    }
    const comments = await prisma.discussioncomments.findMany(query);
    if(comments){
      const page = queryString.page ? parseInt(queryString.page) : 1;
      const page_size = parseInt(process.env.COMMENT_PER_PAGE);
      const totalCommentsCount = await prisma.discussioncomments.count({where});
      const totalPages = Math.ceil(totalCommentsCount / page_size);
      const paginatedResult = {
        comments: comments,
        meta: {
          total: totalCommentsCount,
          page,
          last_page: totalPages,
          page_size,
          nextPage: page === totalPages ? null : page + 1,
        },
      };
      return res.status(200).json({
        status:'success',
        data:paginatedResult
      })
    }
  } catch (error) {
    console.log(error);
    
    return res.status(400).json({
      status:'fail',
      error:error,
      message:"could not retrieve comments"
    })
  }
}


exports.deleteComment = async (user_id, id, res) => {
  try {
    // Find all replies to the comment (descendants)
    const replies = await prisma.discussioncomments.findMany({
      where: { parent: parseInt(id) },
      select: { id: true }
    });

    if (replies.length > 0) {
      // Recursively delete all replies first
      for (const reply of replies) {
        await this.deleteComment(user_id, parseInt(reply.id), res);
      }
    }

    // Once all replies are deleted, delete the current comment
    await prisma.discussioncomments.delete({
      where: { id: parseInt(id) }
    });

    // Send the response only once after all operations are completed
    if (!res.headersSent) {
      return res.status(200).json({
        status: "success",
        message: "Comment and its descendants deleted"
      });
    }
  } catch (error) {
    console.error(error);

    // Send the response only once in case of an error
    if (!res.headersSent) {
      return res.status(400).json({
        status: "fail",
        message: "Could not delete comment",
        error: error.message
      });
    }
  }
};

exports.deletePost = async (user_id, post_id, res) => {
  console.log(post_id, user_id);
  
  try {
    const post = await prisma.discussions.findFirst({
      where:{
        id:parseInt(post_id),
        user_id:parseInt(user_id)
      }
    })

    if(!post){
      return res.status(400).json({
        status:"fail",
        message:"could not delete post",
        error:"post not found or you are not authorized to delete this post"
      })
    }
    const deletePostLike = await prisma.discussionlike.deleteMany({
      where:{
        discussion_id:parseInt(post_id)
      }
    });
    if(deletePostLike){
      const deletePostComments = await prisma.discussioncomments.deleteMany({
        where:{
          discussion_id:parseInt(post_id)
        }
      });
      if(deletePostComments){
        const deletePostTags = await prisma.tagstodiscussions.deleteMany({
          where:{
            discussion_id:parseInt(post_id)
          }
        })
        if(deletePostTags){
          await prisma.discussions.delete({
            where:{
              id:parseInt(post_id)  
            }
          })
        }
        
      }
    }
    
    return res.status(200).json({
      status:"success",
      message:"post deleted"
    })
  } catch (error) {
    return res.status(400).json({
      status:"fail",
      message:"could not delete Post",
      error:error
    })
  }
 
}

exports.likePost = async (user_id, post_id, res) => {
  const exisitingLike = await prisma.discussionlike.findFirst({
    where:{
      discussion_id:parseInt(post_id),
      user_id:parseInt(user_id)
    }
  });
  if(exisitingLike){
    await prisma.discussionlike.deleteMany({
      where:{
        discussion_id:parseInt(post_id),
        user_id:parseInt(user_id)
      }
    });
  }else{
    await prisma.discussionlike.create({
      data:{
        discussion_id:parseInt(post_id),
        user_id:parseInt(user_id)
      }
    });
  }
 
    return res.status(200).json({
      status:"success",
      message:"post like updated"
    });
  
}


exports.likeComment = async (user_id, comment_id, res) => {
  console.log(user_id, comment_id);
  
  const exisitingLike = await prismacommentlikes.findFirst({
    where:{
      comment_id:parseInt(comment_id),
      user_id:parseInt(user_id)
    }
  });
  if(exisitingLike){
    await prismacommentlikes.deleteMany({
      where:{
        comment_id:parseInt(comment_id),
        user_id:parseInt(user_id)
      }
    });
  }else{
    await prismacommentlikes.create({
      data:{
        comment_id:parseInt(comment_id),
        user_id:parseInt(user_id)
      }
    });
  }
 
    return res.status(200).json({
      status:"success",
      message:"comment like updated"
    });
  
}