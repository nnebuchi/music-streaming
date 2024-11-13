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

exports.storeSeeder = async (req, res) => {
    const createProducts = await prisma.products.createMany({
        data:[
            { name:"Men Polo", price:23000.00}, 
            { name:"Beat Headset", price:120000.00}, 
            { name:"Airpod 4.3", price:40000.00}
        ]
    });

    if(createProducts){
        const products = await prisma.products.findMany();
        products.forEach(async (product, index) => {
            let data;
            
            if(product.name === "Men Polo"){
                data = [
                    {
                        file:"uploads/shop/shirt.jpg",
                        product_id:product.id,
                        is_cover:true
                    },
                    {
                        file:"uploads/shop/shirt2.jpg",
                        product_id:product.id,
                    },

                ]
                
            }else if(product.name === "Beat Headset"){
                data = [
                    {
                        file:"uploads/shop/headset.jpg",
                        product_id:product.id,
                        is_cover:true
                    }

                ]
            }else if(product.name === "Airpod 4.3"){
                data = [
                    {
                        file:"uploads/shop/airpod.png",
                        product_id:product.id,
                        is_cover:true
                    },
                    {
                        file:"uploads/shop/airpod2.jpeg",
                        product_id:product.id,
                    },
                    {
                        file:"uploads/shop/airpod3.jpeg",
                        product_id:product.id,
                    },
                    {
                        file:"uploads/shop/airpod4.jpeg",
                        product_id:product.id,
                    },
                ]
            }
            await prisma.product_photos.createMany({
                data:data
            });

            if(index ==(product.length -1)){
                return res.status(200).json(
                    {
                        status:"success",
                        message: "Store Seeder completed!"
                    }
                )
            }
        });
        
        
    }


}

