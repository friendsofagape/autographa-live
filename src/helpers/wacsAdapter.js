import * as wacs from "wacs-client"
import tmp from "tmp"


export default class Wacs {
    constructor(username, password, endpoint) {
        this.endpoint = endpoint;
        this.accessToken = {username: username, password: password};
        wacs.login(this.accessToken, this.endpoint)
            .then(withToken => this.accessToken = withToken);
    }

    async getProjects() {
        const repos = await wacs.listMyRepos(this.accessToken, this.endpoint);
        return repos.map(r => ({proj: [r.name], projid: [r.clone_url]}));
    }

    async getBooksList(projectId) {
        return [];
    }

    async clone(projectId) {
        const localPath = tmp.dirSync({prefix:"autographa-"}).name;
        const result = await wacs.clone(this.accessToken, localPath, projectId);
        return localPath;
    }

    async commitAndPush(localPath) {
        const result = await wacs.commitAndPush(this.accessToken, localPath, "Autographa export");
        return result;
    }

    //importing
    async getUsxBookData(projectId, bookId) {
        throw new Error("Not implemented.");
    }

    //exporting
    updateBookData(projectId, bookId, bookData) {
        throw new Error("Not implemented.");
    }
}
