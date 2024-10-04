const express = require("express");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const db = require("../db/db");
const route = express.Router();
const jwt = require("jsonwebtoken");
const secret = "secret";
const getverification = require("./middleware");

// routes.patch("/", async (req, res) => {
const update = async (req, res) => {
  try {
    const { id, email } = req.body;
    const update = await db("users").where({ id: id }).update({
      email: email,
    });
    res.json({ update });
    return update;
  } catch (e) {
    console.error(e);
    res.json({ message: e });
    throw e;
  }
};

const loginApi = async (req, res) => {
  try {
    const data = {
      email: req.body.email,
      password: req.body.password,
    };
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });
    const { error, value } = schema.validate(data);
    if (error) {
      console.log("Validation error:", error.details[0].message);
    } else {
      const [userdata] = await db
        .select("*")
        .from("users")
        .where("email", data.email);
      const token = jwt.sign({ id: userdata.id }, secret); //
      console.log(userdata.id);

      const user = await db("users").where("email", data.email).first();
      if (user) {
        res.json({ message: "login success", token });
      } else {
        res.status(201).json({ message: "login failed Email not found" });
      }
    }
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: "err 400 bad request" });

    throw e;
  }
};
const getuserbyjwt = async (req, res) => {
  const id = req.user.id;
  const data = await db.select("*").from("users").where("id", id);
  console.table(data);
  res.json({ data });
};
const deleteById = async (req, res) => {
  try {
    const id = req.body.id;
    const token = await db("users").where({ id }).del();
    res.json({ token });
  } catch (e) {
    console.error(e);
    res.json({ message: e });
    throw e;
  }
};
const signupApi = async (req, res) => {
  try {
    let password = req.body.password;
    const data = {
      name: req.body.name,
      email: req.body.email,
    };
    const schema = Joi.object({
      name: Joi.string().min(3).required(),
      email: Joi.string().email().required(),
    });
    const { error, value } = schema.validate(data);
    if (error) {
      console.log("Validation error:", error.details[0].message);
    } else {
      const user = await db("users").where("email", data.email).first();
      console.log(user);
      if (user) {
        res.json({ message: "Email exists", user });
      } else {
        let passwordHash = await bcrypt.hashSync(password, 8);
        password = passwordHash;
        const id = await db("users").insert({
          name: data.name,
          email: data.email,
          password: password,
        });
        res.status(201).json({ message: "user hase been registered" });
      }
    }
  } catch (e) {
    console.error(e);
    res.json({ message: e });
    throw e;
  }
};

const lJoin = async (req, res) => {
  const [left_join] = await knex("doctor")
    .leftJoin("users", "doctor.user_id", "users.id")
    .select("doctor.patientName", "users.name as doctorName");

  const [rightJoin] = await knex("doctor")
    .rightJoin("users", "doctor.user_id", "users.id")
    .select("doctor.patientName", "users.name as doctorName");

  const [innerjoin] = await knex("doctor")
    .join("users", "doctor.user_id", "users.id")
    .select("doctor.patientName", "users.name as doctorName");

  const [fullOuterJoin] = await knex("doctor")
    .fullOuterJoin("users", "doctor.user_id", "users.id")
    .select("doctor.patientName", "users.name as doctorName");

  res.json({
    left_join: left_join,
    rightJoin: rightJoin,
    innerjoin: innerjoin,
    fullOuterJoin: fullOuterJoin,
  });
};

route.patch("/update", update);
route.post("/loginApi", loginApi);
route.delete("/deleteById", deleteById);
route.post("/signupApi", signupApi);
route.get("/getuserbyjwt", getverification, getuserbyjwt);
route.get("/lJoin", lJoin);

module.exports = route;
