const { create } = require("ipfs-http-client");
const fs = require("fs")
const dotenv = require('dotenv');
dotenv.config();
const projectId = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_ID
const projectSecret = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_SECRET
console.log("Project ID--->", projectId,projectSecret)
const projectIdAndSecret = `${projectId}:${projectSecret}`
async function ipfsClient() {
    const ipfs = await create(
        {
            host: "ipfs.infura.io",
            port: 5001,
            protocol: "https",
            headers: {
                authorization: `Basic ${Buffer.from(projectIdAndSecret).toString(
                  'base64'
                )}`
            }
        }
    );
    return ipfs;
}


async function saveText() {
    let ipfs = await ipfsClient();

    let result = await ipfs.add(`welcome ${new Date()}`);
    console.log(result);
}
//saveText();

async function saveFile() {

    let ipfs = await ipfsClient();

    let data = fs.readFileSync("./package.json")
    let options = {
        warpWithDirectory: false,
        progress: (prog) => console.log(`Saved :${prog}`)
    }
    let result = await ipfs.add(data, options);
    console.log(result)
}
//saveFile()

async function getData(hash) {
    let ipfs = await ipfsClient();

    let asyncitr = ipfs.cat(hash)

    for await (const itr of asyncitr) {

        let data = Buffer.from(itr).toString()
        console.log(data)
    }
}

// getData("QmQbA7BrBNkh1bbSgtUYdUJYsHRfvRN6k5vocxHgjadUjr")
 getData("QmPoxfyQoR9hmbTaq1TueVdVmRA3sTZqey7nPSnTgx4VRY")