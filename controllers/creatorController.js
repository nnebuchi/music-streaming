const creatorService =  require('../services/creatorService');

exports.addFollower = async (req, res) => {
    return creatorService.addFollower(req, res);
}

exports.topArtistes = async (req, res) => {
    return creatorService.topArtistes(res);
}
