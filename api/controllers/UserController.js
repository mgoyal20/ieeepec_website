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
          req.session.name=user.name;
          req.session.branch=user.branch;
          req.session.sid=user.sid;
          req.session.email=user.email;
          req.session.membership=user.membership;
          req.session.admin = user.admin;
          req.session.authenticated=true;
           console.log(req.session);

          // All done- let the client know that everything worked.

          //return res.redirect('/yoyo');
          return res.json(user);
          //return res.ok();
        }
      });
    });
  },


};

