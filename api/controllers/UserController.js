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
      if (!user.verified) return res.notFound();

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
          return res.badRequest();
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

  forgotPassword: function (req, res) {
    // Try to look up user using the provided email address
    User.findOne({
      email: req.param('email')
    }, function foundUser(err, user) {
      if (err) return res.negotiate(err);
      if (!user) return res.notFound();
      if (!user.verified) return res.notFound();

        require('machinepack-email').send({
          auth: {
            user: 'admin_email',
            pass: 'admin_password'
          },
          service: 'gmail',
          mail: {
            from: 'admin_email',
            to: email,
            subject: 'pfff..Hello the world!',
            text: "http://localhost:1337/resetPassword"
          },
          }).exec({
            // An unexpected error occurred.
            error: function (err) {
              console.log(3);
              return res.negotiate(err);
            },
            // OK.
            success: function () {
              req.session.cookie.maxAge = 600 * 1000;
              req.session.me = user.id;
              console.log(req.session);
              console.log(req.session.cookie._expires);
              return res.ok();
            },
        });
    });
  },

  showResetPage: function (req, res, next) {
    console.log(req.session);
    if (!req.session.me) {
      return res.view('homepage');
    }
    if(!req.session){
      return res.forbidden();
    }

    return res.view('resetPassword');
  },

  reset: function(req, res) {
    var Passwords = require('machinepack-passwords');
    Passwords.encryptPassword({
      password: req.param('password'),
      difficulty: 10,
    }).exec({
      error: function(err) {
        return res.negotiate(err);
      },
      success: function(encryptedPassword) { 
        User.update(req.session.me, {
          encryptedPassword: encryptedPassword
        },function(err,user){
          if(err){
            return res.negotiate(err);
          }
          req.session.cookie.maxAge = null;
          return res.ok();
        });
      }
    });
  },

  handleUsers: function (req, res, next) {
    if (!req.session.me) {
      return res.view('homepage');
    }
    if(!req.session.admin){
      if(!req.session.verified)
        return res.forbidden(); 
      return res.redirect('/profile');
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
      return res.view('user/profile',{ 
          user:user
      });
    });    
  },

  editProfilePage: function (req, res, next) {
    if (!req.session.me) {
      return res.view('homepage');
    }
    if(!req.session.verified) {
      return res.forbidden();
    } 
    User.findOne(req.session.me, function(err, user){
      res.locals.layout = 'user/layoutUser';
      return res.view('user/edit',{ 
          user:user
      });
    });
  },

  editProfile: function(req, res) {
    User.findOne(req.session.me
      ).exec({
      error: function(err) {
        return res.negotiate(err);
      },
      success: function(user) { 
        User.update(req.session.me,{
          name: req.param('name'),
          sid: req.param('sid'),
          year: req.param('year'),
          branch: req.param('branch'),
          membership: req.param('membership'),
          phone: req.param('phone'),
          email: req.param('email'),
          lastLoggedIn: new Date(),
        }, 
        function userUpdated(err, user) {
          if (err) {
            console.log("err: ", err);
            console.log("err.invalidAttributes: ", err.invalidAttributes);
            // If this is a uniqueness error about the email attribute,
            // send back an easily parseable status code.
            if (err.invalidAttributes && err.invalidAttributes.email && err.invalidAttributes.email[0]
            && err.invalidAttributes.email[0].rule === 'unique') {
              return res.emailAddressInUse();
            }
            // Otherwise, send back something reasonable as our error response.
            return res.negotiate(err);
          }
          // Send back the id of the new user
          return res.ok(); 
        });   
      }
    });
  },

  profilePic: function(req, res) {
      var images = req.param('images[]') ? req.param('images[]') : [];
      var paramObj = {
        images: images
      }
      User.update(req.session.me, paramObj, function (err, user) {
        if (err) {
          sails.log.error(err);
        } else {      
          //UPLOAD
          image.uploadProfilePic(req, user[0], function(err, user){
            if(err){
              console.log('ERROR IMAGE');
              console.log(err);
            }else{
              return res.redirect('/profile'); 
            }
          });
        }
      });
      
    },

};

