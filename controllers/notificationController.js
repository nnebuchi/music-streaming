const { runValidation } = require('../lib/buchi');
const notificationService = require('../services/notificationService');
exports.saveFcmToken = async(req, res) => {
    const validate = await runValidation([
        {
            input: { value: req?.body?.token, field: "token", type: "text" },
            rules: { required: true},
        }
    ]);
    if(validate){
            if(validate.status === false){
                return res.status(409).json({
                    status:"fail",
                    errors:validate.errors,
                    message:"Could not save token",
                });
            }else{
                const saveToken = await notificationService.saveFcmToken(req.user.id, req.body.token);
                if(saveToken.status){
                    return res.status(200).json({
                        status:"success",
                        message:"token saved"
                    })
                }else{
                    console.log(saveToken.error);
                    
                    return res.status(400).json({
                        status:"fail",
                        message:"Could not save token",
                        error:saveToken.error
                    })
                }
            }
        }
}