import ora from 'ora';
const envCheckSpinner=ora("Checking your environment...");
// This gets set to true if we find a reason to think this is a Replit environment.
var isReplitEnv=false;
envCheckSpinner.start();
if(process.env?.REPLIT_ENVIRONMENT=="production" && process.env?.REPL_OWNER?.length>0 && process.env?.REPL_SLUG?.length>0) isReplitEnv=true;

switch(isReplitEnv) {
  case true:
    envCheckSpinner.succeed("We're running on Replit! This should work correctly.");
    break;

  case false:
    envCheckSpinner.warn("It doesn't seem like we're on Replit.");
};
const gitAvailableSpinner=ora("Looking for Git");
gitAvailableSpinner.start();
import child_process from 'child_process';
var gitCheck=child_process.spawnSync("which",["git"]);
if(gitCheck?.error instanceof Error || gitCheck?.status==null) {
  gitAvailableSpinner.fail("We couldn't check for Git.");
  process.exit(1);
}
if(gitCheck?.status>0) {
  gitAvailableSpinner.fail("Git isn't installed.");
  process.exit(1);
};
if(gitCheck.status==0) {
  gitAvailableSpinner.succeed(`We found Git: ${new String(gitCheck.stdout).replace(/\n/,"")}`);
}
// From now on, we can safely use Git.
import fs from 'fs';
var baseDirSpinner=ora("Determining source path");
baseDirSpinner.start();
import path from 'path';
import { Stream } from 'stream';
var baseDir=(()=>{switch(process.env?.REPLIT_ENVIRONMENT=="production") {
  case true:
    return path.join(process.env?.HOME,process.env.REPL_SLUG,"src/");
    break;
  case false:
    return path.join(process.env?.HOME,"src/");
  default:
    break;
};})();
baseDirSpinner.succeed(`Installing to ${baseDir}`);
var baseDirCheckSpinner=ora("Checking your source directory...");
var baseDirExists=fs.existsSync(baseDir);
if(baseDirExists) {
  var baseDirStat=fs.statSync(baseDir);
  if(baseDirStat.isDirectory) {
    baseDirCheckSpinner.warn("The source directory already exists!");
  }
  else if(baseDirStat.isSymbolicLink) {
    baseDirCheckSpinner.warn(`The source directory is a symlink to ${new String(child_process.spawnSync("readlink",baseDir).stdout)}.`);
  }
}
else {
  baseDirCheckSpinner.succeed("Your source directory is good to go!");
}
var srcCreate=ora("Creating source directory").start();
var createSourceDirectory;
if(process.env?.DRY_RUN=="yes") {
  srcCreate.warn("Not creating a directory (Dry run)");
}
else {
  try {
    createSourceDirectory=fs.mkdirSync(baseDir,{recursive: true});
    srcCreate.succeed(`Created ${createSourceDirectory}`);
  }
  catch(e) {
    srcCreate.fail(`We encountered an error: ${e.message}`);
  }
}