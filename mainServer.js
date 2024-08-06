// v0.0.001
var http = require('http');
// var url = require('url');//deprecated
const { URL } = require('node:url');
const querystring = require('querystring');
const crypto = require('crypto');
// const fs = require('fs').promises;
const registeredPaths = require('./registeredPaths');
const userService = require("./userService");
const host = '127.0.0.1';
const port = 8080;
const generateSessionId = () => {
    return crypto.randomBytes(16).toString('hex');
};
function handleHTML(req,res) {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;
    const cookieHeader = req.headers.cookie;

    if (pathname.startsWith('/logout')) {
        if (cookieHeader && cookieHeader.includes('sessionId')) {
            const sessionId = cookieHeader.split('=')[1].trim();
            const session = sessions[sessionId];  
            if (session) {
                delete sessions[sessionId];
            }
        }
        res.statusCode = 303;
        res.setHeader('Location', '/index.html');
        return res.end();
    }

    const contents = registeredPaths.getContentForPath(pathname);
    if (!!!contents) {
        notFoundResponse(res);
        return;
    }
    if (pathname === "/") {
        res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        res.end(contents);
        return;
    }
   
    const split = pathname.split(".");
    if (split.length >= 2) {
        const extension = split[split.length - 1];
        switch (extension) { 
            case "js":
                res.setHeader("Content-Type", "text/javascript");
                res.writeHead(200);
                res.end(contents);
                return; 
            case "css":
                res.setHeader("Content-Type", "text/css");
                res.writeHead(200);
                res.end(contents);
                return; 
            default: 
                break;
        }
    }
    if (pathname.startsWith('/profile')) {
        if (cookieHeader && cookieHeader.includes('sessionId')) {
            const sessionId = cookieHeader.split('=')[1].trim();
            const session = sessions[sessionId]; 
            if (session) { 
                res.setHeader("Content-Type", "text/html");
                res.writeHead(200);
                res.end(contents);
                return;
            }
        }
        res.statusCode = 303;
        res.setHeader('Location', '/index.html');
        return res.end();
    }


    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    res.end(contents);
    
} 
const sessions = {};
const requestListener = function (req, res) {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;
    console.log(pathname);
    if (req.method === "GET") {
        if (pathname.startsWith("/api")) {
            notFoundResponse(res);
        } else {
            handleHTML(req,res);
        }
    } else if (req.method === "POST") {
        if (pathname === "/register") {
            let body = '';
            req.on('data', chunk => body += chunk.toString());
            req.on('end', async () => {
                const formData = querystring.parse(body);
                console.log('Form Data:', formData);
                const userServiceFailedToAddUser=! await userService.addUser(formData.username, formData.password)
                if(userServiceFailedToAddUser){
                    res.setHeader("Content-Type", "text/html");
                    res.writeHead(400);
                    const contents = registeredPaths.getContentForPath("/register");
                    return res.end(contents);
                }
                res.statusCode = 303;
                res.setHeader('Location', '/index.html');
                return res.end(); 
            });
        }
        if (pathname === "/login") {
            let body = '';
            req.on('data', chunk => body += chunk.toString());
            req.on('end', async () => {
                const formData = querystring.parse(body);
                console.log('Form Data:', formData);
                const username = formData.username;
                const password = formData.password;
                const authenticated =!! await userService.authenticate(username, password);
                if (authenticated) {
                    const sessionId = generateSessionId();
                    sessions[sessionId] = { username: authenticated };
                    res.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly; SameSite=Strict`);
                    res.statusCode = 303;
                    res.setHeader('Location', '/profile.html');
                    return res.end();
                }
                const contents = registeredPaths.getContentForPath("/register");
                res.setHeader("Content-Type", "text/html");
                res.writeHead(400);
                res.end(contents); 
                return; 
            });
        }
    } else {
        notFoundResponse(res);
    }
};

const server = http.createServer(requestListener);


server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});


function notFoundResponse(res) {
    res.setHeader("Content-Type", "text/html");
    res.writeHead(404);
    res.end("Not found");
}

