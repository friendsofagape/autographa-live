import axios from 'axios';
import tmp from "tmp";
const ENDPOINT = "https://git.door43.org/api/swagger";
axios.defaults.withCredentials = false;

export default class Gitea {
    /**
     * 
     * @param {username} username 
     * @param {password} password 
     */
    constructor(username, password){
        this.username = username;
        this.password = password;
        this.setToken(this.getToken());
    }

    setToken(token){
        this.accessToken = token;
        //this.accessToken = 'eyJhbGciOiJSUzI1NiJ9.eyJzY29wZXMiOlsicHJvamVjdHM6cmVhZCIsInByb2plY3RzLm1lbWJlcnM6cmVhZCIsImRhdGFfYWNjZXNzIl0sImlhdCI6MTUzOTU3NzI1MCwianRpIjoiRm52WDRTeDRGakw5ejVuTmEiLCJhdWQiOlsiaHR0cHM6Ly9yZWdpc3RyeS5wYXJhdGV4dC5vcmciLCJodHRwczovL2RhdGEtYWNjZXNzLnBhcmF0ZXh0Lm9yZyIsImh0dHBzOi8vYXJjaGl2ZXMucGFyYXRleHQub3JnIl0sInN1YiI6IjV4Umk0aVRIbjhYTWJmc2F5IiwiZXhwIjoxNTM5NTc4NDUwLCJhenAiOiJhMnh2cGt2V3BCc2RRTkFkdCIsInVzZXJuYW1lIjoiQmVuamFtaW4gQXV0b2dyYXBoYSIsImlzcyI6InB0cmVnX3JzYSJ9.kNDgpVbx3c88zxP-3E_YI7BLhkvNcV_ugyamk-r1wen-DqbVnclz92-7Z3ZIAKmbCZNEXwWc_66zK0wyfYRcpuZlfQdX1YIZjqLFckgSdITxc6XhWOsBSkteWMoGV5qQeWAXXfiuRY3GJBcO5YJQ_ZCwEYOGLkYKgJ1Wb95Bl7Wt80oWCtvtJngvovJFkCiqppQQAmbGwa8KzImo-aef6vKb7VqIN1pMfj1cc66blO4T9Jhqytc8_Ae1m5r7A3r-2tnVXmt30Kegfb4HC7lcu1ZLzp6ifpD2j-TL9Lx9avtCO_A87BK_cKJtiSEFDWMQJsas1SQ3MUBSsbgFUJWrwg'
    }
    
    /**
    * Get a user name with authentication token.
    * @return {token} Token from the paratext API
    */

    async getToken() {
        let paraTextReqBody = {
            username: this.username,
            password: this.password,
            grant_type: "password",
            scope: "projects:read projects.members:read  data_access"
        }
        // let config = {
        //     headers: {
        //         'Authorization': `Bearer ${process.env.REACT_APP_PARATEXT_TOKEN}`,
        //         'Content-Type': "application/json",
        //         "Access-Control-Expose-Headers": "Access-Control-*",
        //         "Access-Control-Allow-Origin": "http://localhost:3000"
        //     }
        // }
        let token = "6035a6e3b5a413cc95074c15b60a09bf6aecc0cd";
        // token =  await axios.post("https://registry.paratext.org/api8/token", paraTextReqBody, config, )
        //     .then(res => {
        //         return res.data.access_token;
        //     }).catch((err) => {
        //         return "";
        //     });
        // return token;
    }

    async getProjects(attempt = 1) {
        let token = await this.accessToken;
        let _this = this;
        // let config = {
        //     headers: {
        //         'Authorization': `Bearer ${token}`,
        //         "Access-Control-Expose-Headers": "Access-Control-*",
        //         "Access-Control-Allow-Origin": "http://localhost:3000"
        //     }
        // }
        let response = await axios.get(`https://git.door43.org/api/v1/users/${this.username}/repos`).then((res) => {
                return res;
            }).catch((err) => {
                
                if(err.response.data && err.response.data.includes("Invalid authorization token")){
                    if (attempt === 3) throw err;
                    _this.getToken();
                    return _this.getProjects(attempt + 1);
                }
            })
        // console.log(response);

        let projects = [];
        if(response && response.status === 200){
            (response.data).map((repo,index) => {projects.push(repo)});
            // console.log("projects * ** --  ",projects);
        }else{
            throw new Error("Something went wrong");
        }
        return projects.map(repoToProject);
    }

    async getBranchsList(projectId, repoName){
        let token = await this.accessToken;
        let _this = this;
        // let config = {
        //     headers: {
        //         'Authorization': `Bearer ${token}`,
        //         "Access-Control-Expose-Headers": "Access-Control-*",
        //         "Access-Control-Allow-Origin": "http://localhost:3000"
        //     }
        // }
        let response = await axios.get(`https://git.door43.org/api/v1/repos/${projectId}/${repoName}/branches`).then((res) => {
                return res;
            }).catch((err) => {
                if(err.response.data && err.response.data.includes("Invalid authorization token")){
                    _this.getToken();
                }
            })
        console.log(response);

        let branches = [];
        if(response && response.status === 200){
            (response.data).map((branch,index) => {branches.push(branch)});
            console.log("branches * ** --  ",branches);
        }else{
            throw new Error("Something went wrong");
        }
        return branches.map(repoToBranch);
    }

    async getBooksList(userName,repoName, cloneId) {
        console.log(userName,repoName, cloneId);
        let token = await this.accessToken;
        let _this = this;
        // let config = {
        //     headers: {
        //         'Authorization': `Bearer ${token}`,
        //         "Access-Control-Expose-Headers": "Access-Control-*",
        //         "Access-Control-Allow-Origin": "http://localhost:3000"
        //     }
        // }
        let response = await axios.get(`https://git.door43.org/api/v1/repos/${userName}/${repoName}/git/trees/${cloneId}?recursive=true`).then((res) => {
                return res;
            }).catch((err) => {
                if(err.response.data && err.response.data.includes("Invalid authorization token")){
                    _this.getToken();
                }
            })
        console.log(response);
        // console.log(response.data.tree);
        let books = [];
        if(response && response.status === 200){
            (response.data.tree).map((book,index) => {books.push(book.path)});
            // console.log("books * ** --  ",books);
        }else{
            throw new Error("Something went wrong");
        }
        return books;
        // // branch code
        // // https://git.door43.org/api/v1/repos/vipinpaul94/vipin.paul/branches
        // console.log("projectId-----",projectId);
        // console.log("user",this.username);
        // //https://git.door43.org/api/v1/repos/vipinpaul94/vipin.paul/git/trees/7ae44d54dfb1234bec94df95e7918f2442fcf51f?recursive=true
        // return ["vipin","Asher","ABC"];
    }

    //importing
    async getDoorBookData(projectId, bookId, branchName, repo){
        console.log("I am in Gitea",projectId, bookId, branchName, repo);
        console.log("I am in Gitea",projectId, bookId, branchName, repo[0]);
        let token = await this.accessToken;
        let config = {headers: {
            Authorization: `Bearer ${token}`
        }}
        // return await axios.get(`https://git.door43.org/api/v1/repos/${projectId}/${repo}/raw/${bookId}`).then((res) => {
            return await axios.get(`https://git.door43.org/${projectId}/${repo}/raw/branch/${branchName}/${bookId}`).then((res) => {
            return res.data;
        }).catch((err) =>{
            if(err.response.data && err.response.data.includes("Invalid authorization token")){
                this.getToken();
                return this.getDoorBookData(projectId, bookId, branchName, repo);
            }
            throw new Error("Fetch bookdata issue");
        })
    }

    //exporting
    async updateDoorBookData(projectId, bookId, revision, bookXmldoc, attempt = 1){
        //convert in usx
        //send to the paratext API
        let token = await this.accessToken;
        let config = {headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': "application/x-www-form-urlencoded"
        }}
        return await axios.post(`${ENDPOINT}/api8/text/${projectId}/${revision}/${bookId}`, bookXmldoc, config).then((res) => {
            return res.data;
        }).catch((err) =>{
            if(err.response.data && err.response.data.includes("Invalid authorization token")){
                if (attempt === 3) throw err;
                    this.getToken();
                return this.updateBookData(projectId, bookId, revision, bookXmldoc, attempt + 1);
            }
            throw new Error("upload bookdata issue");
        })
    }

    // async clone(projectId) {
    //     const localPath = tmp.dirSync({prefix:"autographa-"}).name;
    //     const result = await wacs.clone(this.accessToken, localPath, projectId);
    //     return localPath;
    // }

    // async commitAndPush(localPath) {
    //     const result = await wacs.commitAndPush(this.accessToken, localPath, "Autographa export");
    //     return result;
    // }

    // async create(projectName) {
    //     const newRepo = await wacs.create(this.accessToken, projectName, this.endpoint);
    //     const project = repoToProject(newRepo);
    //     return project;
    // }

    // //importing
    // async getUsxBookData(projectId, bookId) {
    //     throw new Error("Not implemented.");
    // }

    // //exporting
    // updateBookData(projectId, bookId, bookData) {
    //     throw new Error("Not implemented.");
    // }
}

function repoToProject(r) {
    console.log(r.owner.username);
    return ({proj: [r.name], projid: [r.owner.username]});
    // return ({proj: [r.name], projid: [r.clone_url]});
}

function repoToBranch(b) {
    // let id = ""
    // id = (b.commit.id).toString();
    // console.log(b.name,id);
    return ({branchz: [b.name], branchzid: [b.commit.id]});
}