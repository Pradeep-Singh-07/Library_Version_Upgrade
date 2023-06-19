import { directDependency , extractVersions } from './api_calls.js';
import { getDependencyPaths } from './yarn_why_parsing.js';
let dependencyCache=new Map();
let versionCache=new Map();
function stringify(array){
    return array.join('@#$%');
}
function destringify(string){
    return string.split('@#$%');
}
//***************************************************************************************************************************************//
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
        newPackages.forEach((items)=>newPackages_temp.push(...items));
        newPackages_temp.filter((item)=>!alldependencies.has(stringify(item)));
        newPackages=newPackages_temp;
    }
    
    resolve([...alldependencies].map((item)=>destringify(item)));})
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
            // console.log(allcurrentdependencies);
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
//*************************************************************************************************************************************************//
async function listUpdate(mainPackages,dependencyName,dependencyDestinationVersion){
    return new Promise (async (resolve,reject)=>{
    let promiseList = mainPackages.map((item)=>
        mainfun(item[0],item[1],dependencyName,dependencyDestinationVersion)
    );
    Promise.all(promiseList).then((versions)=>{      
         resolve(versions.map((item,idx)=>[mainPackages[idx][0],item]));
    })
        
    })}
//**********************************************************************************************************************************************//
async function updateThis(thisPackage,Child,reqVersion){
    let [thisVersions,childVersions]=await Promise.all([getver(thisPackage),getver(Child)]);
    let thisVersions_inv=new Map();
    let childVersions_inv=new Map();
    thisVersions.forEach((item,idx)=>thisVersions_inv.set(item,idx));
    childVersions.forEach((item,idx)=>childVersions_inv.set(item,idx));
    let bit=1<<15 , thisIdx=thisVersions.length-1,last=childVersions[childVersions.length-1];
    while(Number(bit)>=1){
        if(Number(thisIdx-bit) >= Number(0)){
            
            let thisDirectDependencies=await getDirectDependencies(thisPackage,thisVersions[thisIdx-bit]);
            thisDirectDependencies=thisDirectDependencies.filter((item)=>`${item[0]}`==`${Child}`);
            if(thisDirectDependencies.length){
            if(Number(childVersions_inv.get(thisDirectDependencies[0][1]))>=Number(childVersions_inv.get(reqVersion))){
                thisIdx-=bit;
                last=thisDirectDependencies[0][1];  
            }
          
        }
            
    }
    bit/=2;
    }
    if(Number(childVersions_inv.get(last))>=Number(childVersions_inv.get(reqVersion))){
        return thisVersions[thisIdx];
    }
    else return '-1';

}
async function listUpdate2(packageName,packageDestinationVersion){
    return new Promise((resolve,reject)=>{
    let dependencyPaths=getDependencyPaths(packageName);
    dependencyPaths=dependencyPaths.map((item)=>item.reverse());
    Promise.all(dependencyPaths.map(async(thisPath)=>new Promise( async (resolve,reject)=>{
        
        let currChild = "",reqVersion ="";
        let flag=1;
        for(let thisPackage of thisPath){
            if(`${currChild}`==""){
                currChild=packageName;
                reqVersion=packageDestinationVersion;
            }
            else{
                let thisVersion=await updateThis(thisPackage,currChild,reqVersion);
                if(`${thisVersion}`==`-1`){
                    console.log(`not possible via the following path: ${thisPath}`);
                    flag=0;
                    break;
                }
                else{
                    currChild=thisPackage;
                    reqVersion=thisVersion;   
                }
            } 

        }
        if(flag)
        resolve([currChild,reqVersion]);
        else reject();
    }))).then((item)=>resolve(item)); 
    })
}  
async function updateThis3(thisPackage,currChild,reqVersion){
    let [thisVersions,childVersions]=await Promise.all([getver(thisPackage),getver(currChild)]);
    let thisVersions_inv=new Map();
    let childVersions_inv=new Map();
    thisVersions.forEach((item,idx)=>thisVersions_inv.set(item,idx));
    childVersions.forEach((item,idx)=>childVersions_inv.set(item,idx));
    let major="",minor="",patch="",valid=0,last="",lastv="";

    for(let item of thisVersions){
        item=item.split('.');
        
        if(`${item[0]}`!=`${last}`){
            last=`${item[0]}`;
            let thisDirectDependencies = await getDirectDependencies(thisPackage,item.join('.'));
            thisDirectDependencies=thisDirectDependencies.filter((item)=>`${item[0]}`==`${currChild}`)
            if(thisDirectDependencies.length)
            if(Number(childVersions_inv.get(thisDirectDependencies[0][1]))>=Number(childVersions_inv.get(reqVersion))){
            [major,minor,patch]=item;   
                break;
            }
        }
    }
    
    thisVersions=thisVersions.reverse();
    for(let item of thisVersions){
        item=item.split('.');
        if(`${item[0]}`==`${major}`){
            valid=1;

        }
        else if(valid){
            let thisDirectDependencies = await getDirectDependencies(thisPackage,item.join('.'));
            thisDirectDependencies=thisDirectDependencies.filter((item)=>`${item[0]}`==`${currChild}`)
            if(Number(childVersions_inv.get(thisDirectDependencies[0][1]))>=Number(childVersions_inv.get(reqVersion))){
                [major,minor,patch]=item;
            }
            else break;
        }
    }
    return [major,minor,patch].join('.');

}
async function listUpdate3(packageName,packageDestinationVersion){
    return new Promise(async (resolve,reject)=>{
    let dependencyPaths=getDependencyPaths(packageName),upgrading=[];
    dependencyPaths=dependencyPaths.map((item)=>item.reverse());
    Promise.all(dependencyPaths.map(async (thisPath) => new Promise(async (resolve,reject)=>{
        let currChild = "",reqVersion ="";
        let flag=1;
        for(let thisPackage of thisPath){
            if(`${currChild}`==""){
                currChild=packageName;
                reqVersion=packageDestinationVersion;
            }
            else{
                let thisVersion=await updateThis3(thisPackage,currChild,reqVersion);
                if(`${thisVersion}`==`-1`){
                    console.log(`not possible via the following path: ${thisPath}`);
                    flag=0;
                    break;
                }
                else{
                    currChild=thisPackage;
                    reqVersion=thisVersion;   
                }
            }
        }
        if(flag)
        resolve([currChild,reqVersion]);  
        else reject();  
       
    }))).then((item)=>resolve(item));
})


}  
async function doo(){
    console.time('linear search on path chains');
    console.time('binary search on path chains');
    console.time('binary search on full graph');
listUpdate3('throttle-debounce','2.0.1').then((arr)=>{
    arr.forEach((item)=> console.log(`update ${item[0]} to ${item[1]}`));
    console.timeEnd('linear search on path chains');
});
// listUpdate2('throttle-debounce','2.0.1').then((arr)=>{
//     arr.forEach((item)=> console.log(`update ${item[0]} to ${item[1]}`));
//     console.timeEnd('binary search on path chains');
// });
// listUpdate([['react-use','10.0.0']],'throttle-debounce','3.0.1').then((arr)=>{
//     arr.forEach(item=> console.log(`update ${item[0]} to ${item[1]}`));
//     console.timeEnd('binary search on full graph');
//});
}
doo();

    
