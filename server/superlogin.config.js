console.log(__dirname);
module.exports = {
  testMode: {
    noEmail: !process.env.SENDGRID_USERNAME,
    debugEmail: !process.env.SENDGRID_USERNAME
  },
  security: {
    maxFailedLogins: 3,
	  sessionLife: 60*60*24,
  },
  local: {
    sendConfirmEmail: true,
    requireEmailConfirm: true,
    loginOnRegistration: false,
    confirmEmailRedirectURL: '/login',
	  emailUsername: true,
	  usernameField: 'email'
  },
  dbServer: {
    protocol: process.env.DB_HOST ? 'https://' : 'http://',
    host: process.env.DB_HOST || 'localhost:5984',
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    // automatically detect if the host is Cloudant
    cloudant: process.env.DB_HOST && process.env.DB_HOST.search(/\.cloudant\.com$/) > -1,
    userDB: 'sldemo-users',
    couchAuthDB: '_users'
  },
  session: {
    adapter: 'redis',
    redis: {
      url: process.env.REDIS_URL
    }
  },
  mailer: {
    fromEmail: process.env.FROM_EMAIL || 'noreply@example.com',
    transport: require('nodemailer-sendgrid-transport'),
    options: {
      auth: {
        api_user: process.env.SENDGRID_USERNAME,
        api_key: process.env.SENDGRID_PASSWORD
      }
    }
  },
  userDBs: {
    model: {
      todos: {
        designDocs: [],
        permissions: ['_reader', '_writer', '_replicator']
      }
    },
    defaultDBs: {
      private: ['todos'],
	    //shared: ['todos_shared']
    },
    privatePrefix: 'sldemo',
    designDocDir: __dirname + '/designDocs'
  },
  providers: {
    facebook: {
      credentials: {
        clientID: process.env.FACEBOOK_CLIENTID,
        clientSecret: process.env.FACEBOOK_CLIENTSECRET,
        profileURL: 'https://graph.facebook.com/v2.4/me',
        profileFields: ['id', 'name', 'displayName', 'emails', 'age_range', 'link', 'gender', 'locale', 'timezone', 'updated_time', 'verified', 'picture', 'cover']
      },
      options: {
        scope: ['email', 'public_profile'],
        display: 'popup'
      }
    },
    google: {
      credentials: {
        clientID: process.env.GOOGLE_CLIENTID,
        clientSecret: process.env.GOOGLE_CLIENTSECRET
      },
      options: {
        scope: ['profile', 'email']
      }
    },
    github: {
      credentials: {
        clientID: process.env.GITHUB_CLIENTID,
        clientSecret: process.env.GITHUB_CLIENTSECRET,
        scope: ['user:email']
      }
    },
    vkontakte: {
		  credentials: {
			  clientID: process.env.VKONTAKTE_CLIENTID,
			  clientSecret: process.env.VKONTAKTE_CLIENTSECRET,
			  apiVersion : "5.32",
			  scope: ['email'],
			  profileFields: ['email']
		  }
	  }
  }
};
