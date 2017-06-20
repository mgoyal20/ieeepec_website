/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	name: {
      type: 'string',
      required: true
    },

    sid: {
      type: 'int',
      required: true
    },

    year: {
      type: 'int',
      required: true
    },

    branch: {
      type: 'string',
      required: true
    },

    membership: {
      type: 'int',
      required: true
    },

    email: {
      type: 'string',
      email: true,
      required: true,
      unique: true
    },

    encryptedPassword: {
      type: 'string',
      required: true
    },

    lastLoggedIn: {
      type: 'date',
      required: true,
      defaultsTo: new Date(0)
    }, 

    admin: {
      type: 'boolean',
      defaultsTo: false
    },

    verified: {
      type: 'boolean',
      defaultsTo: false
    }
  }
};

