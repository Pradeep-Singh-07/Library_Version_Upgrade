let {exec}=require('child_process');
const getData = async (val, timeout) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(val * 10);
      }, timeout);
    });
  };
  
  const fun = async(obj) => {
      let arr= obj.map(async (item)=> {
        let ans = await getData(item.value,item.timeout);
        console.log(ans);
        return ans;
    });
    console.log(arr);
    

      
  };
  
  console.log("function called");
  fun([
    { value: 1, timeout: "2000" },
    { value: 3, timeout: "5000" },
    { value: 1, timeout: "4000" }
  ]);