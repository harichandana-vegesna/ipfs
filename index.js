const express = require('express');
const path = require('path')
const { create } = require("ipfs-http-client");
const fs = require("fs")
const dotenv = require('dotenv');
dotenv.config();

// For File Upload
const fileUpload = require('express-fileupload')
const bodyParser = require("body-parser");
const multer  = require('multer');

//Configuration for Multer
//const upload = multer({ dest: './uploads' });
var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, './uploads');
    },
    filename: function (req, file, callback) {
      callback(null, file.fieldname + '-' + Date.now());
    }
  });

var upload = multer({ storage : storage}).single('file'); 

//Config Express
const app = express();
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(fileUpload())

// To connect to Infura
const projectId = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_ID
const projectSecret = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_SECRET
console.log("Project ID--->", projectId,projectSecret)
const projectIdAndSecret = `${projectId}:${projectSecret}`

// Function to connect IPFS Infura
async function ipfsClient() {
    const ipfs = await create(
        {
            //host: "192.168.90.70",
            host: "localhost",
            //host: "ipfs.infura.io",
            port: 5001,
            // protocol: "https",
            protocol: "http",
            // headers: {
            //     authorization: `Basic ${Buffer.from(projectIdAndSecret).toString(
            //       'base64'
            //     )}`
            // }
        }
    );
    return ipfs;
}

// API to Upload file to IPFS

app.post('/upload', async (req, res) => {
    //let ipfs = await ipfsClient();
    console.log("file",req.files.files,req.body.filename)
    const file = req.files.files;
    const fileName = req.body.filename
    const filePath = './uploads/' + fileName
    console.log("data---->",file,fileName,filePath);
    var fileHash;
    file.mv(filePath, async (err)=>{
        if(err){
            console.log("Error: Failed to download file");
            return res.status(500).send(err)
        }

        fileHash = await saveFile(fileName,filePath);
        console.log("FILEHASH---->",fileHash)

        return res.send(`http://192.168.90.70:3000/getFileData/${ fileHash }`);

        fs.unlink(filePath,(err)=>{
            if(err) console.log(err)
        });

        //res.render('upload',{fileName, fileHash})

    })
    // const fileHash = await addFile(data);
    
    //return res.send(`https://gateway.ipfs.io/ipfs/${ fileHash }`);
});

// Sample function to save Text
async function saveText() {
    let ipfs = await ipfsClient();

    let result = await ipfs.add(`welcome ${new Date()}`);
    console.log(result);
}
//saveText();

// Function to save File to IPFS
async function saveFile(fileName,filePath) {

    let ipfs = await ipfsClient();

    let data = fs.readFileSync(filePath)


    let options = {
        warpWithDirectory: false,
        progress: (prog) => console.log(`Saved :${prog}`)
    }
    let result = await ipfs.add(data, options);
    console.log(result.path)
    return result.path
}
//saveFile()

// API to Get Data from IPFS using CID
app.get('/getFileData/:arg1', async (req, res) => {
  
    console.log("Request",req.params.arg1)
    //let data = req.params.arg1;
    let result = await getData(req.params.arg1)
    console.log("Result--->",result)
    res.send(result) 
})

// Function to get File from IPFS
async function getData(hash) {
    let ipfs = await ipfsClient();

    let asyncitr = ipfs.cat(hash)
    let data
    for await (const itr of asyncitr) {

        data = Buffer.from(itr).toString()
        console.log(data)
    }
    console.log(data)
    return data
}

// getData("QmQbA7BrBNkh1bbSgtUYdUJYsHRfvRN6k5vocxHgjadUjr")
 //getData("QmUV26pA85fwJuVQiWVh1P3gr688DcqyFPT6XR3jhzz21J")

 //Test in Server
 //getData("QmXAmoigT7ShyDPKKf6tB3QdFEaa49LK4VPWnTbfH3PLHv")
 

app.listen(3000, () => {
    console.log('Server running on port 3000');
});