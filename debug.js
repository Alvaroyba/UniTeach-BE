const searchModels = require("./app/models/searchModels");
const insModels = require("./app/models/inscriptionsModels");
const classModels = require("./app/models/classesModels");

async function test() {
  console.log("Fetching inscriptions for User 1...");
  try {
    const inscriptions = await insModels.getInscriptionByUserId(1);
    console.log("Inscriptions:", JSON.stringify(inscriptions, null, 2));

    for (let ins of inscriptions) {
      console.log(`Fetching class ${ins.Classes_idClasses} for user 1...`);
      const c = await classModels.getClassById(1, ins.Classes_idClasses);
      console.log("Class:", JSON.stringify(c, null, 2));
    }
  } catch (err) {
    console.error(err);
  }
}

test();
