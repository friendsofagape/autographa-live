// import * as wacs from "wacs-client";
// import tmp from "tmp";


// export default class Gitea {
//     constructor(username, password, endpoint, onFailure) {
//         this.endpoint = endpoint;
//         this.accessToken = {username: username, password: password};
//         wacs.login(this.accessToken, this.endpoint)
//             .then(withToken => this.accessToken = withToken)
//             .catch(onFailure);
//     }

//     async getProjects() {
//         const repos = await wacs.listMyRepos(this.accessToken, this.endpoint);
//         return repos.map(repoToProject);
//     }

//     async getBooksList(projectId) {
//         return [];
//     }

//     async clone(projectId) {
//         const localPath = tmp.dirSync({prefix:"autographa-"}).name;
//         const result = await wacs.clone(this.accessToken, localPath, projectId);
//         return localPath;
//     }

//     async commitAndPush(localPath) {
//         const result = await wacs.commitAndPush(this.accessToken, localPath, "Autographa export");
//         return result;
//     }

//     async create(projectName) {
//         const newRepo = await wacs.create(this.accessToken, projectName, this.endpoint);
//         const project = repoToProject(newRepo);
//         return project;
//     }

//     //importing
//     async getUsxBookData(projectId, bookId) {
//         throw new Error("Not implemented.");
//     }

//     //exporting
//     updateBookData(projectId, bookId, bookData) {
//         throw new Error("Not implemented.");
//     }
// }

// function repoToProject(r) {
//     return ({proj: [r.name], projid: [r.clone_url]});
// }
