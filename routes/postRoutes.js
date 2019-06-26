const express = require("express");
const authenticate = require("../middleware/authenticate");
const config = require("../middleware/config/config.js");
var bcrypt = require("bcryptjs");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
var cheerio = require("cheerio");
var models = require("../models");
const router = express.Router();
const Op = require("sequelize").Op;
const Sequelize = require("sequelize");
const { google } = require("googleapis");
const customsearch = google.customsearch("v1");
const GoogleNewsRss = require("google-news-rss");
const googleNews = new GoogleNewsRss();
var qs = require("qs");
var request = require("request");
const rp = require("request-promise-native");

var server = require("../server");
const socketIO = require("socket.io");
var io = socketIO(server);
const mobileSockets = {};

var fs = require("fs");
const restify = require("restify");
const uuidv4 = require("uuid/v4");
const { Storage } = require("@google-cloud/storage");

function notify(text, sender, receiver) {
  // io.on("connection", socket => {
  var notification = { sender: sender, receiver: receiver, text: text };
  // const receiversSocketId = mobileSockets[receiver.id];
  io.to(receiver.socketId).emit("incomingNotification", notification);
  // });
}

var multiparty = require("connect-multiparty");
multipartyMiddleware = multiparty();
router.use(multipartyMiddleware);

// router.get("/explore/:postid", authenticate, (req, res) => {
//   models.post.findOne({ where: { id: req.params.postid } }).then(post => {
//     var q = post.body;
//     q = q.replace(/<[^>]+>/g, "");
//     console.log(q);
//     googleNews
//       .search(q)
//       .then(result => {
//         res.status(200).send(result);
//       })
//       .catch(err => {
//         res.status(500).json({ msg: err });
//       });
//   });
// });

router.get("/topcontributors", authenticate, (req, res) => {
  tribe = req.user.tribe;
  models.user
    .findAll({
      order: [["numberofposts", "DESC"]],
      limit: 5,
      where: { tribe: tribe }
    })
    .then(users => {
      res.status(200).send(users);
    })
    .catch(err => {
      res.status(500).json({ msg: err });
    });
});

const CLOUD_BUCKET = "2209124121";
const storage = new Storage({
  projectId: "vinknjn-nkn8117",
  keyFilename: "tribeeco_key.json"
});
const bucket = storage.bucket(CLOUD_BUCKET);

router.post("/addpost", authenticate, function(req, res) {
  var id = req.user.id;
  let tags_ = [];
  if (req.body.linkPreview == true) {
    if (req.files.files) {
      const file = req.files.files;
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
        .on("error", err => {
          console.log(err);
          restify.InternalServerError(err);
        })
        .on("finish", () => {
          location = `https://storage.googleapis.com/${CLOUD_BUCKET}/${gcsname}`;
          console.log(location);
          rp({
            method: "POST",
            uri: "http://139.59.4.54:8882/",
            json: true,
            body: {
              text: req.body.body
            }
          })
            .then(function(parsedBody) {
              if (parsedBody.tags && parsedBody.tags != " ") {
                tags_ = parsedBody.tags.split(" ");
                tags_.splice(-1, 1);
              }
              console.log(tags_);
              models.post
                .create({
                  userId: req.user.id,
                  title: req.body.title,
                  body: req.body.body,
                  picture: location,
                  tags: tags_,
                  linkPreview: req.body.linkPreview,
                  link: req.body.link
                })
                .then(function(post) {
                  models.user.update(
                    { numberofposts: req.user.numberofposts + 1 },
                    { where: { id: id } }
                  );

                  res.status(200).json(post);
                })
                .catch(err => {
                  res.status(500).json({ error: err });
                });
            })
            .catch(function(err) {
              res.status(500).json({ msg: "Internal Server", error: err });
            });
        });
    } else
      rp({
        method: "POST",
        uri: "http://139.59.4.54:8882/",
        json: true,
        body: {
          text: req.body.body
        }
      })
        .then(function(parsedBody) {
          if (parsedBody.tags && parsedBody.tags != " ") {
            tags_ = parsedBody.tags.split(" ");
            tags_.splice(-1, 1);
          }
          console.log(tags_);
          models.post
            .create({
              userId: req.user.id,
              title: req.body.title,
              body: req.body.body,
              tags: tags_,
              link: req.body.links,
              linkPreview: req.body.linkPreview
            })
            .then(function(post) {
              models.user.update(
                { numberofposts: req.user.numberofposts + 1 },
                { where: { id: id } }
              );

              res.status(200).json(post);
            })
            .catch(err => {
              res.status(500).json({ error: err });
            });
        })
        .catch(err => {
          res.status(500).json({ msg: "Internal Server", error: err });
        });
  } else {
    if (req.files.files) {
      const file = req.files.files;
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
        .on("error", err => {
          console.log(err);
          restify.InternalServerError(err);
        })
        .on("finish", () => {
          location = `https://storage.googleapis.com/${CLOUD_BUCKET}/${gcsname}`;
          console.log(location);
          rp({
            method: "POST",
            uri: "http://139.59.4.54:8882/",
            json: true,
            body: {
              text: req.body.body
            }
          })
            .then(function(parsedBody) {
              if (parsedBody.tags && parsedBody.tags != " ") {
                tags_ = parsedBody.tags.split(" ");
                tags_.splice(-1, 1);
              }
              console.log(tags_);
              models.post
                .create({
                  userId: req.user.id,
                  title: req.body.title,
                  body: req.body.body,
                  picture: location,
                  tags: tags_,
                  linkPreview: false
                })
                .then(function(post) {
                  models.user.update(
                    { numberofposts: req.user.numberofposts + 1 },
                    { where: { id: id } }
                  );

                  res.status(200).json(post);
                })
                .catch(err => {
                  res.status(500).json({ error: err });
                });
            })
            .catch(function(err) {
              res.status(500).json({ msg: "Internal Server", error: err });
            });
        });
    } else
      rp({
        method: "POST",
        uri: "http://139.59.4.54:8882/",
        json: true,
        body: {
          text: req.body.body
        }
      })
        .then(function(parsedBody) {
          if (parsedBody.tags && parsedBody.tags != " ") {
            tags_ = parsedBody.tags.split(" ");
            tags_.splice(-1, 1);
          }
          console.log(tags_);
          models.post
            .create({
              userId: req.user.id,
              title: req.body.title,
              body: req.body.body,
              tags: tags_,
              linkPreview: false
            })
            .then(function(post) {
              models.user.update(
                { numberofposts: req.user.numberofposts + 1 },
                { where: { id: id } }
              );

              res.status(200).json(post);
            })
            .catch(err => {
              res.status(500).json({ error: err });
            });
        })
        .catch(err => {
          res.status(500).json({ msg: "Internal Server", error: err });
        });
  }
});

router.get("/myposts", authenticate, (req, res) => {
  models.post
    .findAll({
      include: [
        models.like,
        models.comment,
        {
          model: models.user,
          where: { id: req.user.id },
          attributes: ["fullname", "Professional_Headline", "profilepic"]
        }
      ]
    })
    .then(posts => {
      posts.forEach(function(post) {
        post.dataValues.status = "";
        post.likes.forEach(like => {
          // console.log(like);
          if ((like.userId = id && like.status == true)) {
            post.dataValues.status = "relevant";
          } else if ((like.userId = id && like.status == false)) {
            post.dataValues.status = "irrelevant";
          }
        });
      });
      res.status(200).send(posts);
    });
});

router.post("/addproject", authenticate, function(req, res) {
  const project = models.project.build({
    userId: req.user.id,
    title: req.body.title,
    projectname: req.body.projectname,
    body: req.body.body,
    memberQuantity: req.body.memberQuantity,
    vision: req.body.vision,
    stage: req.body.stage,
    schedule: req.body.schedule,
    tags: req.body.tags,
    resources: req.body.tags,
    socialLinks: req.body.socialLinks
  });
  project
    .save()
    .then(function(project) {
      const arr = req.body.members;
      arr.map(member => {
        models.projectmember
          .create({
            userId: member.id,
            status: "requested",
            projectId: project.id,
            role: member.role
          })
          .then(prmember => {
            models.user.findOne({ where: { id: member.id } }).then(user => {
              const text =
                req.user.name + " want you as a participant in his project";
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
            res.status(500).json({ error: err });
          });
      });
      return res.status(200).json(project);
    })
    .catch(err => {
      res.status(500).json({ msg: err });
    });
});

router.patch("/acceptprojectrequest/:projectId", authenticate, function(
  req,
  res
) {
  const projectId = req.params.projectId;
  userId = req.user.id;
  models.projectmember
    .update(
      { status: "connected" },
      { where: { projectId: projectId, userId: userId } }
    )
    .then(projectconnect => {
      models.project.findOne({ where: { id: projectId } }).then(project => {
        model.user.findOne({ where: { id: project.userId } }).then(user => {
          const text = req.user.name + " accepted your project request";
          const receiver = {
            name: user.name,
            id: user.id,
            socketId: user.socketId
          };
          const sender = { name: req.user.name, id: req.user.id };
          notify(text, sender, receiver);
        });
      });
      res.status(200).send(projectconnect);
    })
    .catch(err => {
      res.status(500).json({ msg: err });
    });
});

router.post("/addprojectimage/:projectId", authenticate, (req, res) => {
  const file = req.files.files;
  projectId = req.params.projectId;

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
    .on("error", err => {
      console.log(err);
      restify.InternalServerError(err);
    })
    .on("finish", () => {
      location = `https://storage.googleapis.com/${CLOUD_BUCKET}/${gcsname}`;
      models.project.findOne({ where: { id: projectId } }).then(project => {
        project
          .update({ file: location }, { where: { id: projectId } })
          .then(project => {
            res.status(200).send({ msg: "File uploaded" });
          });
      });
    });
});

router.get("/project/:id", authenticate, function(req, res) {
  const id = req.params.id;
  models.project
    .findOne({
      where: { id: id },
      include: [
        {
          model: models.user,
          attributes: ["id", "fullname", "Professional_Headline", "profilepic","createdAt"]
        }
      ]
    })
    .then(project => {
      if (!project) {
        res.status(404).json({ msg: "No Project" });
      }

      models.projectmember
        .findAll({
          where: { projectId: project.id },
          include: {
            model: models.user,
            attributes: ["id", "fullname", "profilepic"]
          }
        })
        .then(members => {
          res.status(200).json({ project: project, members: members });
        });
    });
});

router.get("/myprojects", authenticate, (req, res) => {
  models.project
    .findAll({
      attributes: [
        "id",
        "body",
        "title",
        "userId",
        "memberQuantity",
        "projectname",
        "vision",
        "stage",
        "schedule",
        "tags",
        "resources",
        "createdAt"
      ],
      include: [
        {
          model: models.user,
          where: { id: req.user.id },
          attributes: ["fullname", "Professional_Headline", "profilepic"]
        },
        {
          model: models.projectmember,
          // where:{status:"requested"},
          attributes: ["userId", "status"]
        }
      ]
    })
    .then(users => {
      if (!users) {
        res.status(404).json({ msg: "No Projects" });
      }
      res.status(200).json(users);
    });
});

router.get("/projects/:userId", authenticate, (req, res) => {
  var userId = req.params.userId;
  models.project
    .findAll({ where: { userId: userId } })
    .then(projects => {
      res.status(200).send(projects);
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
});

router.get("/posts/:userId", authenticate, (req, res) => {
  const userId = req.params.userId;
  models.post
    .findAll({
      where: { userId: userId },
      attributes: ["id", "userId", "body", "title", "createdAt", "picture"],
      include: [
        {
          model: models.like,
          attributes: ["userId", "status"]
        },
        models.comment,
        {
          model: models.user,
          attributes: ["id", "fullname", "Professional_Headline", "profilepic"]
        }
      ]
    })
    .then(posts => {
      if (posts.length == 0) {
        res.status(200).json({ msg: "No Posts Found" });
      }

      posts.forEach(post => {
        post.dataValues.status = "";
        post.likes.forEach(like => {
          if (like.userId == userId && like.status == true)
            post.dataValues.status = "relevant";
          else if (like.userId == userId && like.status == false)
            post.dataValues.status = "irrelevant";
        });
      });

      res.status(200).json(posts);
    })
    .catch(err => {
      res.status(500).json({ msg: err });
    });
});

router.get("/explorelocal/:postId", authenticate, function(req, res) {
  models.post
    .findOne({ where: { id: req.params.postId } })
    .then(async function(post) {
      const arr = post.tags;
      let posts;
      try {
        posts = await models.post.findAll({
          order: [["createdAt", "DESC"]],
          where: { tags: { [Sequelize.Op.overlap]: arr } },
          attributes: ["id", "body", "title", "userId", "createdAt", "picture"],
          include: [
            {
              model: models.like,
              attributes: ["userId"]
            },
            models.comment,
            {
              model: models.user,
              attributes: [
                "id",
                "fullname",
                "Professional_Headline",
                "tribe",
                "profilepic"
              ]
            }
          ]
        });
      } catch (err) {
        res.status(400).json({ msg: err });
      }
      posts1 = posts.filter(item => item.id != req.params.postId);
      posts1.forEach(function(post) {
        post.dataValues.status = "";
        post.likes.forEach(like => {
          // console.log(like);
          if (like.userId == id && like.status == true) {
            post.dataValues.status = "relevant";
          } else if (like.userId == id && like.status == false) {
            post.dataValues.status = "irrelevant";
          }
        });
        res.status(200).send(posts1);
      });
    });
});

// router.get("/explorelocal/:postid", authenticate, function(req, res) {
//   console.log(req.params.postid);
//   models.post
//     .findOne({ where: { id: req.params.postid } })
//     .then(async function(post) {
//       console.log(post.title);
//       title = post.title;
//       let relatedPosts;
//       try {
//         relatedPosts = await models.post.findAll({
//           order: [["createdAt", "DESC"]],
//           where: { title },
//           attributes: ["id", "body", "title", "userId", "createdAt", "picture"],
//           include: [
//             {
//               model: models.like,
//               attributes: ["userId"]
//             },
//             models.comment,
//             {
//               model: models.user,
//               attributes: [
//                 "id",
//                 "fullname",
//                 "Professional_Headline",
//                 "tribe",
//                 "profilepic"
//               ]
//             }
//           ]
//         });
//       } catch (err) {
//         res.status(400).send(err);
//       }
//       let relatedProjects;
//       try {
//         relatedProjects = await models.project.findAll({
//           order: [["createdAt", "DESC"]],
//           where: { title },
//           attributes: [
//             "id",
//             "body",
//             "title",
//             "userId",
//             "memberQuantity",
//             "projectname",
//             "vision",
//             "stage",
//             "schedule",
//             "tags",
//             "resources",
//             "createdAt"
//           ],
//           include: [
//             {
//               model: models.user,
//               attributes: [
//                 "fullname",
//                 "Professional_Headline",
//                 "tribe",
//                 "profilepic"
//               ]
//             },
//             {
//               model: models.projectmember,
//               where: { status: "connected" },
//               attributes: ["userId", "status"]
//             }
//           ]
//         });
//       } catch (err) {
//         res.status(400).send(err);
//       }
//       newrelatedPosts = _.remove(relatedPosts, function(post1) {
//         return post1.id != post.id;
//       });
//       newrelatedPosts.forEach(function(post) {
//         post.dataValues.status = "";
//         post.likes.forEach(like => {
//           // console.log(like);
//           if ((like.userId = id && like.status == true)) {
//             post.dataValues.status = "relevant";
//           } else if ((like.userId = id && like.status == false)) {
//             post.dataValues.status = "irrelevant";
//           }
//         });
//       });
//       res.status(200).json({
//         relatedProjects: relatedProjects,
//         relatedPosts: newrelatedPosts
//       });
//     });
// });

router.get("/allprojects", authenticate, async function(req, res) {
  let latest;
  try {
    latest = await models.project.findAll({
      order: [["createdAt", "DESC"]],
      attributes: [
        "id",
        "body",
        "title",
        "userId",
        "memberQuantity",
        "projectname",
        "vision",
        "stage",
        "schedule",
        "tags",
        "resources",
        "createdAt"
      ],
      include: [
        {
          model: models.user,
          where: { tribe: req.user.tribe },
          attributes: ["fullname", "Professional_Headline", "profilepic"]
        },
        {
          model: models.projectmember,
          // where:{status:"connected"},
          attributes: ["userId", "status"]
        }
      ]
    });
  } catch (err) {
    res.status(400).send(err);
  }
  //  res.status(200).json(latest);

  let trending;
  try {
    trending = await models.project.findAll({
      // order: [["updatedAt", "DESC"]],
      limit: 5,
      attributes: [
        "id",
        "body",
        "title",
        "userId",
        "memberQuantity",
        "vision",
        "stage",
        "schedule",
        "tags",
        "resources",
        "createdAt"
      ],
      include: [
        {
          model: models.user,
          where: { tribe: req.user.tribe },
          attributes: ["fullname", "Professional_Headline", "profilepic"]
        },
        {
          model: models.projectmember,
          // where:{status:"connected"},
          attributes: ["userId", "status"]
        }
      ]
    });
  } catch (err) {
    res.status(400).send(err);
  }
  // res.status(200).json(trending);
  let recommended;
  try {
    recommended = await models.project.findAll({
      order: Sequelize.literal("random()"),
      limit: 3,
      attributes: [
        "id",
        "body",
        "title",
        "userId",
        "memberQuantity",
        "vision",
        "stage",
        "schedule",
        "tags",
        "resources",
        "createdAt"
      ],
      include: [
        {
          model: models.user,
          where: { tribe: req.user.tribe },
          attributes: ["fullname", "Professional_Headline", "profilepic"]
        },
        {
          model: models.projectmember,
          attributes: ["userId", "status"]
        }
      ]
    });
  } catch (err) {
    res.status(400).send(err);
  }
  //    res.status(200).json(recommended);
  res
    .status(200)
    .json({ latest: latest, trending: trending, recommended: recommended });
});

// router.get("/allposts", authenticate, (req, res) => {
//   var userId = req.user.id;
//   models.post.findAll({
//     attributes:["body","userId","picture"],
//     include:[
//       {model:models.user,attributes:["fullname", "Professional_Headline", "profilepic"]},
//       {model:models.comment,
//       include:[{model:models.user,attributes:["fullname", "Professional_Headline", "profilepic"]}]},
//       {model:models.like,
//       attributes:["userId"],
//       include:[{model:models.user,attributes:["fullname", "Professional_Headline", "profilepic"]}]}
//     ]
//   }).then(posts=>{
//     res.status(200).send(posts);
//   });
// });

router.get("/recommendposts", authenticate, async function(req, res) {
  const id = req.user.id;

  let allposts;
  try {
    allposts = await models.post.findAll({
      attributes: ["id", "body", "userId", "createdAt"],
      include: [
        {
          model: models.user,
          where: { tribe: req.user.tribe },
          attributes: ["fullname", "Professional_Headline", "profilepic"]
        },
        {
          model: models.comment,
          include: [
            {
              model: models.user,
              attributes: ["fullname", "Professional_Headline", "profilepic"]
            }
          ]
        },
        {
          model: models.like,
          attributes: ["userId", "status"],
          include: [
            {
              model: models.user,
              attributes: ["fullname", "Professional_Headline", "profilepic"]
            }
          ]
        }
      ]
    });
  } catch (err) {
    res.status(400).send(err);
  }

  let liked;
  try {
    liked = await models.like.findAll({
      where: { userId: id, status: true },
      include: [
        {
          model: models.post,
          attributes: ["body", "id", "picture"],
          include: [
            {
              model: models.user,
              attributes: ["fullname", "Professional_Headline", "profilepic"]
            }
          ]
        }
      ]
    });
  } catch (err) {
    res.status(400).send(err);
  }

  let commented;
  try {
    commented = await models.comment.findAll({
      where: { userId: id },
      include: [
        {
          model: models.post,
          attributes: ["body", "id", "picture"],
          include: [
            {
              model: models.user,
              attributes: ["fullname", "Professional_Headline", "profilepic"]
            }
          ]
        }
      ]
    });
  } catch (err) {
    res.status(400).send(err);
  }

  let events;
  try {
    events = await models.event.findAll({
      where: {
        date: {
          [Op.gt]: new Date()
        }
      },
      include: [
        {
          model: models.eventcomment,
          include: [
            {
              model: models.user,
              attributes: ["fullname", "Professional_Headline", "profilepic"]
            }
          ],
          attributes: ["eventId", "userId", "body"]
        },
        {
          model: models.interested,
          include: [
            {
              model: models.user,
              attributes: ["fullname", "Professional_Headline", "profilepic"]
            }
          ],
          attributes: ["eventId", "userId", "status"]
        }
      ],
      attributes: [
        "id",
        "eventName",
        "about",
        "tags",
        "date",
        "duration",
        "createdAt",
        "venue"
      ]
    });
  } catch (err) {
    res.status(400).send(err);
  }

  events.forEach(function(event) {
    event.dataValues.status = "";
    event.interesteds.forEach(interested => {
      if (interested.userId == id && interested.status == true) {
        event.dataValues.status = "interested";
      } else if (interested.userId == id && interested.status == false) {
        event.dataValues.status = "notinterested";
      }
    });
  });

  var options = {
    method: "POST",
    uri: "http://139.59.4.54:8882/recommend",
    body: { allposts, liked, commented },
    json: true
  };

  rp(options)
    .then(function(parsedBody) {
      let allData = _.orderBy(
        events.concat(parsedBody.data),
        ["createdAt"],
        ["desc"]
      );
      res.status(200).json(allData);
    })
    .catch(function(err) {
      res.status(500).json({ msg: "Internal Server", error: err });
    });
});

router.patch("/updateproject/:projectId", authenticate, function(req, res) {
  const id = req.params.projectId;
  models.project
    .update((values = req.body), { where: { id: id } })
    .then(post => {
      res.status(200).json({ msg: "Post Updated" });
    })
    .catch(err => {
      res.status(404).json({ msg: err });
    });
});

router.patch("/updatepost/:postId", authenticate, function(req, res) {
  const id = req.params.postId;
  models.post
    .update((values = req.body), { where: { id: id } })
    .then(post => {
      res.status(200).json({ msg: "Post Updated" });
    })
    .catch(err => {
      res.status(404).json({ msg: err });
    });
});

router.post("/relevant/:postId", authenticate, function(req, res) {
  const postId = req.params.postId;
  models.like
    .findOne({ where: { userId: req.user.id, postId: req.params.postId } })
    .then(like => {
      if (like) {
        if (like.status == true) {
          models.like.destroy({
            where: { userId: req.user.id, postId: req.params.postId }
          });
          res.status(200).json({ msg: "No Response" });
        } else {
          models.like
            .update(
              { status: true },
              { where: { userId: req.user.id, postId: req.params.postId } }
            )
            .then(like => {
              res.status(200).json({ msg: "Marked Relevant" });
              models.post.findOne({ where: { id: postId } }).then(post => {
                models.user
                  .findOne({ where: { id: post.userId } })
                  .then(user => {
                    const text =
                      req.user.name + " marked your post as relevant";
                    const receiver = {
                      name: user.name,
                      id: user.id,
                      socketId: user.socketId
                    };
                    const sender = { name: req.user.name, id: req.user.id };
                    notify(text, sender, receiver);
                  });
              });
            })
            .catch(err => {
              res.status(500).json({ msg: err });
            });
        }
      } else {
        const like = models.like.build({
          status: true,
          userId: req.user.id,
          postId: req.params.postId
        });
        like
          .save()
          .then(function(like) {
            res.status(200).json({ msg: "Marked Relevant" });
            models.post.findOne({ where: { id: postId } }).then(post => {
              models.user.findOne({ where: { id: post.userId } }).then(user => {
                const text =
                  req.user.fullname + " marked your post as relevant";
                const receiver = {
                  name: user.fullname,
                  id: user.id,
                  socketId: user.socketId
                };
                const sender = { name: req.user.fullname, id: req.user.id };
                notify(text, sender, receiver);
              });
            });
          })
          .catch(err => {
            res.status(500).json({ msg: err });
          });
      }
    });
});

router.post("/irrelevant/:postId", authenticate, function(req, res) {
  models.like
    .findOne({ where: { userId: req.user.id, postId: req.params.postId } })
    .then(like => {
      if (like) {
        if (like.status == false) {
          models.like.destroy({
            where: { userId: req.user.id, postId: req.params.postId }
          });
          res.status(200).json({ msg: "No Response" });
        } else {
          models.like
            .update(
              { status: false },
              { where: { userId: req.user.id, postId: req.params.postId } }
            )
            .then(like => {
              res.status(200).json({ msg: "Marked Irrelevant" });
              models.post.findOne({ where: { id: postId } }).then(post => {
                models.user
                  .findOne({ where: { id: post.userId } })
                  .then(user => {
                    const text =
                      req.user.name + " marked your post as irrelevant";
                    const receiver = {
                      name: user.name,
                      id: user.id,
                      socketId: user.socketId
                    };
                    const sender = { name: req.user.name, id: req.user.id };
                    notify(text, sender, receiver);
                  });
              });
            })
            .catch(err => {
              res.status(500).json({ msg: err });
            });
        }
      } else {
        const like = models.like.build({
          status: false,
          userId: req.user.id,
          postId: req.params.postId
        });
        like
          .save()
          .then(function(like) {
            res.status(200).json({ msg: "Marked Irrelevant" });
            models.post.findOne({ where: { id: postId } }).then(post => {
              models.user.findOne({ where: { id: post.userId } }).then(user => {
                const text = req.user.name + " marked your post as relevant";
                const receiver = {
                  name: user.name,
                  id: user.id,
                  socketId: user.socketId
                };
                const sender = { name: req.user.name, id: req.user.id };
                notify(text, sender, receiver);
              });
            });
          })
          .catch(err => {
            res.status(500).json({ msg: err });
          });
      }
    });
});

router.post("/comment/:postId", authenticate, function(req, res) {
  const comment = models.comment.build({
    userId: req.user.id,
    postId: req.params.postId,
    body: req.body.body
  });
  comment
    .save()
    .then(function(comment) {
      models.post
        .findOne({
          where: { id: req.params.postId },
          include: [
            {
              model: models.user,
              attributes: ["fullname", "id", "socketId"]
            }
          ]
        })
        .then(post => {
          const text = req.user.fullname + " commented on your post.";
          const receiver = {
            name: post.user.fullname,
            id: post.user.id,
            socketId: post.user.socketId
          };
          const sender = { name: req.user.fullname, id: req.user.id };
          // console.log(text,sender,receiver);
          notify(text, sender, receiver);

          res.status(200).send(comment);
        });
    })
    .catch(err => {
      res.status(500).json({ msg: err });
    });
});

router.get("/comments/:postId", authenticate, function(req, res) {
  models.post
    .findOne({
      where: { id: req.params.postId },
      attributes: ["id", "body", "title", "userId", "createdAt"],
      include: [
        {
          model: models.comment,
          where: { postId: req.params.postId },
          order: [["createdAt", "DESC"]],
          attributes: ["id", "body", "createdAt", "userId"],
          include: [
            {
              model: models.user,
              attributes: ["fullname", "Professional_Headline", "profilepic"]
            }
          ]
        }
      ]
    })
    .then(users => {
      res.json(users);
    });
});

router.get("/relevants/:postId", authenticate, function(req, res) {
  models.post
    .findOne({
      where: { id: req.params.postId, status: true },
      attributes: ["id", "body", "title", "userId", "createdAt"],
      include: [
        {
          model: models.like,
          where: { postId: req.params.postId },
          order: [["createdAt", "DESC"]],
          attributes: ["id", "userId", "createdAt"],
          include: [
            {
              model: models.user,
              attributes: ["fullname", "Professional_Headline", "profilepic"]
            }
          ]
        }
      ]
    })
    .then(users => {
      res.json(users);
    });
});

router.get("/irrelevants/:postId", authenticate, function(req, res) {
  models.post
    .findOne({
      where: { id: req.params.postId, status: false },
      attributes: ["id", "body", "title", "userId", "createdAt"],
      include: [
        {
          model: models.like,
          where: { postId: req.params.postId },
          order: [["createdAt", "DESC"]],
          attributes: ["id", "userId", "createdAt"],
          include: [
            {
              model: models.user,
              attributes: ["fullname", "Professional_Headline", "profilepic"]
            }
          ]
        }
      ]
    })
    .then(users => {
      res.json(users);
    });
});

router.get("/feed/tribe", authenticate, function(req, res) {
  var id = req.user.id;
  models.post
    .findAll({
      order: [["createdAt", "DESC"]],
      attributes: ["id", "body", "title", "userId", "createdAt", "picture"],
      include: [
        {
          model: models.like,
          attributes: ["userId", "status"]
        },
        models.comment,
        {
          model: models.user,
          where: { tribe: req.user.tribe },
          attributes: ["fullname", "Professional_Headline", "profilepic"]
        }
      ]
    })
    .then(posts => {
      posts.forEach(function(post) {
        post.dataValues.status = "";
        post.likes.forEach(like => {
          // console.log(like);
          if (like.userId == id && like.status == true) {
            post.dataValues.status = "relevant";
          } else if (like.userId == id && like.status == false) {
            post.dataValues.status = "irrelevant";
          }
        });
      });
      res.status(200).send(posts);
    });
});

router.get("/feed/following", authenticate, (req, res) => {
  const userId = req.user.id;
  let connections = [];

  models.connection
    .findAll({ where: { senderId: req.user.id } })
    .then(users => {
      connections = users.map(user => user.receiverId);
      models.post
        .findAll({
          where: {
            userId: {
              [Op.in]: connections
            }
          },
          order: [["createdAt", "DESC"]],
          attributes: ["id", "body", "title", "userId", "createdAt", "picture"],
          include: [
            {
              model: models.like,
              attributes: ["userId", "status"]
            },
            models.comment,
            {
              model: models.user,
              attributes: [
                "id",
                "fullname",
                "Professional_Headline",
                "profilepic"
              ]
            }
          ]
        })
        .then(posts => {
          posts.forEach(function(post) {
            post.dataValues.status = "";
            post.likes.forEach(like => {
              if ((like.userId = userId && like.status == true))
                post.dataValues.status = "relevant";
              else if ((like.userId = userId && like.status == false))
                post.dataValues.status = "irrelevant";
            });
          });
          res.status(200).send(posts);
        })
        .catch(error => {
          res.status(500).json({ error });
        });
    });
});

router.get("/searchprojects", authenticate, function(req, res) {
  var query1 = req.query();
  query1 = query1.split("=");
  query = query1.filter(item => item != "q");
  console.log(query);

  var query = query + "%";
  models.project
    .findAll({ where: { title: { $iLike: query } }, limit: 10 })
    .then(projects => {
      res.status(200).send(projects);
    })
    .catch(err => {
      res.status(500).json({ msg: err });
    });
});

router.get("/searchposts", function(req, res) {
  var queryObj = qs.parse(req.query());
  var query = queryObj.q + "%";
  models.post
    .findAll({ where: { title: { $iLike: query } } })
    .then(posts => {
      if (!posts) {
        res.status(404).json({ msg: "No posts found" });
      }
      res.status(200).send(posts);
    })
    .catch(err => {
      res.status(500).json({ msg: err });
    });
});

var arr1 = [
  "Improve your skills",
  "Gain more knowledge",
  "Grow your team",
  "Start a company / business",
  "Explore other companies / verticals / opportunities",
  "Grow / expand your business/company",
  "Invest",
  "Explore new projects",
  "Mentor others",
  "Organize events",
  "Raise funding",
  "Find a co-founder or partner",
  "Grow your network",
  "Find my passion"
];
var arr2 = [
  "Tutorals",
  "Researches",
  "Community",
  "Starting Issues",
  "Companies",
  "Expanding Issues",
  "Investment Plans",
  "Startups",
  "Mentorship Skills",
  "Events Organizing",
  "Raise Fundings",
  "Find cofounder social Apps",
  "Community People",
  "Career Opportunities"
];

router.get("/explore/:postid", authenticate, (req, res) => {
  models.post.findOne({ where: { id: req.params.postid } }).then(post => {
    var q = post.body;
    q = q.replace(/<[^>]+>/g, "");
    console.log(q);
    request.post(
      {
        headers: { "content-type": "application/json" },
        url: "http://139.59.4.54:8882/",
        body: JSON.stringify({
          text: q
        })
      },
      (error, response, body) => {
        if (error) {
          res.status(500).json({ msg: "Internal Server" });
        }
        body = JSON.parse(body);
        console.log(body.tags);
        var index = arr1.indexOf(req.user.objectives[0]);

        googleNews
          .search(body.tags + " " + arr2[index])
          .then(result => {
            res.status(200).send(result);
          })
          .catch(err => {
            res.status(500).json({ msg: err });
          });
      }
    );
  });
});

router.post("/addevent", authenticate, (req, res) => {
  models.event
    .create({
      eventName: req.body.eventName,
      userId: req.user.id,
      date: req.body.date,
      duration: req.body.duration,
      venue: req.body.venue,
      about: req.body.about,
      tags: req.body.tags,
      schedule: req.body.schedule,
      link: req.body.link,
      published: req.body.published
    })
    .then(async function(event) {
      await Promise.all([
        event.setHosts(req.body.cohosts, { through: { role: "cohost" } }),
        event.setHosts(req.body.hosts, { through: { role: "host" } })
      ]);

      res.status(200).json(event);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ msg: err });
    });
});

router.post("/addeventimage/:eventId", authenticate, (req, res) => {
  const file = req.files.files;
  id = req.params.eventId;
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
    .on("error", err => {
      console.log(err);
      restify.InternalServerError(err);
    })
    .on("finish", () => {
      location = `https://storage.googleapis.com/${CLOUD_BUCKET}/${gcsname}`;
      models.event.findOne({ where: { id: id } }).then(event => {
        event.update({ image: location }, { where: { id: id } }).then(event => {
          res.status(200).send(event);
        });
      });
    });
});

router.get("/event/:id", authenticate, (req, res) => {
  const id = req.params.id;
  models.event
    .findOne({
      where: { id: id },
      include: [
        {
          model: models.user,
          as: "hosts",
          attributes: ["fullname", "id", "profilepic"],
          through: { model: models.eventhost }
        }
      ]
    })
    .then(event => {
      if (!event) {
        res.status(404).json({ msg: "No event found" });
      }
      res.status(200).send(event);
    })
    .catch(err => {
      res.status(500).json({ msg: err });
    });
});

router.patch("/updateevent/:id", authenticate, function(req, res) {
  const id = req.params.id;
  models.event
    .update((values = req.body), { returning: true, where: { id: id } })
    .then(async function([rowsUpdate, [event]]) {
      await Promise.all([
        event.setHosts(req.body.cohosts, { through: { role: "cohost" } }),
        event.setHosts(req.body.hosts, { through: { role: "host" } })
      ]);
      res.status(200).json(event);
    })
    .catch(err => {
      res.status(500).json({ msg: err });
    });
});

router.get("/drafts", authenticate, (req, res) => {
  models.event
    .findAll({
      where: { userId: req.user.id, published: false },
      order: [["updatedAt", "DESC"]]
    })
    .then(events => {
      res.status(200).json(events);
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
});

router.get("/myevents", authenticate, (req, res) => {
  models.event
    .findAll({
      where: { userId: req.user.id, published: true },
      order: [["date", "DESC"]]
    })
    .then(events => {
      res.status(200).json(events);
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
});

router.get("/allevents", authenticate, (req, res) => {
  models.event
    .findAll({ where: { published: true } })
    .then(events => {
      res.status(200).json(events);
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
});

router.post("/interested/:eventId", authenticate, (req, res) => {
  models.interested
    .findOne({ where: { userId: req.user.id, eventId: req.params.eventId } })
    .then(interested => {
      if (interested) {
        if (interested.status == true) interested.destroy();
        else
          interested
            .update({ status: true })
            .then(interested => {
              res.status(200).json({ msg: "Marked as Interested" });
            })
            .catch(err => {
              res.status(500).json({ error: err });
            });
      } else {
        models.interested
          .create({
            status: true,
            userId: req.user.id,
            eventId: req.params.eventId
          })
          .then(function(interested) {
            res.status(200).json({ msg: "Marked as Interested" });
          })
          .catch(err => {
            res.status(500).json({ error: err });
          });
      }
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
});

router.post("/notinterested/:eventId", authenticate, (req, res) => {
  models.interested
    .findOne({ where: { userId: req.user.id, eventId: req.params.eventId } })
    .then(interested => {
      if (interested) {
        if (interested.status == false) interested.destroy();
        else {
          interested
            .update({ status: false })
            .then(interested => {
              res.status(200).json({ msg: "Marked as Not Interested" });
            })
            .catch(err => {
              res.status(500).json({ error: err });
            });
        }
      } else {
        models.interested
          .create({
            status: false,
            userId: req.user.id,
            eventId: req.params.eventId
          })
          .then(function(interested) {
            res.status(200).json({ msg: "Marked Not Iinterested" });
          })
          .catch(err => {
            res.status(500).json({ error: err });
          });
      }
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
});

router.post("/eventcomment/:eventId", authenticate, function(req, res) {
  const eventcomment = models.eventcomment.build({
    userId: req.user.id,
    eventId: req.params.eventId,
    body: req.body.body
  });
  eventcomment
    .save()
    .then(function(eventcomment) {
      res.status(200).json(eventcomment);
    })
    .catch(err => {
      res.status(500).json({ msg: err });
    });
});

router.get("/eventcomments/:eventId", authenticate, (req, res) => {
  models.eventcomment
    .findAll({
      where: { eventId: req.params.eventId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: models.user,
          attributes: ["fullname", "Professional_Headline", "profilepic"]
        }
      ]
    })
    .then(comments => {
      res.status(200).send(comments);
    });
});

router.post("/scrapeLink", (req, res) => {
  const url = req.body.url;

  rp({
    method: "GET",
    uri: url
  })
    .then(function(parsedBody) {
      const $ = cheerio.load(parsedBody);
      let title = $("title").text();
      const ogTitle = $("meta[property='og:title']").attr("content");
      if (ogTitle) title = ogTitle;
      const desc = $("meta[name=description]").attr("content");
      const image = $('meta[property="og:image"]').attr("content");

      res.status(200).json({
        title,
        desc,
        image,
        url
      });
    })
    .catch(function(err) {
      res.status(500).json({ msg: "Server Error", error: err });
    });
});

// sudo kill -9 $(sudo lsof -t -i:8000)

module.exports = router;
