function Heroes() {
    this.index = (req,res,next) => {
        return res.render('hero', {
            title: 'Heroes'
        })
    }
}
module.exports = exports = Heroes