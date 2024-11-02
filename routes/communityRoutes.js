const express = require('express');
const communityRouter = express.Router();
const postRouter = express.Router();
// const commentRouter = express.Router({ mergeParams: true });
const {verifyAuthToken, addAuthToken} = require('../utils/auth');
const communityController = require('../controllers/communityController');
const {validateCommentOwnership} = require('../utils/community');

communityRouter.get('/tags', communityController.tags);
communityRouter.use('/posts', postRouter);
    postRouter.post('/create', verifyAuthToken, communityController.createPost)
    postRouter.get('/', verifyAuthToken, communityController.getPosts)
    // postRouter.use('/:post_id/comments', commentRouter);
    postRouter.delete('/:post_id/delete/', verifyAuthToken,  communityController.deletePost)
    postRouter.get('/:post_id/comments', verifyAuthToken,  communityController.fetchPostComments)
    postRouter.post('/:post_id/comments/add', verifyAuthToken,  communityController.addComment)
    postRouter.delete('/comments/:comment_id/delete', verifyAuthToken, validateCommentOwnership,  communityController.deleteComment)
    postRouter.post('/:post_id/like/', verifyAuthToken,  communityController.likePost)
    postRouter.post('/comments/:comment_id/like', verifyAuthToken,  communityController.likeComment)
    postRouter.get('/comments/:comment_id/replies', verifyAuthToken,  communityController.commentReplies)
    // postRouter.delete('/comments/:comment_id/delete', verifyAuthToken,  communityController.deleteComment)

module.exports = communityRouter;