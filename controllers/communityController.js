const { runValidation } = require('../lib/buchi');
const communityService = require('../services/communityService');
const url = require('url');

exports.createPost = async (req, res) => {
    const { title, content, tags } = req.body;
    const { id } = req.user;
    const validate = await runValidation([
        {
            input: { value: title, field: "title", type: "text" },
            rules: { required: true },
        },
        {
            input: { value: content, field: "content", type: "text" },
            rules: { required: true },
        },
        {
            input: { value: tags, field: "tags", type: "array" },
            rules: { required: true }
        },
    ]);

    if (validate) {
        if(validate?.status === false) {
            return res.status(409).json({
                status:"fail",
                errors:validate.errors,
                message:"Request Failed",
            });
        }else{
            return communityService.createPost(req, res);
        }
    }
}

exports.getPosts = async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    return communityService.getPosts(parsedUrl, req.user, res)
}

exports.tags = async (req, res) => {
    return communityService.tags(res);
}

exports.addComment = async (req, res) => {
    console.log(req.params);
    
    const user_id = req.user.id
    const post_id = req.params.post_id
    const comment = req.body.comment
    const parent = req.body.parent
    
    const validate = await runValidation([
        {
            input: { value: post_id, field: "post_id", type: "text" },
            rules: { required: true },
        },
        {
            input: { value: comment, field: "comment", type: "text" },
            rules: { required: true },
        },
        
    ]);

    if (validate) {
        if(validate?.status === false) {
            return res.status(409).json({
                status:"fail",
                errors:validate.errors,
                message:"Request Failed",
            });
        }else{
            return communityService.addComment(user_id, post_id, parent, comment, res)
        }
    }
}

exports.fetchPostComments = async (req, res) => {
    const post_id = req.params.post_id
    const parsedUrl = url.parse(req.url, true);
    return communityService.fetchPostComments(parsedUrl, post_id, req.user.id, res)
}

exports.commentReplies = async (req, res) => {
    const comment_id = req.params.comment_id
    
    const parsedUrl = url.parse(req.url, true);
    return communityService.commentReplies(parsedUrl, comment_id, res)
}

exports.deleteComment = async(req, res) => {
    
    const comment_id = req.params.comment_id
    return communityService.deleteComment(req.user.id, comment_id, res)

}

exports.likePost = async (req, res) => {
    console.log(req.params);
    
    const user_id = req.user.id
    const post_id = req.params.post_id
    
    const validate = await runValidation([
        {
            input: { value: post_id, field: "post_id", type: "text" },
            rules: { required: true },
        },
    ]);

    if (validate) {
        if(validate?.status === false) {
            return res.status(409).json({
                status:"fail",
                errors:validate.errors,
                message:"Request Failed",
            });
        }else{
            return communityService.likePost(user_id, post_id, res)
        }
    }
}

exports.deletePost = async (req, res) => {
    
    const user_id = req.user.id
    const post_id = req.params.post_id
    
    const validate = await runValidation([
        {
            input: { value: post_id, field: "post_id", type: "text" },
            rules: { required: true },
        },
    ]);

    if (validate) {
        if(validate?.status === false) {
            return res.status(409).json({
                status:"fail",
                errors:validate.errors,
                message:"Request Failed",
            });
        }else{
            return communityService.deletePost(user_id, post_id, res)
        }
    }
}

exports.likeComment = async (req, res) => {
    console.log(req.params);
    
    const user_id = req.user.id
    const comment_id = req.params.comment_id
    
    const validate = await runValidation([
        {
            input: { value: comment_id, field: "comment_id", type: "text" },
            rules: { required: true },
        },
    ]);

    if (validate) {
        if(validate?.status === false) {
            return res.status(409).json({
                status:"fail",
                errors:validate.errors,
                message:"Request Failed",
            });
        }else{
            return communityService.likeComment(user_id, comment_id, res)
        }
    }
}