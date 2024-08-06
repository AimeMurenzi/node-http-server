const fs = require('fs'); 
const pages = {};
fs.readFile(`${__dirname}/html/index.html`, (err, data) => {
    pages["index"] = data;
    pages["/"] = pages["index"];
    pages["/index.html"] = pages["index"];
    // pages["/html/index"] = pages["index"];
    // pages["/html/index.html"] = pages["index"]; 
});
fs.readFile(`${__dirname}/html/genericFormPage.html`, (err, data) => {
    pages["/register"] = data;
    pages["/register.html"] = pages["/register"]; 
    pages["/login"] = pages["/register"]; 
    pages["/login.html"] = pages["/register"]; 
});
fs.readFile(`${__dirname}/html/profile.html`, (err, data) => {
    pages["/profile"] = data;
    pages["/profile.html"] = pages["/profile"]; 
});
fs.readFile(`${__dirname}/css/main.css`, (err, data) => {
    pages["/css/main.css"] = data;  
}); 
function getContentForPath(path) {
    const page = pages[path];
    if (!!page) {
        return pages[path]
    }
}
module.exports = {
    getContentForPath
};