const { PrismaClient } = require('@prisma/client');
const { product_photos } = require('../prisma/client');
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
    try {
        // Step 1: Delete existing data
        await prisma.product_photos.deleteMany({});
        await prisma.order_products.deleteMany({});
        await prisma.orders.deleteMany({});
        await prisma.products.deleteMany({});

        // Step 2: Seed products
        const productData = [
            { name: "Men Polo", price: 23000.0, category_id: 3 },
            { name: "Beat Headset", price: 120000.0, category_id: 1 },
            { name: "Airpod 4.3", price: 40000.0, category_id: 1 },
        ];

        const createProducts = await prisma.products.createMany({ data: productData });

        if (!createProducts) {
            return res.status(500).json({ status: "error", message: "Failed to create products" });
        }

        // Step 3: Retrieve newly created products
        const products = await prisma.products.findMany();

        // Step 4: Prepare and seed product photos
        const photoData = products.flatMap((product) => {
            switch (product.name) {
                case "Men Polo":
                    return [
                        { file: "uploads/shop/shirt.jpg", product_id: product.id, is_cover: true },
                        { file: "uploads/shop/shirt2.jpg", product_id: product.id },
                    ];
                case "Beat Headset":
                    return [
                        { file: "uploads/shop/headset.jpg", product_id: product.id, is_cover: true },
                    ];
                case "Airpod 4.3":
                    return [
                        { file: "uploads/shop/airpod.png", product_id: product.id, is_cover: true },
                        { file: "uploads/shop/airpod2.jpeg", product_id: product.id },
                        { file: "uploads/shop/airpod3.jpeg", product_id: product.id },
                        { file: "uploads/shop/airpod4.jpeg", product_id: product.id },
                    ];
                default:
                    return [];
            }
        });

        await prisma.product_photos.createMany({ data: photoData });

        // Step 5: Respond with success
        return res.status(200).json({
            status: "success",
            message: "Store Seeder completed!",
        });
    } catch (error) {
        console.error("Error during storeSeeder:", error);
        return res.status(500).json({
            status: "error",
            message: "An error occurred during the seeding process",
            error: error.message,
        });
    }
};


