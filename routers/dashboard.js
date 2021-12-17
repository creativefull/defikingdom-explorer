function Dashboard() {
    this.index = (req,res,next) => {
        return res.render('main', {
            title: 'Dashboard'
        })
    }
}
module.exports = exports = Dashboard