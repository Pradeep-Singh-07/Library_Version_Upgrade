let {exec}=require('child_process');
function cleanup(out){
    out=out.slice(1,-2);
    let arr =out.split("'").join("")
                .split('\n').join('')
                .split(' ').join('')
                .split('^').join('')
                .split('~').join('')
                .split('<').join('')
                .split('=').join('')
                .split('>').join('')
                .split('|').join('')
                .split(',');
    arr=arr.map((item)=>item.split(':'));
    if(arr.length==1 && arr[0]=='')arr=[];
    return arr;
}
let dependencyCache=new Map();
let versionCache=new Map();
function stringify(a){
    return a.join('@#$%');
}
function destringify(a){
    return a.split('@#$%');
}
 function directDependency(packageName,packageVersion){
    return new Promise((resolve,reject)=>{
        exec(`npm view ${packageName}@${packageVersion} dependencies`,(err,out)=>{
            if(err)throw err;
            let result = cleanup(out);

            resolve(result);
        });
    })
}
async function getDirectDependencies(packageName,packageVersion){
    
    return new Promise(async (resolve,reject)=>{
    let package=[packageName,packageVersion];
    if(dependencyCache.has(stringify(package))){

        resolve(  dependencyCache.get(stringify(package)));
    }
    let result = await directDependency(packageName,packageVersion);
    dependencyCache.set(stringify(package),result);
    resolve(result);
    })
   
    
}
async function getAllDependencies(packageName,packageVersion){
    return new Promise(async (resolve,reject)=>{
    let alldependencies=new Set();
    let stack=[[packageName,packageVersion]];
    while(stack.length){
        stack.forEach((item)=>{alldependencies.add(stringify(item));})
        let stack2=[];
        stack=stack.map((item)=>getDirectDependencies(item[0],item[1]));
         stack = await Promise.all(stack);
        stack.forEach((item)=>stack2.push(...item));
        stack2.filter((item)=>!alldependencies.has(stringify(item)));
        stack=stack2;
    }
    resolve([...alldependencies].map((item)=>destringify(item)));})
}

async function extractVersions(packageName){
    return new Promise((resolve,reject)=>{
        exec(`npm view ${packageName} versions`,(err,out)=>{
            out=out.slice(1,-2).split(' ').join('').split('\n').join('').split("'").join('').split(',');
            if(err)throw err;
            resolve(out);
        })
    })
}
async function getver(packageName){
    return new Promise(async (resolve,reject)=>{
    
    if(versionCache.has(`${packageName}`)){
        resolve (versionCache.get(`${packageName}`));
    }
    let out= await extractVersions(packageName);  
    versionCache.set(`${packageName}`,out);
    resolve(out);  
})
}
let rootPackageName='react-use';
let rootPackageVersion='10.0.0';

async function mainfun(dependencyName,dependencyDestinationVersion){
    let rootPackageVersions = await getver(rootPackageName);
    let dependencyVersions = await getver(dependencyName);
    
    
    let inverseRootPackageVersions =new Map();
    let inverseDependencyVersions=new Map();
    rootPackageVersions.forEach((item,idx)=>inverseRootPackageVersions.set(item,idx));
    dependencyVersions.forEach((item,idx)=>inverseDependencyVersions.set(item,idx));
    let rootVersionCount = rootPackageVersions.length;
    let rootindex=rootVersionCount-1,bit=1<<10,last=-1;
   
  
    while(1){
        if(rootindex-bit>0){
            let allcurrentdependencies=await getAllDependencies(rootPackageName,rootPackageVersions[rootindex-bit]);
            let thisdependency=allcurrentdependencies.filter((item)=>item[0]==`${dependencyName}`);
            if(thisdependency.length && Number(inverseDependencyVersions.get(`${thisdependency[0][1]}`))>=Number(inverseDependencyVersions.get(`${dependencyDestinationVersion}`))){
                rootindex-=bit;
                last=thisdependency[0][1];
            }
        }
        bit/=2;
        if(bit<1){
            if(last==dependencyDestinationVersion){
                console.log(`upgrade to ${rootPackageVersions[rootindex]}`);
            }
            else {
                console.log('no favourable outcome')
            }
             break;
            
            
        }
        
    }

}
mainfun('throttle-debounce','3.0.1');