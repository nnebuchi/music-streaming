const prisma = require('../prisma/client');

exports.bookStudio = async (booking_data, res) => {
    try {
        const studios = await prisma.studio_bookings.create({
           data:booking_data,
        });        
        return res.status(200).json({status:"success", message:"Studio booking successful", data:studios});
    } catch (error) {
        console.log(error);
        return res.status(500).json({status:"error", message:"Something went wrong", error});     
    }
}