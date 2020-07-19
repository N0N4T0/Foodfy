const express = require('express')
const nunjucks = require('nunjucks')
const methodOverride = require('method-override')
const routes = require("./routes")
const { urlencoded } = require('express')

const server = express()

server.use(urlencoded({ extended: true }))
server.use(express.static('public'))
server.use(methodOverride('_method'))
server.use(routes)

server.set("view engine", "njk")

nunjucks.configure("src/app/views", {
    express: server,
    autoescape: false,
    noCache: true
})


//porta
server.listen(5000, function(){
    console.log("$#%%$#server is running")
})