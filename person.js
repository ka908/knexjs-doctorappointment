const personService = require("../sevice/person");

class PersonController {
  async createPerson(req, res) {
    // This method is called when a POST request is sent to /person
    try {
      const id = await personService.createPerson(req.body);

      res.status(201).json(id);
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
      throw err;
    }
  }
}

module.exports = new PersonController();
