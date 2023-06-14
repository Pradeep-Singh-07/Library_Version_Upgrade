import axios from 'axios';
let dependencyCache=new Map();
let versionCache=new Map();
const options={method: 'GET',timeout: 25000};

function stringify(array){
    return array.join('@#$%');
}

function destringify(string){
    return string.split('@#$%');
}

function removePrefix(version){
  return version.split(/=|~|=|<|>/).join('').split('^').join('').replace('x','0');

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

        resolve(dependencyCache.get(stringify(Package)));
    }
    let result = await directDependency(packageName,packageVersion);
    dependencyCache.set(stringify(Package),result);
    resolve(result);
    })
   
    
}

async function getAllDependencies(packageName,packageVersion){
    return new Promise(async (resolve,reject)=>{
    let alldependencies=new Set();
    let newPackages=[[packageName,packageVersion]];
    while(newPackages.length){
        newPackages.forEach((item)=>{alldependencies.add(stringify(item));})
        let newPackages_temp=[];
        newPackages=newPackages.map((item)=>getDirectDependencies(item[0],item[1]));
        newPackages = await Promise.all(newPackages);
        newPackages.forEach((items)=>newPackages.push(...items));
        newPackages_temp.filter((item)=>!alldependencies.has(stringify(item)));
        newPackages=newPackages_temp;
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

async function mainfun(rootPackageName,rootPackageVersion,dependencyName,dependencyDestinationVersion){
    let rootPackageVersions = await getver(rootPackageName);
    let dependencyVersions = await getver(dependencyName);
    let inverseRootPackageVersions =new Map();
    let inverseDependencyVersions=new Map();
    rootPackageVersions.forEach((item,idx)=>inverseRootPackageVersions.set(item,idx));
    dependencyVersions.forEach((item,idx)=>inverseDependencyVersions.set(item,idx));
    let rootVersionCount = rootPackageVersions.length;
    let rootindex=rootVersionCount-1,bit=1<<20,last=-1;
  
    
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
            return new Promise((resolve,reject)=>{
            if(last==dependencyDestinationVersion){
                resolve(`${rootPackageVersions[rootindex]}`);
            }
            else {
                reject('no favourable outcome');
            }
        })
        }   
    }
}

//**********************************************************************************************************************************//


async function listUpdate(mainPackages,dependencyName,dependencyDestinationVersion){
    let promiseList = mainPackages.map((item)=>
        mainfun(item[0],item[1],dependencyName,dependencyDestinationVersion)
    );
    Promise.all(promiseList).then((versions)=>{
       
        versions.forEach((item,indx)=>{
            console.log(`upgrade ${mainPackages[indx][0]} to ${item}`)});

        }).catch(()=>console.log('not possible'))
       
    }
let mainPackages=[['react-use','10.0.0']];//[ [package1-Name,package1-Version] , [package2-Name,version2-Version] , [package3-Name,package3-version] ];
listUpdate(mainPackages,'throttle-debounce','3.0.1');








