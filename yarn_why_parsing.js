import { execSync } from 'child_process';
import { info } from 'console';
export function getDependencyPaths(packageName) {
    const command = `/Users/pradipkumar.singh/Desktop/project/node_modules/yarn/bin/./yarn why ${packageName}`;
    let output = execSync(command, { encoding: 'utf-8' });
    output=output.trim();
    const lines = output.split('\n');
    const allDependencyPaths = [];
    for (let line of lines) {
        line = line.trim();
        
        if(line.startsWith('- Hoisted from')||line.startsWith('info This module exists because')){
            let dependencyPath_temp=line.replace('- Hoisted from','').replace('info This module exists because','').replace('depends on it.','').trim().slice(1,-1).split('#');
            let lastDependency="";
            if(`${dependencyPath_temp[dependencyPath_temp.length-1]}`!=`${packageName}`){
                dependencyPath_temp.push(`${packageName}`);
            }
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
