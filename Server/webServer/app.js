const express = require('express')

const app = express()

app.use(express.static('../../dist'))

app.listen(80, ()=>{
  console.log('web server running at http://127.0.0.1');
})