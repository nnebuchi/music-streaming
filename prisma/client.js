const { PrismaClient } = require('@prisma/client');
const prisma  = new PrismaClient();

const {user_middleware, song_middleware, discussionComments_middleware, slider_middleware, product_middleware} = require('./middleware');
prisma.$use(user_middleware)
prisma.$use(song_middleware)
prisma.$use(discussionComments_middleware)
prisma.$use(slider_middleware)
prisma.$use(product_middleware)
module.exports = prisma;