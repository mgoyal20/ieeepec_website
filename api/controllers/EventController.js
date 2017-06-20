/**
 * AdminController
 *
 * @description :: Server-side logic for managing admins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	handleEvents: function (req, res) {
    
    if (!req.session.me) {
      return res.view('homepage');
    }

    if(!req.session.admin){
      return res.forbidden();
    }    

    Event.find(function foundEvents (err, events){
      if (err) {
        return res.negotiate(err);
      }

      res.locals.layout = 'admin/layoutAdmin';
      return res.view('admin/handleEvents', {
        events: events
      });

    });
  },

  addEvent: function (req, res) {
  	Event.create({
      name: req.param('name'),
      description: req.param('description'),
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
    Event.findOne(req.param('id'), function foundEvent (err, event) {
      if (err) return next(err);
      if (!event) return next('Event doesn\'t exist.');
      
      res.locals.layout = 'admin/layoutAdmin';
      res.view('admin/editEvent', {
        event: event
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

    var EventObj = {
      name: req.param('name'),
      description: req.param('description'),
    }

    Event.update(req.param('id'), EventObj, function eventUpdated (err) {
      if (err) {
        return res.negotiate(err);
      }

      return res.redirect('/handleEvents');
    });
  },

  destroy: function (req, res) {

    if (!req.session.me) {
      return res.view('homepage');
    }

    if(!req.session.admin){
      return res.forbidden();
    }

    Event.findOne(req.param('id'), function foundEvent (err, event) {
      if (err) return next(err);

      if (!event) return next('Event doesn\'t exist.');

      Event.destroy(req.param('id'), function eventDestroyed(err) {
        if (err) return next(err);

      });

      res.redirect('/handleEvents');  
      
    });
  }
};

