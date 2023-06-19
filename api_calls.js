import axios from 'axios';
const options={method: 'GET',timeout: 25000};
function removePrefix(version){
    return version.split(/=|~|=|<|>/).join('').split('^').join('').replace('x','0');   
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