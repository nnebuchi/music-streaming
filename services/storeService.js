const prisma = require("../prisma/client");
const { generateOTP } = require("../utils/generic");

exports.getProducts = async (parsedUrl, res) => {
    try {
        const queryString = parsedUrl.query;
        const query = {};
        if (queryString.latest && queryString.latest === 'true') {
            query.orderBy = { id: 'desc' };
        }

        if (queryString.category_id && queryString.category_id != 'all') {
            query.where = {
                category_id: parseInt(queryString.category_id)
            }
        }
       
        const page = queryString.page ? parseInt(queryString.page) : 1;
        const page_size = parseInt(process.env.PRODUCT_PER_PAGE);

        query.skip = (page - 1) * page_size;
        query.take = page_size;
        query.include = {
            product_photos: {
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
        const code = await generateOTP()
        
        const order = await prisma.orders.create({
            data: {
                user_id: req.user.id,
                code:code.toString(),
                status:"processing"
            }
        });

        const data = await Promise.all(req.body.products.map(async (product) => {
                   
            return {
                order_id: order.id,
                product_id: parseInt(product.id),
                quantity:   parseInt(product.quantity),
                amount: await prisma.products.findUnique({
                    where: { id: parseInt(product.id) }
                }).then((item) => {
                    return item.price * product.quantity
                })
            }
        }))

        if(order){
            await prisma.order_products.createMany({
                data: data
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
            message: "order not created",
            error: error   
        });
        
    }
}


exports.getProductCategories = async (res) => {
    const product_categories = await prisma.product_categories.findMany({});
    return res.status(200).json({ 
        status:"success",
        data:product_categories
    });
}

// exports.getProductsByCategory = async (req, res) => {
//     const queryString = req.query;
//     const query = {};
//     query.include = {
//         product_photos: {
//           select: {
//             id: true,
//             file: true,
//             is_cover: true,
//           },
//         },
//       };
//     query.where = {
//         category_id: queryString.category_id
//     }
//     const product_categories = await prisma.product_categories.findMany({});
//     return res.status(200).json({ 
//         status:"success",
//         data:product_categories
//     });
// }