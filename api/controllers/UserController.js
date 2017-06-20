/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	/**
   * Sign up for a user account.
   */
  signup: function(req, res) {

    var Passwords = require('machinepack-passwords');

    // Encrypt a string using the BCrypt algorithm.
    Passwords.encryptPassword({
      password: req.param('password'),
      difficulty: 10,
    }).exec({
      // An unexpected error occurred.
      error: function(err) {
        return res.negotiate(err);
      },
      // OK.
      success: function(encryptedPassword) {   
        // Create a User with the params sent from
        // the sign-up form --> signup.ejs
        User.create({
          name: req.param('name'),
          sid: req.param('sid'),
          year: req.param('year'),
          branch: req.param('branch'),
          membership: req.param('membership'),
          phone: req.param('phone'),
          email: req.param('email'),
          encryptedPassword: encryptedPassword,
          lastLoggedIn: new Date(),
        }, 
        function userCreated(err, newUser) {
          if (err) {
            console.log("err: ", err);
            console.log("err.invalidAttributes: ", err.invalidAttributes)

            // If this is a uniqueness error about the email attribute,
            // send back an easily parseable status code.
            if (err.invalidAttributes && err.invalidAttributes.email && err.invalidAttributes.email[0]
            && err.invalidAttributes.email[0].rule === 'unique') {
              return res.emailAddressInUse();
            }

            // Otherwise, send back something reasonable as our error response.
            return res.negotiate(err);
          }

          // Log user in
      	  req.session.me = newUser.id;
          req.session.admin = newUser.admin;
          req.session.verified = newUser.verified;

          // Send back the id of the new user
          return res.json({
            id: newUser.id
          }); 
        });   
      }
    });
  },

  login: function (req, res) {

    // Try to look up user using the provided email address
    User.findOne({
      email: req.param('email')
    }, function foundUser(err, user) {
      if (err) return res.negotiate(err);
      if (!user) return res.notFound();

      // Compare password attempt from the form params to the encrypted password
      // from the database (`user.password`)
      require('machinepack-passwords').checkPassword({
        passwordAttempt: req.param('password'),
        encryptedPassword: user.encryptedPassword
      }).exec({

        error: function (err){
          return res.negotiate(err);
        },

        // If the password from the form params doesn't checkout w/ the encrypted
        // password from the database...
        incorrect: function (){
          return res.notFound();
        },

        success: function (){

          // Store user id in the user session
          req.session.me = user.id;
          //req.session.name = user.name;
          req.session.admin = user.admin;
          req.session.verified = user.verified;

          // All done- let the client know that everything worked.
          return res.ok();
        }
      });
    });
  },

  logout: function (req, res) {

    // Look up the user record from the database which is
    // referenced by the id in the user session (req.session.me)
    User.findOne(req.session.me, function foundUser(err, user) {
      if (err) return res.negotiate(err);

      // If session refers to a user who no longer exists, still allow logout.
      if (!user) {
        sails.log.verbose('Session refers to a user who no longer exists.');
        res.locals.layout = 'layout';
        return res.redirect('/');
      }

      // Wipe out the session (log out)
      req.session.me = null;

      // Either send a 200 OK or redirect to the home page
      res.locals.layout = 'layout';
      return res.redirect('/');

    });
  },

  handleUsers: function (req, res, next) {
    
    if (!req.session.me) {
      return res.view('homepage');
    }

    if(!req.session.admin){
      if(!req.session.verified)
        return res.forbidden();
      
      return res.redirect('/blog');
    }

    User.find(function foundUsers (err, users){
      if (err) {
        return res.negotiate(err);
      }

      if (!users) {
        sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
        return res.view('homepage');
      }

      res.locals.layout = 'admin/layoutAdmin';
      return res.view('admin/handleUsers', {
        users: users
      });

    });
  },

  handleNewUsers: function (req, res, next) {
    
    if (!req.session.me) {
      return res.view('homepage');
    }

    if(!req.session.admin){
      return res.forbidden();
    }

    User.find(function foundUsers (err, users){
      if (err) {
        return res.negotiate(err);
      }

      if (!users) {
        sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
        return res.view('homepage');
      }

      res.locals.layout = 'admin/layoutAdmin';
      return res.view('admin/handleNewUsers', {
        users: users
      });

    });
  },

  verify: function (req, res) {
    
    if (!req.session.me) {
      return res.view('homepage');
    }

    if(!req.session.admin){
      return res.forbidden();
    }

    var UsrObj = {
      verified: true,
    }

    User.update(req.param('id'), UsrObj, function userUpdated (err) {
      if (err) {
        return res.negotiate(err);
      }

      return res.redirect('/handleNewUsers');
    });
  },

  destroy: function (req, res, next) {

    if (!req.session.me) {
      return res.view('homepage');
    }

    if(!req.session.admin){
      return res.forbidden();
    }

    User.findOne(req.param('id'), function foundUser (err, user) {
      if (err) return next(err);

      if (!user) return next('User doesn\'t exist.');

      User.destroy(req.param('id'), function userDestroyed(err) {
        if (err) return next(err);

      });

      res.redirect('/handleUsers');  
      
    });
  },

  profile: function (req, res) {
    if (!req.session.me) {
      return res.view('homepage');
    }
    if (!req.session.verified) {
      return forbidden();
    }

    User.findOne(req.session.me, function(err, user){
      res.locals.layout = 'user/layoutUser';
      return res.view('user/blog',{ 
          user:user
      });
    });    
  },

};

