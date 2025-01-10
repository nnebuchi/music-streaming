const prisma = require('../prisma/client');

exports.version = async(version_no, platform, res)=>{
    // const settings = {
    //     ios: {
    //         min_supported_version: 1,
    //         latest_version: 1,
    //         update_url: ""
    //     },
    //     android: {
    //         min_supported_version: 1,
    //         latest_version: 1,
    //         update_url: ""
    //     }
    // }


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
            { name: "Tote Bag", price: 10.0, category_id: 3 },
            { name: "Spiral Notebook", price: 120000.0, category_id: 3 },
            { name: "Face Cap", price: 15.0, category_id: 2 },
            { name: "Mug", price: 5.0, category_id: 3 },
            { name: "Hoodies", price: 30.0, category_id: 2 },
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
                case "Tote Bag":
                    return [
                        { file: "uploads/shop/bag.jpg", product_id: product.id, is_cover: true }
                    ];
                case "Spiral Notebook":
                    return [
                        { file: "uploads/shop/notebook.jpg", product_id: product.id, is_cover: true },
                    ];
                case "Face Cap":
                    return [
                        { file: "uploads/shop/facecap.png", product_id: product.id, is_cover: true }
                    ];
                case "Mug":
                    return [
                        { file: "uploads/shop/cup.png", product_id: product.id, is_cover: true }
                    ];
                case "Hoodies":
                    return [
                        { file: "uploads/shop/hoodies.png", product_id: product.id, is_cover: true }
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

exports.trackDiscussion = async (res) => {
    try {
      // Fetch tracks with missing discussion_id efficiently
    //   const discussionWithTracks = await prisma.discussions.findMany({
    //     where:{
    //        song_id:{
    //             not:null
    //         }
    //     }
        
    //   });
    //   get tracks whose id is not 
      const tracksToUpdate = await prisma.tracks.findMany({});
  
      if (tracksToUpdate.length > 0) {
        // Create discussions for tracks in a single transaction
        const discussions = await prisma.discussions.createMany({
          data: tracksToUpdate.map((track) => ({
            title: track.title,
            body: track.about,
            user_id: track.user_id,
            song_id: track.id,
          })),
          skipDuplicates: true, // Prevent duplicate discussions (optional)
        });
  
        return res.status(200).json({
          status: "success",
          message: "Discussions created and tracks updated successfully",
        });
      } else {
        // No tracks require discussion creation
        return res.status(200).json({
          status: "success",
          message: "All tracks already have discussions",
        });
      }
    } catch (error) {
      console.error(error); // Log the error for debugging
      return res.status(500).json({
        status: "fail",
        message: "An error occurred while creating discussions",
        error: error.message,
      });
    }
  };


  exports.getSliders = async (parsedUrl, res) => {
    try {
      let query = {where:{}};
      if(parsedUrl.query.screen){
        query.where.screen = parsedUrl.query.screen
      }
      if(parsedUrl.query.device){
        query.where.device = parsedUrl.query.device
      }
      console.log(query);
      
      const sliders = await prisma.sliders.findMany(query);
      return res.status(200).json({
        status:"success",
        data: sliders,
      })
    } catch (error) {
      console.log(error);
      
      return res.status(400).json({
        status:"fail",
        error: error,
        message: "Error getting sliders"
      })
    }
  };

