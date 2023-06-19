import { execSync } from 'child_process';
export function getDependencyPaths(packageName) {
    const command = `/Users/pradipkumar.singh/Desktop/project/node_modules/yarn/bin/./yarn why ${packageName} `;
    let output = execSync(command, { encoding: 'utf-8' });
    output=output.trim();
    const lines = output.split('\n');
    const allDependencyPaths = [];
    for (let line of lines) {
        line = line.trim();
        
        if(line.startsWith('- Hoisted from')){
            let dependencyPath_temp=line.replace('- Hoisted from','').trim().slice(1,-1).split('#');
            let lastDependency="";
            let dependencyPath=[];
            dependencyPath_temp.forEach((item)=>{
                if(item.startsWith('@')){
                    lastDependency=item;
                }
                else if(lastDependency){
                    dependencyPath.push(lastDependency+'/'+item);
                    lastDependency="";
                }
                else{
                    dependencyPath.push(item);
                }
            })
            allDependencyPaths.push(dependencyPath);
        }
    }
    return allDependencyPaths ;
}