const express = require("express")
const path = require("path")
const fs = require("fs")
const childprocess = require("child_process")

const application = express()

application.use(express.json())
application.use(express.urlencoded({
    extended: false
}))

String.prototype.replaceAll = function(old, newRep) {
    var string = this
    while(string.includes(old)) {
        string = string.replace(old, newRep)
    }
    return string
}

application.use("/", express.static(path.join(__dirname, "public")))

application.get("/", (request, response) => {
    const ipWhitelist = fs.readFileSync("whitelist.txt").toString().replaceAll("\r", "").split("\n")
    if(!ipWhitelist.find(ip => request.ip.includes(ip))) {
        response.json({
            error: "You're not allowed to do that"
        })
        return
    }
    response.sendFile(path.join(__dirname, "page", "index.html"))
})

application.post("/command", (request, response) => {
    const ipWhitelist = fs.readFileSync("whitelist.txt").toString().replaceAll("\r", "").split("\n")
    if(!ipWhitelist.find(ip => request.ip.includes(ip))) {
        response.json({
            error: "You're not allowed to do that"
        })
        return
    }
    if(!request.body) return
    if(!request.body.command) return
    const {command} = request.body

    switch(command.toLowerCase()) {
        case "shutdown": {
            response.json({
                success: true
            })
            childprocess.execSync("shutdown /s")
            break;
        }
        case "openapp": {
            if(!request.body.app_name) {
                response.json({
                    error: "No app_name provided"
                })
                return
            }
            const {app_name} = request.body
            childprocess.execSync(`start ${app_name}`)
            break;
        }
        case "closeapp": {
            if(!request.body.app_name) {
                response.json({
                    error: "No app_name provided"
                })
                return
            }
            const {app_name} = request.body
            childprocess.execSync(`taskkill /F /IM ${app_name}.exe`)
            break;
        }
    }

})

application.listen(9090, () => {
    console.log("Web Server started at port 9090")
})