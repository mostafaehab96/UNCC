const fs = require("fs/promises");

(async () => {
  const createFile = async (path) => {
    try {
      const file = await fs.open(path, "r");
      file.close();
      console.log("The file already exists");
    } catch (e) {
      await fs.writeFile(path, "");
      console.log("The file was created successfully");
    }
  };

  const deleteFile = async (path) => {
    try {
      await fs.rm(path);
      console.log("The file was successfully removed");
    } catch (e) {
      if (e.code === "ENOENT") console.log("The file doesn't exist");
      else console.log("Error occurred!", e);
    }
  };

  const renameFile = async (path, newPath) => {
    try {
      await fs.rename(path, newPath);
      console.log("The file was successfully renamed");
    } catch (e) {
      if (e.code === "ENOENT") console.log("The file doesn't exist");
      else console.log("Error occurred!", e);
    }
  };

  let addedContent;

  const appendToFile = async (path, content) => {
    if (addedContent === content) return;
    try {
      await fs.appendFile(path, content);
      addedContent = content;
      console.log("The content was added successfully");
    } catch (e) {
      if (e.code === "ENOENT") console.log("The file doesn't exist");
      else console.log("Error occurred!", e);
    }
  };
  //Commands
  const CREATE_FILE = "create a file";
  const DELETE_FILE = "delete the file";
  const RENAME_FILE = "rename the file";
  const ADD_TO_FILE = "add to the file";

  const watcher = fs.watch("./command.txt");
  const commandFileHandler = await fs.open("./command.txt");

  commandFileHandler.on("change", async (content) => {
    // Create file
    // creat a file <path>
    if (content.includes(CREATE_FILE)) {
      const path = content.substring(CREATE_FILE.length + 1);
      createFile(path);
    }

    // Delete a file
    // delete the file <path>
    if (content.includes(DELETE_FILE)) {
      const path = content.substring(DELETE_FILE.length + 1);
      deleteFile(path);
    }

    //Rename a file
    // rename the file <path> to <new-path>
    if (content.includes(RENAME_FILE)) {
      const endIndx = content.indexOf(" to ");
      const path = content.substring(RENAME_FILE.length + 1, endIndx);
      const newPath = content.substring(endIndx + 4);

      renameFile(path, newPath);
    }

    //Adding to a file
    // add to the file <path> the content <content>
    if (content.includes(ADD_TO_FILE)) {
      const endIndx = content.indexOf(" the content ");
      const path = content.substring(RENAME_FILE.length + 1, endIndx);
      const newContent = content.substring(endIndx + 13);

      appendToFile(path, newContent);
    }
  });

  commandFileHandler.on("readLines", async () => {
    const size = (await commandFileHandler.stat()).size;
    const buff = Buffer.alloc(size);
    const options = {
      length: buff.byteLength,
      position: 0,
      offset: 0,
    };

    await commandFileHandler.read(buff, options);
    const content = buff.toString("utf-8");
    const lines = content.split("\n");

    for (const line of lines) {
      commandFileHandler.emit("change", line);
    }
  });

  for await (const event of watcher) {
    if (event.eventType === "change") {
      commandFileHandler.emit("readLines");
    }
  }
})();
