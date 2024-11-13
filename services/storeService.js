const prisma = require("../prisma/client");

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