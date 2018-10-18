import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import xml2js from 'xml2js'
dotenv.config({path: path.join(__dirname, '..', '.env')});
export default class Paratext {
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
        let config = {
            headers: {
                'Authorization': `Bearer ${process.env.PARATEXT_TOKEN}`,
                'Content-Type': "application/json"
            }
        }
        let token = "";
        token =  await axios.post("https://registry.paratext.org/api8/token", paraTextReqBody, config)
            .then(res => {
                return res.data.access_token;
            }).catch((err) => {
                return "";
            });
        return token;
    }
    /**
    * Lists the logged-in user's projects.
    * @param url the user who's projects will be listed. Requires token or username and password
    * @returns {Promise<array>} an array of projects objects
    */
    async getProjects() {
        let token = await this.accessToken;
        let _this = this;
        let config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
        let response = await axios.get("https://data-access.paratext.org/api8/projects", config).then((res) => {
                return res;
            }).catch((err) => {
                let count = 0
                if(err.response.data && err.response.data.includes("Invalid authorization token") && count < 3){
                    _this.getToken();
                    _this.getProjects();
                    console.log(count);
                    count++;
                }
            })
        let projects = [];
        if(response && response.status == 200){
            new xml2js.Parser().parseString(response.data, (err, result) => {
                projects = result.repos.repo;
            })
        }else{
            throw new Error("Something went wrong");
        }
        return projects;
    }
    async getBooksList(projectId) {
        let token = await this.accessToken;
        let config = {headers: {
            Authorization: `Bearer ${token}`
        }}
        let books = [];
        let response = await axios.get(`https://data-access.paratext.org/api8/books/${projectId}`, config).then((res) => {
            return res;
        }).catch((err) => {
            return {status: 400};
        });
        if(response && response.status == 200 ){
            new xml2js.Parser().parseString(response.data, (err, result) => {
             	books = result.ProjectBooks.Book.map((res, i) => {
             	    return res.$
             	});
            });
            return books;
        }else {
            throw new Error("Something went wrong");
        }
    }
    
    //importing
    async getUsxBookData(projectId, bookId){
        let token = await this.accessToken;
        let config = {headers: {
            Authorization: `Bearer ${token}`
        }}
        return await axios.get(`https://data-access.paratext.org/api8/text/${projectId}/${bookId}`, config).then((res) => {
            return res.data;
        }).catch((err) =>{
            throw new Error("Fetch bookdata issue");
        })
    }
    //Revision
    async getBookRevision(projectId, bookId){
        let token = await this.accessToken;
        let config = {headers: {
            Authorization: `Bearer ${token}`
        }}
        return await axios.get(`https://data-access.paratext.org/api8/revisions/${projectId}/${bookId}`, config).then((res) => {
            return res.data;
        }).catch((err) =>{
            throw new Error("Fetch bookdata issue");
        })
    }

    //exporting to paratext
    async updateBookData(projectId, bookId, revision, bookXmldoc){
        //convert in usx
        //send to the paratext API
        let token = await this.accessToken;
        let config = {headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': "application/x-www-form-urlencoded"
        }}
        return await axios.post(`https://data-access.paratext.org/api8/text/${projectId}/${revision}/${bookId}`, bookXmldoc, config).then((res) => {
            return res.data;
        }).catch((err) =>{
            console.log(err)
            throw new Error("upload bookdata issue");
        })
    }
}