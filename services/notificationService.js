const prisma = require('../prisma/client');

exports.saveFcmToken = async(userId, token, deviceInfo = null) => {
    try {
        const token_instance = await prisma.fcm_tokens.upsert({
            where: { token },
            update: { user_id: userId, updated_at: new Date() },
            create: { user_id: userId, token, device_info: deviceInfo },
        });
        if(token_instance){
            return {
                status:true
            }
        }
        // else{
        //     return {
        //         status:false
        //     } 
        // }
        
    } catch (error) {
        console.log(error);

        return {
            status:false,
            error:error
        }
    }
   
}
