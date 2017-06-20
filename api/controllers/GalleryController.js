/**
 * ProductController
 *
 * @description :: Server-side logic for managing Products
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var GalleryController = {
  
		handleGallery: function(req, res, next) {
			if (!req.session.me) {
      	return res.view('homepage');
    	}

    	if(!req.session.admin) {
      	return res.forbidden();
    	}

      Gallery.find(function(err, gallery){
      	res.locals.layout = 'admin/layoutAdmin';
        return res.view('admin/handleGallery',{ 
          gallery: gallery
        });
      });
    },

    create: function(req, res) {
      var paramObj = {
        images: []
      }
      
      Gallery.create(paramObj, function (err, gallery) {
        if (err) {
          sails.log.error(err);
        } else {      
          //UPLOAD
          image.upload(req, gallery, function(err, gallery){
            if(err){
              console.log('ERROR IMAGE');
              console.log(err);
            }else{
              return res.redirect('/handleGallery'); 
            }
          });
        }
      });
      
    },
  
    destroy: function(req, res, next) {
      Gallery.destroy(req.param('id'), function (err) {
        if (err) {
          sails.log.error("GalleryController#destroy error");        
          res.serverError();
        } else {
          res.redirect('/handleGallery');
        }
      });
    },
};

module.exports = GalleryController;
