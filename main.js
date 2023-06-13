import axios from 'axios';
let dependencyCache=new Map();
let versionCache=new Map();
const options={method: 'GET',timeout: 25000};
function stringify(a){
   
    return a.join('@#$%');
}
function destringify(a){
    return a.split('@#$%');
}
function removePrefix(version){
  return version.split(/=|~|=|<|>/).join('').split('^').join('');
} 

 function directDependency(packageName,packageVersion){
    return new Promise(async (resolve,reject)=>{
        let response;
        if(packageVersion.length>1)response = await axios.get(`https://registry.npmjs.org/${packageName}/${packageVersion}`,options);
        else response = await axios.get(`https://registry.npmjs.org/${packageName}`,options);
let data=response.data;
if (data.dependencies) {
    const dependencies = Object.entries(data.dependencies);
    const dependenciesWithVersions = dependencies.map(([name, version]) => [name,removePrefix(version)]);
    resolve(dependenciesWithVersions);
  } else {
    resolve([]);
  }
})
  

    }

async function getDirectDependencies(packageName,packageVersion){
    
    return new Promise(async (resolve,reject)=>{
    let Package=[packageName,packageVersion];
    if(dependencyCache.has(stringify(Package))){

        resolve(  dependencyCache.get(stringify(Package)));
    }
    let result = await directDependency(packageName,packageVersion);
    dependencyCache.set(stringify(Package),result);
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
    return new Promise(async(resolve,reject)=>{
        const response = await axios.get(`https://registry.npmjs.org/${packageName}`,options);
       
        const data = response.data;
        const versions = Object.keys(data.versions);
        resolve(versions);
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
//**********************************************************************************************************************************//







