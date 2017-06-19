/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(done) {

	if (process.env.NODE_ENV === 'production') {
    return done();
  }

  //--•
  // Check to see if we already have a fake admin in the database.
  User.count({
    name: "admin"
  }).exec(function (err, existingAdmin) {
    if (err) { return done(err); }

    if (existingAdmin >= 2) {
      return done(new Error('Consistency violation: Database is in invalid state: There should never be more than one fake admin!'));
    }

    if (existingAdmin === 1) {
      // If the admin already exists, then we're done.
      // That means we must have already run the bootstrap and seeded the fake data.
      return done();
    }

    // --•
    // But otherwise, we'll seed some fake data.
    var Passwords = require('machinepack-passwords');
    Passwords.encryptPassword({
      password: "admin123",
      difficulty: 10,
    }).exec({
    	error: function(err) {
        return res.negotiate(err);
      },
      success: function(encryptedPassword) {
      	User.create({
          name: "admin",
          sid: "12345678",
          year: "3",
          branch: "CSE",
          membership: "12345678",
          phone: "1234567890",
          email: "admin@admin.com",
          admin: true,
          encryptedPassword: encryptedPassword,
          lastLoggedIn: new Date(),
        }).exec(function (err){
      			if (err) { return done(err); }

      			return done();

   			});
      }
    });
	});
};
 
