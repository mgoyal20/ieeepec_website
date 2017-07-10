/**
 * NewsController
 *
 * @description :: Server-side logic for managing news
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	handleNews: function (req, res) {
    
    if (!req.session.me) {
      return res.view('homepage');
    }

    if(!req.session.admin) {
      return res.forbidden();
    }    

    News.find(function foundEvents (err, news){
      if (err) {
        return res.negotiate(err);
      }

      res.locals.layout = 'admin/layoutAdmin';
      return res.view('admin/handleNews', {
        news: news
      });

    });
  },

  addNews: function (req, res) {
  	News.create({
      title: req.param('title'),
      description: req.param('description')
    }).exec(function (err) {
      if (err) {
        console.log("err: ", err);
        console.log("err.invalidAttributes: ", err.invalidAttributes);
        return res.negotiate(err);
      }
      return res.ok(); 
    });
  },

  edit: function (req, res) {

    // Find the user from the id passed in via params
    News.findOne(req.param('id'), function foundEvent (err, news) {
      if (err) return next(err);
      if (!news) return next('News doesn\'t exist.');
      
      res.locals.layout = 'admin/layoutAdmin';
      res.view('admin/editNews', {
        news: news
      });
    });
  },

  update: function (req, res) {
    
    if (!req.session.me) {
      return res.view('homepage');
    }

    if(!req.session.admin){
      return res.forbidden();
    }

    var NewsObj = {
      title: req.param('title'),
      description: req.param('description'),
    }

    News.update(req.param('id'), NewsObj, function newsUpdated (err) {
      if (err) {
        return res.negotiate(err);
      }

      return res.redirect('/handleNews');
    });
  },

  destroy: function (req, res) {

    if (!req.session.me) {
      return res.view('homepage');
    }

    if(!req.session.admin){
      return res.forbidden();
    }

    News.findOne(req.param('id'), function foundNews (err, news) {
      if (err) return next(err);

      if (!news) return next('News doesn\'t exist.');

      News.destroy(req.param('id'), function newsDestroyed(err) {
        if (err) return next(err);

      });

      res.redirect('/handleNews');  
      
    });
  }
};

