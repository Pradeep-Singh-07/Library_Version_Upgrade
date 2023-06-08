const { exec } = require('child_process');
const fs=require('fs');
allpackages =new Set();

function stformat(packageName,packageVersion){
    return packageName+'$#@$#@'+packageVersion;
}

function inv_stformat(formatedpackagestring){
    return formatedpackagestring.split('$#@$#@');
}


function cleanup(out){
    
    out=out.slice(1,-2);
    out=out.split(',').join('\n').split("'").join('').split('\n');
    out=out.join('$').split('^').join('').split('$');
    
    out=out.map((item)=>item.split(':'));
    out.forEach(element => {
        if(element[1]){
        packageDependencies(element[0],element[1]);
    }    
    });
}



function packageDependencies(packageName,packageVersion){
    formatedpackagestring=stformat(packageName,packageVersion);
    if(!allpackages.has(formatedpackagestring)){
        allpackages.add(formatedpackagestring);
        exec(`npm view ${packageName}@${packageVersion} dependencies`,(err,out)=>{

             if(err)throw err;
             cleanup(out);
            });
        }
}

 packageDependencies('react-use','12.13.0');
 setTimeout(() => {
    for(let value of allpackages){
        console.log(inv_stformat(value));
    }
},10000);




