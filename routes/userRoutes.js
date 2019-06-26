const express = require('express');
const authenticate = require('.././middleware/authenticate');
const config = require('../middleware/config/config.js');
var bcrypt = require('bcryptjs');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
var models = require('../models');
const router = express.Router();
const Op = require('sequelize').Op;
var async = require('async');
var crypto = require('crypto');
const { check, validationResult } = require('express-validator/check');
const authConfig = require('./authconfig');
const Authentication = require('./auth/index.js');
const auth = new Authentication({ routes: authConfig });
const sgMail = require('@sendgrid/mail');
var fs = require('fs');
const restify = require('restify');
const uuidv4 = require('uuid/v4');
const { Storage } = require('@google-cloud/storage');
var qs = require('qs');
var moment = require('moment');
var server = require('../server');
const socketIO = require('socket.io');
var io = socketIO(server);
const mobileSockets = {};

var multiparty = require('connect-multiparty');
multipartyMiddleware = multiparty();
router.use(multipartyMiddleware);

function notify(text, sender, receiver) {
  // io.on("connection", socket => {
  var notification = { sender: sender, receiver: receiver, text: text };
  // const receiversSocketId = mobileSockets[receiver.id];
  io.to(receiver.socketId).emit('incomingNotification', notification);
  // });
}

var googleAuth = require('./auth/googleauth.js');
const handleTokenRequest = (req, res) => {
  try {
    const login = req.body;
    auth.authenticate(login).then(credentials => {
      models.user
        .findOne({ where: { googleId: credentials.user.id } })
        .then(user => {
          if (user) {
            res.status(200).json({ msg: 'Logging you in' });
          } else {
            models.user
              .findOne({ where: { email: credentials.user.email } })
              .then(user => {
                if (user) {
                  user
                    .update(
                      { googleId: credentials.user.id },
                      { where: { id: user.id } }
                    )
                    .then(newUser => {
                      res.status(200).send(newUser);
                    });
                } else {
                  models.user
                    .create({
                      fullname: credentials.user.name,
                      email: credentials.user.email,
                      username: credentials.user.name
                    })
                    .then(function(user) {
                      var token = jwt.sign(
                        { id: user.id, email: user.email },
                        config.secret
                      );
                      const session = models.session.build({
                        userId: user.id,
                        token: token
                      });
                      session.save().then(session => {
                        var user1 = _.pick(user, [
                          'id',
                          'fullname',
                          'email',
                          'username'
                        ]);
                        res.header('x-auth', token).send(user1);
                      });
                    })
                    .catch(err => {
                      res.status(500).json({ msg: err });
                    });
                }
              });
          }
        });
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: 'Internal server error' })
      .end();
  } finally {
  }
};

router.post('/auth/token', handleTokenRequest, (req, res) => {
  try {
    var login = req.body;
    console.log(login.code);
    googleAuth
      .getGoogleUser(login.code)
      .then(response => {
        var content = {
          token: jwt.createToken(response),
          user: response
        };
        return content;
      })
      .then(credentials => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(credentials));
      })
      .catch(e => {
        console.log(e);
        throw new Error(e);
      });
  } catch (error) {
    res.sendStatus(500).end(JSON.stringify({ error: 'Internal server error' }));
    return console.error(error);
  }
});

router.get('/passionlist', (req, res) => {
  models.passion
    .findAll({
      attributes: ['passion']
    })
    .then(passions => {
      res.send(passions);
    });
});

router.get('/subpassionlist', (req, res) => {
  var passion1 = req.query();
  passion1 = passion1.split('=');
  passion = passion1.filter(item => item != 'element');
  console.log(passion[0].replace('%20', ' '));
  // console.log(req.query.element);
  models.passion
    .findAll({
      where: { passion: passion[0] },
      attributes: ['subpassion']
    })
    .then(passions => {
      console.log(passions);
      res.send(passions);
    });
});

router.post('/addpassion', (req, res) => {
  const passion = models.passion.build({
    passion: req.body.passion,
    tribe: req.body.tribe,
    subpassion: []
  });
  passion
    .save()
    .then(function(passion) {
      res.status(200).send(passion);
    })
    .catch(err => {
      res.status(400).json({ msg: err });
    });
});

router.patch('/addsubpassion', (req, res) => {
  var passion1 = req.query();
  passion1 = passion1.split('=');
  passion = passion1.filter(item => item != 'element');
  console.log(passion[0]);
  var newsubpassion = req.body.subpassion;
  models.passion.findOne({ where: { passion: passion[0] } }).then(passion => {
    var id = passion.id;
    models.passion.findOne({ where: { id: id } }).then(passion => {
      if (
        passion.dataValues.subpassion !== null &&
        passion.dataValues.subpassion.includes(newsubpassion)
      ) {
        res.status(400).json({ msg: 'Already present' });
      } else {
        if (passion.dataValues.subpassion === null)
          passion.dataValues.subpassion = [];
        passion.dataValues.subpassion.push(newsubpassion);
        console.log(passion.dataValues.subpassion);
        passion
          .update(
            { subpassion: passion.dataValues.subpassion },
            { where: { id: passion.dataValues.id } }
          )
          .then(newpassion => {
            res.status(200).send(newpassion);
          })
          .catch(err => console.log(err));
      }
    });
  });
});

checkDuplicateEmail = (req, res, next) => {
  models.user
    .findOne({
      where: {
        email: req.body.email
      }
    })
    .then(user => {
      if (user) {
        res.status(400).json({ msg: 'Email already in use' });
        return;
      }
      next();
    });
};

router.get('/', function(req, res) {
  console.log('this is /');
});

router.post('/phonecheck', (req, res) => {
  models.user
    .findOne({
      where: {
        phone: req.body.phone
      }
    })
    .then(user => {
      if (!user) {
        res.json({ msg: 'Phone not in use' });
      } else {
        res.json({ msg: 'Phone already in use' });
      }
    });
});
router.post('/emailcheck', (req, res) => {
  models.user
    .findOne({
      where: {
        email: req.body.email
      }
    })
    .then(user => {
      if (!user) {
        res.json({ msg: 'Email not in use' });
      } else {
        res.json({ msg: 'Email already in use' });
      }
    });
});
router.post('/usernamecheck', (req, res) => {
  models.user
    .findOne({
      where: {
        username: req.body.username
      }
    })
    .then(user => {
      if (!user) {
        res.json({ msg: 'Username not in use' });
      } else {
        res.json({ msg: 'Username already in use' });
      }
    });
});

router.post(
  '/signup',
  [
    checkDuplicateEmail,
    check('email').isEmail(),
    check('password').isLength({ min: 8 })
  ],
  function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    console.log('hello');
    models.user
      .create({
        first_name: req.body.first_name,
        email: req.body.email,
        last_name: req.body.last_name,
        location: req.body.location,
        fullname: req.body.first_name + ' ' + req.body.last_name,
        username: req.body.username,
        about: req.body.about,
        tribe: req.body.tribe,
        phone: req.body.phone,
        password: bcrypt.hashSync(req.body.password, 8),
        associations: req.body.associations,
        country: req.body.country,
        gender: req.body.gender,
        objectives: [],
        Professional_Headline: req.body.Professional_Headline,
        interests: req.body.interests,
        links: req.body.links,
        badges: req.body.badges
      })
      .then(function(user) {
        var token = jwt.sign({ id: user.id, email: user.email }, config.secret);
        const session = models.session.build({
          userId: user.id,
          token: token
        });
        session.save().then(session => {
          var user1 = _.pick(user, [
            'id',
            'first_name',
            'last_name',
            'fullname',
            'phone',
            'email',
            'location',
            'tribe',
            'gender',
            'associations',
            'country',
            'rating',
            'interests',
            'about',
            'links',
            'badges',
            'Professional_Headline',
            'profilepic',
            'onboarding'
          ]);
          res.header('x-auth', token).send(user1);
        });
      })
      .catch(err => {
        res.status(500).json({ msg: err });
      });
  }
);

router.post('/login', function(req, res) {
  models.user
    .findOne({
      where: {
        email: req.body.email
      }
    })
    .then(user => {
      if (!user) {
        return res.status(404).json({ msg: 'User Not Found' });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then(result => {
          if (!result)
            return res
              .status(401)
              .json({ auth: false, accessToken: null, msg: 'Wrong Password' });
          var token = jwt.sign(
            { id: user.id, email: user.email },
            config.secret
          );
          const session = models.session.build({
            userId: user.id,
            token: token
          });
          session.save().then(session => {
            var user1 = _.pick(user, [
              'id',
              'first_name',
              'last_name',
              'fullname',
              'phone',
              'email',
              'location',
              'tribe',
              'gender',
              'associations',
              'country',
              'rating',
              'interests',
              'about',
              'links',
              'badges',
              'Professional_Headline',
              'profilepic',
              'onboarding'
            ]);
            res.header('x-auth', token).send(user1);
          });
        })
        .catch(err => {
          res.status(500).json({ msg: err });
        });
    })
    .catch(e => {
      return res.status(401).json({
        auth: false,
        accessToken: null,
        msg: 'Invalid Password',
        error: e
      });
    });
});

router.patch(
  '/updatepassword',
  authenticate,
  [check('newpassword').isLength({ min: 8 })],
  function(req, res) {
    models.user
      .findOne({
        where: {
          id: req.user.id
        }
      })
      .then(user => {
        bcrypt.compare(req.body.passwordOld, user.password).then(result => {
          if (!result) {
            res.status(401).json({ msg: 'Wrong Password' });
          }
          models.user
            .update(
              { password: bcrypt.hashSync(req.body.newpassword, 8) },
              {
                where: {
                  id: req.user.id
                }
              }
            )
            .then(user => {
              res.status(200).json({ msg: 'Password Updated' });
            })
            .catch(err => {
              res.send(500).json({ msg: err });
            });
        });
      });
  }
);

router.get('/myprofile', authenticate, function(req, res) {
  var user1 = _.pick(req.user, [
    'id',
    'first_name',
    'last_name',
    'fullname',
    'phone',
    'email',
    'location',
    'tribe',
    'gender',
    'associations',
    'country',
    'rating',
    'passion',
    'subpassion',
    'objectives',
    'about',
    'links',
    'badges',
    'Professional_Headline',
    'profilepic',
    'onboarding'
  ]);
  user1['liked'] = true;
  res.status(200).send(user1);
});

router.get('/profile/:id', authenticate, function(req, res) {
  const id = req.params.id;
  const userId = req.user.id;
  models.user
    .findByPk(id)
    .then(async function(user) {
      if (!user) {
        return res.status(404).json({ msg: 'No User Found' });
      }
      var user1 = _.pick(user, [
        'id',
        'first_name',
        'last_name',
        'fullname',
        'email',
        'phone',
        'location',
        'tribe',
        'gender',
        'interests',
        'associations',
        'country',
        'rating',
        'passion',
        'subpassion',
        'objectives',
        'about',
        'links',
        'badges',
        'Professional_Headline',
        'profilepic',
        'onboarding',
        'experience'
      ]);
      user1 = await checkUserConnections(req.user.id, user1);
      res.status(200).json(user1);
    })
    .catch(err => {
      res.status(404).json(err);
    });
});

router.get('/list', authenticate, async function(req, res) {
  var tribe = req.user.tribe;
  models.user
    .findAll({
      where: {
        [Op.and]: [{ tribe: tribe }, { id: { [Op.notIn]: [req.user.id] } }]
      },
      attributes: [
        'id',
        'fullname',
        'Professional_Headline',
        'links',
        'profilepic'
      ]
    })
    .then(async function(users) {
      const promises = users.map(user =>
        checkUserConnections(req.user.id, user.dataValues)
      );
      users = await Promise.all(promises);
      res.status(200).send(users);
    });
});

async function checkUserConnections(userId, user) {
  var connection = await models.connection.findOne({
    where: {
      [Op.or]: [
        { [Op.and]: [{ senderId: userId }, { receiverId: user.id }] },
        { [Op.and]: [{ senderId: user.id }, { receiverId: userId }] }
      ]
    }
  });
  user.connection_status = null;
  if (connection) {
    if (connection.status == true) {
      user.connection_status = 'connected';
    } else if (connection.senderId == userId) {
      user.connection_status = 'sent';
    } else {
      user.connection_status = 'received';
    }
  }
  return user;
}

router.get('/searchpeople', authenticate, function(req, res) {
  var queryObj = qs.parse(req.query());
  var query = queryObj.q + '%';
  console.log(String(query));
  models.user
    .findAll({
      where: {
        first_name: {
          $iLike: query
        }
      },
      limit: 10,
      attributes: ['id', 'fullname', 'Professional_Headline', 'profilepic']
    })
    .then(users => {
      res.status(200).send(users);
    })
    .catch(err => {
      res.status(200).json({ msg: err });
    });
});

router.get('/suggestions', authenticate, (req, res) => {
  var query1 = req.query();
  query1 = query1.replace(/&/g, '=').split('=');
  query = query1.filter(item => item != 'filters');
  console.log(req.query());
  if (!req.query()) {
    models.connection
      .findAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [{ senderId: req.user.id }, { receiverId: req.user.id }]
            }
          ]
        }
      })
      .then(users => {
        users = users.map(user => {
          if (user.senderId == req.user.id) {
            return user.receiverId;
          } else {
            return user.senderId;
          }
        });
        users.push(req.user.id);
        models.user
          .findAll({
            where: {
              [Op.and]: [
                { tribe: req.user.tribe },
                { id: { [Op.notIn]: users } }
              ]
            },
            attributes: [
              'id',
              'fullname',
              'Professional_Headline',
              'profilepic'
            ]
          })
          .then(users => {
            if (!users) {
              res.status(200).json({ msg: 'No Suggestions' });
            }
            res.status(200).send(users);
          });
      });
  } else {
    var arr = [];
    query.forEach(item => {
      arr.push({ [item]: req.user[item] });
    });
    console.log(arr);
    models.connection
      .findAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [{ senderId: req.user.id }, { receiverId: req.user.id }]
            }
          ]
        }
      })
      .then(users => {
        users = users.map(user => {
          if (user.senderId == req.user.id) {
            return user.receiverId;
          } else {
            return user.senderId;
          }
        });
        users.push(req.user.id);
        models.user
          .findAll({
            where: {
              [Op.and]: [
                {
                  id: { [Op.notIn]: users }
                },
                {
                  [Op.and]: arr
                }
              ]
            },
            attributes: [
              'id',
              'fullname',
              'Professional_Headline',
              'profilepic'
            ]
          })
          .then(users => {
            if (!users) {
              res.status(400).json({ msg: 'No users found' });
            }
            res.status(200).send(users);
          });
      });
  }
});

router.get('/myconnections', authenticate, (req, res) => {
  var id = req.user.id;
  models.connection
    .findAll({
      where: {
        [Op.and]: [
          { status: true },
          { [Op.or]: [{ senderId: req.user.id }, { receiverId: req.user.id }] }
        ]
      }
    })
    .then(users => {
      // console.log(users);
      users = users.map(user => {
        if (user.senderId == req.user.id) {
          return user.receiverId;
        } else {
          return user.senderId;
        }
      });
      if (users.length == 0) {
        res.status(200).json([]);
      } else {
        models.user
          .findAll({
            where: {
              id: { [Op.or]: users }
            },
            attributes: [
              'fullname',
              'Professional_Headline',
              'id',
              'profilepic'
            ]
          })
          .then(users => {
            var newUsers = users.filter(user => user.id != id);
            res.status(200).send(newUsers);
          });
      }
    });
});

router.patch('/updateprofile', authenticate, function(req, res) {
  const id = req.user.id;
  models.user
    .update((values = req.body), { returning: true, where: { id: id } })
    .then(([rowsUpdate, [user]]) => {
      res.status(200).json(user);
    })
    .catch(err => {
      res.status(500).json({ msg: err });
    });
});

router.patch('/addobjective', authenticate, (req, res) => {
  var objectives = req.body.objective;
  const id = req.user.id;
  models.user
    .update({ objectives: objectives }, { where: { id: id } })
    .then(user => {
      res.status(200).json({ msg: 'Objective Added' });
    })
    .catch(err => {
      res.send(500).json({ msg: err });
    });
});

router.patch('/addtribe', authenticate, (req, res) => {
  var tribe = req.body.tribe;
  const id = req.user.id;
  models.user
    .update({ tribe: tribe }, { where: { id: id } })
    .then(user => {
      res.status(200).json({ msg: 'Tribe Added' });
    })
    .catch(err => {
      res.send(500).json({ msg: err });
    });
});

router.post('/sendrequest', authenticate, function(req, res) {
  var receiverId = req.body.receiverId;
  var senderId = req.user.id;
  models.connection
    .create({
      sent: true,
      senderId: senderId,
      receiverId: receiverId,
      status: false
    })
    .then(function(connect) {
      res.status(200).json({ msg: 'Request Sent' });
      models.user.findOne({ where: { id: receiverId } }).then(user => {
        const text = req.user.name + ' wants to connect with you';
        const receiver = {
          name: user.name,
          id: user.id,
          socketId: user.socketId
        };
        const sender = { name: req.user.name, id: req.user.id };
        notify(text, sender, receiver);
      });
    })
    .catch(err => {
      res.status(500).json({ msg: err });
    });
});

router.get('/requests', authenticate, async function(req, res) {
  let userrequests;
  try {
    userrequests = await models.connection.findAll({
      where: {
        [Op.and]: [{ receiverId: req.user.id }, { status: false }]
      },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: models.user,
          attributes: ['id', 'fullname', 'Professional_Headline', 'profilepic']
        }
      ]
    });
  } catch (err) {
    res.status(400).send(err);
  }
  console.log(userrequests);
  let projectrequests;
  try {
    projectrequests = await models.projectmember.findAll({
      where: { userId: req.user.id, status: 'requested' },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: models.project,
          include: [
            {
              model: models.user,
              attributes: ['id', 'fullname', 'profilepic']
            }
          ],
          attributes: [
            'id',
            'title',
            'userId',
            'memberQuantity',
            'projectname',
            'vision'
          ]
        }
      ]
    });
  } catch (err) {
    res.status(400).send(err);
  }
  console.log(projectrequests);
  let likes;
  try {
    likes = await models.like.findAll({
      include: [
        {
          model: models.post,
          where: { userId: req.user.id }
        },
        {
          model: models.user,
          attributes: ['id', 'fullname', 'profilepic']
          // where: { userId: req.user.id }
        }
      ],
      attributes: ['id', 'status', 'userId', 'postId', 'createdAt']
    });
  } catch (err) {
    res.status(400).send(err);
  }
  console.log(likes);
  let comments;
  try {
    comments = await models.comment.findAll({
      include: [
        {
          model: models.post,
          where: { userId: req.user.id }
        },
        {
          model: models.user,
          attributes: ['id', 'fullname', 'profilepic']
        }
      ],
      attributes: ['id', 'userId', 'postId', 'createdAt']
    });
  } catch (err) {
    res.status(400).send(err);
  }
  console.log(comments);
  let allNotifications = userrequests.concat(projectrequests, likes, comments);
  allNotifications = _.orderBy(allNotifications, ['createdAt'], ['desc']);

  res.status(200).send({
    userrequests: userrequests,
    projectrequests: projectrequests,
    likes: likes,
    comments: comments,
    all: allNotifications
  });
});

router.patch('/acceptrequest', authenticate, function(req, res) {
  receiverId = req.user.id;
  senderId = req.body.senderId;
  models.connection
    .update(
      { status: true },
      {
        where: { receiverId: receiverId, senderId: senderId }
      }
    )
    .then(connect => {
      // res.status(200).json({ msg: "You are now connected" });
      models.user.findOne({ where: { id: senderId } }).then(user => {
        const text = req.user.name + ' accepted your request';
        const receiver = {
          name: user.name,
          id: user.id,
          socketId: user.socketId
        };
        const sender = { name: req.user.name, id: req.user.id };
        notify(text, sender, receiver);
      });
      res.status(200).send(connect);
    })
    .catch(err => {
      res.status(500).json({ msg: err });
    });
});

router.delete('/logout', authenticate, (req, res) => {
  var token = req.header('x-auth');
  models.session.destroy({ where: { token: token } }).then(
    () => {
      res.status(200).json({ msg: 'Logged Out Successfully' });
    },
    err => {
      res.status(500).json({ msg: err });
    }
  );
});

const CLOUD_BUCKET = '2209124121';
const storage = new Storage({
  projectId: 'vinknjn-nkn8117',
  keyFilename: 'tribeeco_key.json'
});
const bucket = storage.bucket(CLOUD_BUCKET);

router.post('/profilepic', authenticate, (req, res) => {
  const { file } = req.files;
  var id = req.user.id;
  const gcsname = uuidv4() + file.name;
  const files = bucket.file(gcsname);

  fs.createReadStream(file.path)
    .pipe(
      files.createWriteStream({
        metadata: {
          contentType: file.type
        }
      })
    )
    .on('error', err => {
      console.log(err);
      restify.InternalServerError(err);
    })
    .on('finish', () => {
      location = `https://storage.googleapis.com/${CLOUD_BUCKET}/${gcsname}`;
      models.user.findOne({ where: { id: id } }).then(user => {
        user
          .update({ profilepic: location }, { where: { id: id } })
          .then(user => {
            var user1 = _.pick(user, [
              'id',
              'first_name',
              'last_name',
              'fullname',
              'email',
              'phone',
              'location',
              'tribe',
              'gender',
              'associations',
              'country',
              'rating',
              'interests',
              'about',
              'links',
              'badges',
              'Professional_Headline',
              'profilepic',
              'onboarding'
            ]);
            res.status(200).send(user1);
          });
      });
    });
});

router.post('/mytribe', authenticate, (req, res) => {
  models.passion
    .findOne({ where: { passion: req.body.passion } })
    .then(passion1 => {
      models.user.findOne({ where: { id: req.user.id } }).then(user => {
        user
          .update({ tribe: passion1.tribe }, { where: { id: req.user.id } })
          .then(user => {
            var user1 = _.pick(user, [
              'id',
              'first_name',
              'last_name',
              'fullname',
              'email',
              'phone',
              'location',
              'tribe',
              'gender',
              'associations',
              'country',
              'rating',
              'interests',
              'about',
              'links',
              'badges',
              'Professional_Headline',
              'profilepic',
              'onboarding'
            ]);
            res.status(200).send(user);
          })
          .catch(err => {
            res.send(500).json({ msg: err });
          });
      });
    });
});

router.patch('/removeprofilepic', authenticate, (req, res) => {
  var id = req.user.id;
  models.user.findOne({ where: { id: id } }).then(user => {
    user.update({ profilepic: '' }, { where: { id: id } }).then(user => {
      res.status(200).json({ msg: 'Profile Picture Removed' });
    });
  });
});

router.post('/forgot', function(req, res, next) {
  const email = req.body.email;
  crypto.randomBytes(20, function(err, buf) {
    var token = buf.toString('hex');
    models.user.findOne({ where: { email: req.body.email } }).then(user => {
      // console.log(user);
      if (!user) {
        res.status(404).json({ msg: 'No account Found' });
      }
      var resetPasswordToken = token;
      var resetPasswordExpires = Date.now() + 600000; // 10mins
      user
        .update(
          {
            resetPasswordToken: resetPasswordToken,
            resetPasswordExpires: resetPasswordExpires
          },
          { where: { id: user.id } }
        )
        .then(function(user) {
          sgMail.setApiKey(
            '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'
          );
          // console.log(user);
          const msg = {
            to: email,
            from: 'Tribeeco@gmail.com',
            subject: 'Password reset from Tribeeco',
            html:
              '<h3>You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n</h1>' +
              '<h3>Please click on the following link, or paste this into your browser to complete the process:\n\n<h3>' +
              'http://' +
              req.headers.host +
              '/reset/' +
              token +
              '\n\n' +
              '<h3>If you did not request this, please ignore this email and your password will remain unchanged.\n</h3>',
            cc: 'Tribeeco@gmail.com'
            // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
          };
          // console.log(msg);
          sgMail.send(msg).catch(err => {
            console.log(err.response.body.errors);
          });
        });
    });
  });
});

router.post('/reset/:token', (req, res) => {
  console.log({ $gte: moment().subtract(10, 'minutes') });
  models.user
    .findOne({
      where: {
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
          $lte: moment()
            .subtract(10, 'minutes')
            .toDate()
        }
      }
    })
    .then(user => {
      console.log(user);
      if (!user) {
        res.json({ msg: 'Password reset token is invalid or has expired.' });
      }
      user
        .update(
          {
            password: bcrypt.hashSync(req.body.password, 8),
            resetPasswordToken: '',
            resetPasswordExpires: ''
          },
          { where: { id: user.id } }
        )
        .then(user => {
          console.log(user);
          res
            .status(200)
            .json({ msg: 'Success! Your password has been changed.' });
        });
    });
});

module.exports = router;
