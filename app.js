const express = require('express')
const app = express()
const port = 80

app.get('/health', (req, res) => {
    res.send('Alive 2!')
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})