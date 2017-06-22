/**
 * PublicpageController
 *
 * @description :: Server-side logic for managing publicpages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	news: function(req,res){
    	News.find(function(err, news){
      		return res.view('news',{ 
        		news: news
      		});
    	});
  	},

  	singleNews: function(req,res){
    	News.findOne(req.param('id'), function(err, news){
    		res.locals.layout = 'layout';
      		res.view('singleNews',{
        		news: news
      		});
    	});
  	},

	gallery: function(req,res){
    	Gallery.find(function(err, gallery){
      		return res.view('gallery',{ 
        		gallery: gallery
      		});
    	});
  	},
};

