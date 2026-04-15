const fs = require("fs");
const glob = require("glob");
const files = glob.sync("src/components/**/*.tsx");
files.forEach((f) => {
  let content = fs.readFileSync(f, "utf8");
  if (content.includes('background: "#dc3545"')) {
    content = content.replace(
      /background:\s*"#dc3545"(?!\s*,\s*color:\s*"white")/g,
      'background: "#dc3545", color: "white"',
    );
    fs.writeFileSync(f, content);
  }
});
