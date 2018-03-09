const mongoose = require("mongoose");
const Project = require("../db/project.model");
const conf = require("../config/config.dev");
const auth = require("./auth.controller");
const mysql = require("mysql");
const connection = mysql.createConnection({
    host: conf.mysql_db,
    user: conf.mysql_user,
    password: conf.mysql_password,
    database: conf.database
});

// connection.connect();

module.exports.projectCreate = async (req, res) => {
    let tokenHeader = req.header("Authorization");
    let validObject = await auth.validateManager(tokenHeader, "create_project");
    console.log(validObject);
    if (validObject.tokenValid && validObject.roleValid) {
        Project.create({
            name: req.body.projectName,
            manager: mongoose.Types.ObjectId(validObject.manager),
            limit: req.body.limit
        })
            .then(doc => {
                res.status(201).json({project: doc._id})
            })
            .catch(err => {
                res.status(400).json({error: err})
            })
    } else {
        res.status(403).json({error: "Not Authorized"})
    }
};

module.exports.listProjects = async (req, res) => {
    try {
        let tokenHeader = req.header("Authorization");
        let validObject = await auth.validateManager(tokenHeader, "view_project");
        if (validObject.tokenValid && validObject.roleValid) {
            Project
                .find()
                .then(doc => {
                    res.status(200).json(doc)
                })
                .catch(err => {
                    res.status(400).json({error: err})
                })

        } else {
            res.status(403).json({error: "not authorized"})
        }
    } catch (err) {
        res.status(400).json({error: err})
    }

};

module.exports.updateProject = async (req, res) => {
  try {
      let tokenHeader = req.header("Authorization");
      let validObject = await auth.validateManager(tokenHeader, "modify_project");
      if (validObject.tokenValid && validObject.roleValid) {
          let projectId = req.params.projectId;
          Project
              .findByIdAndUpdate(
                  projectId,
                  req.body,
                  {new: true},
              )
              .then(doc => {
                  res.status(200).json(doc)
              })
              .catch(err => {
                  res.status(400).json({error: err})
              })
      } else {
          res.status(403).json({error: "not authorized"})
      }

  } catch (err) {
      res.status(400).json({error: err})
  }
};

module.exports.searchExpenseDb = async (req, res) => {
    try {
        let tokenHeader = req.header("Authorization");
        console.log(tokenHeader)
        let validObject = await auth.validateManager(tokenHeader, "create_project");
        console.log(validObject);
        if (validObject.tokenValid && validObject.roleValid) {
            console.log(validObject);
            let dynamicQuery = "SELECT name, pol_grp from expenses_detail WHERE pol_grp = '" + req.body.search + "'";
            console.log(dynamicQuery);
            connection.query(dynamicQuery, function(error, results, fields) {
                if (error) {
                    res.status(500).json(error);
                }
                res.status(200).json(results);
            })
        } else {
            res.status(403).json({error: "unauthorized"})
        }
    } catch (err) {
        res.status(500).send(err);
    }
};