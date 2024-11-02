const prisma = require('../prisma/client');

exports.addFollower = async (req, res) => {
    try {
        const { creator_id } = req.body;
        
        const user = req.user;

        // Check if the user is already following the creator
        const existingFollower = await prisma.artisteToFollower.findFirst({
            where: {
                artiste_id: creator_id,
                follower_id: user.id,
            },
        });

        if (existingFollower) {
            // If they are following, remove the follower
            await prisma.artisteToFollower.delete({
                where: { id: existingFollower.id },
            });
            return res.status(200).json({
                status: 'success',
                message: 'unfollowed',
            });
        }

        // If not following, add as a follower
        await prisma.artisteToFollower.create({
            data: {
                artiste_id: creator_id,
                follower_id: user.id,
            },
        });

        return res.status(200).json({
            status: 'success',
            message: 'followed',
        });

    } catch (error) {
        return res.status(400).json({
            status: 'fail',
            error: error.message || 'An error occurred',
        });
    }
};




