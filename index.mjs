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
if(gitCheck?.error instanceof Error) {
  gitAvailableSpinner.fail("We couldn't check for Git.");
  process.exit(1);
}
if(gitCheck?.status>0) {
  gitAvailableSpinner.fail("Git isn't installed.");
  process.exit(1);
};
if(gitCheck.status==0) {
  gitAvailableSpinner.succeed(`We found Git: ${new String(gitCheck.stdout)}`);
}