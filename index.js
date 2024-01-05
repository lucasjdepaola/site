const gid = (string) => {
  return document.getElementById(string);
}; // abstraction
const gcl = (string) => {
  return document.querySelector(string);
};
const input = gid("input");
const output = gid("output");
const cursor = gid("cursor");
const prmpt = gcl(".prompt");
const mainterminal = gid("mainterminal");
const file = gid("file");
const mobileInput = gid("mobileinput");
let editBool = false;
let id = 0;
let activeId = false;

const TEXTSPEED = 25;
const introduction =
  "Lucas DePaola 2024`Type 'commands' for all listed commands.";
slowText(introduction);

class File {
  constructor(name, type, contents) {
    this.name = name;
    this.type = type;
    this.contents = contents;
  }
}

class Directory {
  constructor(name, contents, prev) {
    this.name = name;
    this.contents = contents;
    this.prev = prev;
  }
}

function initFileSystem() {
  const rootDir = new Directory("root", null, null);
  rootDir.contents = [
    new File("test.txt", "txt", "hello world"),
    new File("script.js", "js", "console.log('hi')"),
    new Directory("home", [
      new File(
        "secret.txt",
        "txt",
        "github password: lucas100!77`network password: shinyelement75`instagram password: lucas!!77lucas",
      ),
    ], null),
  ];
  return rootDir;
}

const keyDownFunction = (key) => { // terminal listener
  updateCursor("input");
  if (editBool) return;
  input.textContent += key.key.length > 1 ? "" : key.key;
  updateCursor("input");
  if (key.key === "Enter") {
    interpretText(input.textContent);
    input.textContent = "";
  } else if (key.key === "Escape") input.textContent = "";
  else if (key.ctrlKey && key.key === "l") {
    event.preventDefault();
    input.textContent = "";
  } else if (key.ctrlKey && key.key === "Backspace") ctrlBack();
  else if (key.key === "Backspace") {
    input.textContent = input.textContent.slice(0, -1);
  }
  updateCursor("input");
};

document.addEventListener("keydown", keyDownFunction);

document.addEventListener("touchstart", () => {
  mobileInput.focus();
});

// mobileInput.addEventListener("keydown", keyDownFunction);

window.addEventListener("resize", () => {
  updateCursor(); // TODO: have the resize update work properly, event doesn't capture it
});

function interpretText(string) {
  string = string.trim();
  string = string.toLowerCase();
  if (string === "test") slowText("this is a test");
  else if (string === "c" || string === "clear") clear();
  else if (string === "commands") {
    let commands = "c: clear screen`ls: list contents of the current directory";
    commands += "`cd: change directory`cat: display contents of a file";
    commands +=
      "`mkdir: create a directory`touch: create a file`edit: edit a file";
    slowText(commands);
  } else if (string === "ls") ls();
  else if (string.split(" ")[0] === "cat") cat(string.split(" ")[1]);
  else if (string.split(" ")[0] === "cd") cd(string.split(" ")[1]);
  else if (string.split(" ")[0] === "mkdir") mkdir(string.split(" ")[1]);
  else if (string.split(" ")[0] === "touch") touch(string.split(" ")[1]);
  else if (string.split(" ")[0] === "edit") edit(string.split(" ")[1]);
  else slowText("unknown command");
  return "";
}

function ls() {
  if (currentDir.contents === null) return;
  let string = "";
  for (element of currentDir.contents) {
    string += element.name + "`";
  }
  slowText(string);
}

function cat(fileName) {
  for (const element of currentDir.contents) {
    if (element.name === fileName) {
      slowText(element.contents);
    }
  }
}

function cd(dirName) {
  if (dirName === "..") {
    currentDir = currentDir.prev;
    return;
  }
  for (const element of currentDir.contents) {
    if (element instanceof Directory && element.name === dirName) {
      element.prev = currentDir;
      currentDir = element;
      file.innerText += "/" + currentDir.name;
      return;
    }
  }
  slowText(
    "Directory not found, run 'ls' to find the current files/directories.",
  );
}

function mkdir(dirName) {
  for (const element of currentDir.contents) {
    if (dirName === element.name) {
      slowText("Cannot create directory, name already exists.");
      return;
    }
  }
  currentDir.contents.push(new Directory(dirName, null, currentDir));
}

function edit(fileName) {
  editBool = true;
  let fileContents = "";
  let f;
  if (currentDir.contents !== null) {
    for (const element of currentDir.contents) {
      if (element.name === fileName) {
        fileContents += element.contents;
        f = element;
      }
    }
  }
  const box = document.createElement("textarea");
  box.value = fileContents;
  box.id = "edit";
  box.style.backgroundColor = "black";
  box.style.color = "white";
  output.appendChild(box);
  box.addEventListener("keydown", (key) => {
    if (key.ctrlKey && key.key === "s") {
      event.preventDefault();
      if (f !== undefined) f.contents = box.value;
      else {
        const fn = fileName === undefined ? "untitled.txt" : fileName;
        currentDir.contents.push(
          new File(fn, fn.split(".")[1], box.value),
        );
      }
      output.removeChild(box);
      editBool = false;
    }
  });
}

function touch(fileName) {
  if (currentDir.contents === null) {
    currentDir.contents = [new File(fileName, fileName.split(".")[1], "")];
    return;
  }
  for (const element of currentDir.contents) {
    if (element.name === fileName) {
      slowText("Cannot create file, name already exists.");
    }
  }
  currentDir.contents.push(new File(fileName, fileName.split(".")[1], ""));
}

function updateCursor(boundelement) {
  const el = document.getElementById(boundelement);
  const coords = el.getBoundingClientRect();
  cursor.style.left = coords.right + "px";
  cursor.style.top = coords.top + "px";
  cursor.style.height = coords.height + "px";
}

const clear = () => {
  if (activeId) {
    clearInterval(id);
    activeId = false;
  }
  output.innerHTML = "";
};

function slowText(text) {
  if (activeId) return;
  activeId = true;
  let i = 0;
  id = setInterval(() => {
    if (text[i] === "`") {
      output.innerHTML += "<br>";
      i++;
    } else output.innerHTML += text[i++];
    updateCursor("input");
    if (i > text.length - 1) {
      output.innerHTML += "<br><br>";
      updateCursor("input");
      clearInterval(id);
      activeId = false;
    }
  }, TEXTSPEED);
}

function ctrlBack() {
  let count = 0;
  for (let i = input.textContent.length; i >= 0; i--) {
    if (input.textContent[i] === " ") {
      input.textContent = input.textContent.slice(0, count * -1);
      return;
    } else {
      count++;
    }
  }
  input.textContent = "";
}
const root = initFileSystem();
let currentDir = root;
