import Gogs from "gogs-client"
// import Git from "nodegit"


export const DEFAULT_ENDPOINT = 'https://content.bibletranslationtools.org/api/v1';
export const DEFAULT_TOKEN_NAME = 'autographa';


/**
 * Get a user object with authentication token.
 * @param {Object} userObj Must contain fields username and password
 * @param endpoint
 * @param tokenName Name of the Gogs/Gitea authn token
 * @return {Promise} Promise with a user object containing a token.
 */
export const login = (userObj, endpoint=DEFAULT_ENDPOINT, tokenName=DEFAULT_TOKEN_NAME) => {
    const api = new Gogs(endpoint);
    const tokenStub = {name: tokenName};

    return checkUser(userObj)
        .then(api.listTokens)
        .then(ts => ts.find(t => t.name === tokenName))
        .then(t => t ? t : api.createToken(tokenStub, userObj))
        .then(t => ({username:userObj.username, token:t.sha1}));
};


/**
 * Lists the logged-in user's repositories.
 * @param {Object} userObj the user who's repositories will be listed. Requires token or username and password
 * @param endpoint
 * @returns {Promise<array>} an array of repository objects
 */
export const listMyRepos = (userObj, endpoint=DEFAULT_ENDPOINT) => {
    const api = new Gogs(endpoint);
    return checkUser(userObj)
        .then(api.listRepos);
};


/**
 * Create a repository on the server.
 * @param userObj
 * @param repoName
 * @param endpoint
 * @returns {Promise<Object>}
 */
export const create = (userObj, repoName, endpoint=DEFAULT_ENDPOINT) => {
    const api = new Gogs(endpoint);
    const repoConfig = {name: repoName, description: '', private: false};
    return checkUser(userObj)
        .then(user => api.createRepo(repoConfig, user));
};


// /**
//  * Locally clone a remote repository.
//  * @param userObj
//  * @param localPath
//  * @param cloneUrl
//  * @returns {Promise<Object>}
//  */
// export const clone = (userObj, localPath, cloneUrl) => {
//     return checkUser(userObj)
//         .then(fetchOpts)
//         .then(cloneOpts => Git.Clone(cloneUrl, localPath, cloneOpts));
// };


// /**
//  * Commit all files in the local working directory and push the commit.
//  * @param userObj
//  * @param localPath
//  * @param commitMsg
//  * @param clobberConflict if needed, create a merge commit that favors this update over others
//  * @returns {Promise<Object>}
//  */
// export const commitAndPush = (userObj, localPath, commitMsg="Update", clobberConflict=true) => {
//     const refSpecs = ["refs/heads/master:refs/heads/master"];

//     return fetchAndMergeOurs(userObj, localPath)
//         .then(() => Git.Repository.open(localPath))
//         .then(repository => Promise.all([
//             checkUser(userObj).then(credentialCallbacks),
//             repository,
//             buildParents(repository),
//             buildIndex(repository),
//             Git.Signature.default(repository),
//             Git.Remote.lookup(repository, "origin")
//         ]))
//         .then(([cred, repo, parents, index, sig, remote]) =>
//             repo.createCommit("HEAD", sig, sig, commitMsg, index, parents)
//                 .then(() => remote.push(refSpecs, cred))
//                 .catch(err => {
//                     if (err.errno === -11 && clobberConflict) {
//                         clobberMerge(repo)
//                             .then(() => remote.push(refSpecs, cred))
//                     }
//                     else {
//                         throw(err);
//                     }
//                 })
//         );
// };


// /**
//  * Pull updates from the remote.
//  * @param userObj
//  * @param localPath
//  * @param clobberConflict if needed, create a merge commit that favors this update over others
//  * @returns {Promise<Object>}
//  */
// export const fetchAndMergeOurs = (userObj, localPath, clobberConflict=true) => {
//     const mergeOptions = {fileFavor: Git.Merge.FILE_FAVOR.OURS};
//     return checkUser(userObj)
//         .then(() => Git.Repository.open(localPath))
//         .then(repo => repo.fetchAll(credentialCallbacks(userObj))
//             .then(() => repo.mergeBranches("master", "origin/master", Git.Signature.default(repo), null, mergeOptions))
//             .catch(err => {
//                 if (err.errno === -13 && clobberConflict) {
//                     return clobberMerge(repo);
//                 }
//                 else if (err.errno !== -3) {
//                     throw(err);
//                 }
//         }));
// };


// const buildIndex = repository =>
//     repository.refreshIndex()
//         .then(index => index.addAll()
//             .then(() => index.updateAll())
//             .then(() => index.write())
//             .then(() => index.writeTree()));

// const buildParents = repository =>
//     Git.Reference.nameToId(repository, "HEAD")
//         .then(oid => repository.getCommit(oid))
//         .catch(err => null)
//         .then(head => head ? [head] : []);

// const localAndRemoteHeads = repository =>
//     Git.Reference.lookup(repository, "HEAD")
//         .then(head => head.resolve())
//         .then(branch => Git.Branch.upstream(branch)
//             .then(upstrm => [branch, upstrm]))
//         .then(refs => refs.map(ref => ref.target()));

// const clobberMerge = (repository) =>
//     Promise.all([
//         localAndRemoteHeads(repository),
//         repository.refreshIndex().then(i => i.writeTree()),
//         Git.Signature.default(repository),
//         "Clobber-merge conflict."
//     ])
//         .then(([parents, index, sig, commitMsg]) =>
//             repository.createCommit("HEAD", sig, sig, commitMsg, index, parents));

// const credentialCallbacks = (userObj) => {
//     const userpass = userObj.token
//         ? [userObj.token, 'x-oauth-basic']
//         : [userObj.username, userObj.password];
//     const cred = Git.Cred.userpassPlaintextNew(...userpass);
//     return {callbacks: {credentials: () => cred}};
// };

const fetchOpts = (userObj) =>
    ({fetchOpts: credentialCallbacks(userObj)});

const checkUser = (userObj) =>
    new Promise((resolve, reject) => {
        if (!userObj) {
            reject("userObj is null");
        }
        else if (!userObj.token && (!userObj.username || !userObj.password)) {
            reject("userObj needs username+password or token.");
        }
        else {
            resolve(userObj);
        }
    });