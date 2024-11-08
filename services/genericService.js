const { PrismaClient } = require('@prisma/client');
const prisma  = new PrismaClient();

exports.version = async(version_no, platform, res)=>{

    let version_settings = await prisma.app_settings.findUnique({
        where:{subject:"app_version"},
    });

    if(version_settings){
        let resp_data = null;
        version_settings = JSON.parse(version_settings.data)  
        if(version_no < parseInt(version_settings[platform].min_supported_version)){
            resp_data = {
                status: "outdated",
                update_url: version_settings[platform].update_url
            }
            
        }else if(version_no < parseInt(version_settings[platform].latest_version)){
            resp_data = {
                status: "update",
                update_url: version_settings[platform].update_url
            }
        }else{
            resp_data = {
                status: "active"
            }
        } 

        return res.status(200).json({
            status:"success",
            data: resp_data,
        });
        
    }

}

