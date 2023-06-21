import axios from 'axios';
const options={method: 'GET',timeout: 25000};
function removePrefix(version){
    return version.split(/=|~|=|<|>/).join('').split('^').join('');   
}
export function directDependency(packageName,packageVersion){
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
export async function extractVersions(packageName){
    return new Promise(async(resolve,reject)=>{
        const response = await axios.get(`https://registry.npmjs.org/${packageName}`,options);
        
        const data = response.data;
        const versions = Object.keys(data.versions);
       
        resolve(versions);
    })
}

export async function getPackageInfo(packageName){
return new Promise(async(resolve,reject)=>{
const response =await axios.get(`https://registry.npmjs.org/${packageName}`);
let versions_info=response.data.versions;
let dependencies=[];
for(let version in versions_info){
  
    if(versions_info[version]['dependencies']!=undefined)
    {
        let curr_dependency=[]
        for(let dependency in versions_info[version]['dependencies'])
        {
            curr_dependency.push([dependency,removePrefix(versions_info[version]['dependencies'][dependency])]);
        }
        dependencies.push([`${version}`,curr_dependency]);

    }
    else dependencies.push([`${version}`,[]]);
    } 
    resolve(dependencies);
})
}