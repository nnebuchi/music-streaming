
const { runValidation } = require('../lib/buchi');
const genericService = require('../services/genericService');

exports.version = async(req, res)=>{
    const {version, platform} = req.body;
    
    const validate = await runValidation([
        {
            input: { value: version, field: "version", type: "text" },
            rules: { required: true},
        },
        {
            input: { value: platform, field: "platform", type: "text" },
            rules: { required: true },
        },
    ])
    if(validate){
        if(validate.status === false){
            return res.status(409).json({
                status:"fail",
                errors:validate.errors,
                message:"Could not fetch version",
            });
        }else{
            return genericService.version(version, platform, res);
        }
    }
    
}


exports.storeSeeder = async(req, res) => {
    return await genericService.storeSeeder(req, res)
}

exports.trackDiscussion = async(req, res) => {
    return await genericService.trackDiscussion(res)
}
