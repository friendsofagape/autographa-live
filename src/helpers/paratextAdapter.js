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
        this.accessToken = this.getToken();
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
        let token = await this.accessToken
        let config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
        let response = await axios.get("https://data-access.paratext.org/api8/projects", config).then((res) => {
                return res.data;
            }).catch((err) => {
                return [];
            })
        let projects = [];
        if(response.length > 0){
            new xml2js.Parser().parseString(response, (err, result) => {
                projects = result.repos.repo;
            })
        }
        return projects;
    }
    async getBooks(projectId) {
        let token = await this.accessToken;
        let config = {headers: {
            Authorization: `Bearer ${token}`
        }}
        let books = [];
        let response = await axios.get(`https://data-access.paratext.org/api8/books/${projectId}`, config).then((res) => {
            return res.data
        }).catch((err) => {
            return [];
        });
        if(response.length > 0){

            new xml2js.Parser().parser.parseString(res.data, (err, result) => {
             	    books = result.ProjectBooks.Book.map((res, i) => {
             		    return res.$
             	    });
            });
            return books;
        }
    }
}



// export const books = (url, token) => {
//     return axios.get(url, config).then((res) => {
//             let parser = new xml2js.Parser();
//             parser.parseString(res.data, (err, result) => {
//             	let books = result.ProjectBooks.Book.map((res, i) => {
//             		return res.$
//             	});
//             	return books;
//             });
//         }).catch((err) => {
// 			return new Error("Fetch books issue");
// 	    });
// }

