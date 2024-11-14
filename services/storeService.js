const prisma = require("../prisma/client");
const { generateOTP } = require("../utils/generic");

exports.getProducts = async (parsedUrl, res) => {
    try {
        const queryString = parsedUrl.query;
        const query = {};
        if (queryString.latest && queryString.latest === 'true') {
            query.orderBy = { id: 'desc' };
        }
        const page = queryString.page ? parseInt(queryString.page) : 1;
        const page_size = parseInt(process.env.TRACK_PER_PAGE);

        query.skip = (page - 1) * page_size;
        query.take = page_size;
        query.include = {
            photos: {
              select: {
                id: true,
                file: true,
                is_cover: true,
              },
            },
          };
        const products = await prisma.products.findMany(query);
        if(products){
            const totalProductsCount = await prisma.products.count({});
            const totalPages = Math.ceil(totalProductsCount / page_size);
            const paginatedResult = {
                products: products,
                meta: {
                    total: totalProductsCount,
                    page,
                    last_page: totalPages,
                    page_size,
                    nextPage: page === totalPages ? null : page + 1
                }
            };
            return res.status(200).json({
                status: 'success',
                data: paginatedResult,
            });
             
        }
        
    } catch (error) {
        console.log(error);
        
        res.status(400).json({
            status: "fail",
            message:"could not fetch products",
            error: error
        });
    }
   
};

exports.generateOrder = async (req, res) => { 
    try {
        const code = await generateOTP();
        const order = await prisma.orders.create({
            data: {
                user_id: req.user.id,
                code:code.toString(),
                amount: req.body.amount
            }
        });

        if(order){
            await prisma.order_products.createMany({
                data: req.body.product_ids.map((product) => {
                    return {
                        order_id: order.id,
                        product_id: product                   }
                })
            })
        }

        const fullOrder = await prisma.orders.findUnique({
            where: { id: order.id },
            include: {
                order_products: {
                    include:{
                        product:true
                    }
                }, // Include the related order_products
                user: true             // Optionally include the user details
            }
        });
        

        return res.status(200).json({
            status: "success",
            message: "order created",
            order: fullOrder   
        });
    }
    catch (error) {
        console.log(error);
        return res.status(200).json({
            status: "fail",
            message: "order created",
            error: error   
        });
        
    }
}