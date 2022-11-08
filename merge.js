let child_process = require("child_process")
child_process.execFile("merge.bat",null,{cwd:'../'},function(error,stdout,stderr){
  if (error !== null) {
    console.log("exec error" + error)
  }
  console.log('stdout: ' + stdout);
  console.log('stderr: ' + stderr);

})
