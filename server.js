var firebase = require('firebase');

const express = require('express');
const cors = require('cors');
const Filter = require('bad-words');
const rateLimit = require("express-rate-limit");

const app = express();

var config = {
  apiKey: process.env.config_apiKey,
  authDomain: process.env.config_authDomain,
  databaseURL: process.env.config_databaseURL,
  storageBucket: process.env.config_storageBucket,
  projectId: process.env.config_projectId
};

firebase.initializeApp(config);

const firestore = firebase.firestore();

const filter = new Filter();

app.enable("trust proxy");
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + "/public"));



app.get('/', (request, response) => {
  
  var pass = request.query.pass;
  
  if(pass === process.env.pass)
  {
      response.sendFile(__dirname + "/views/index.html");
  }
  else
  {
    response.sendFile(__dirname + "/views/unknown.html");
  }
  
});

app




app.get('/notes', (request, response, next) => {

  firestore.collection("notes").orderBy("created").get()
    .then(function (snapshot) {
      var result = snapshot.docs.map(doc => { 
        
        var docResult = doc.data();
        docResult.id = doc.id;

        return docResult;
      });

      response.json(result);
    })
    .catch(next);

});





function isValidText(note) {
  return note.text.length <= 200 && note.text.length > 0;
}





app.use(rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 100
}));





app.post('/notes', (request, response, next) => {
  
  if (isValidText(request.body)) {

    const note = {
      text: filter.clean(request.body.text.toString().trim()),
      created: new Date().toUTCString()
    };

    firestore.collection("notes").add(note)
      .then(function (createdNote) {
        console.log("Document written with ID: ", createdNote.id);
        response.json(createdNote.id);
      })
      .catch(next);


  }
  else {
    response.status(422);
    
    response.json({
      message: 'Hey! Text is required! Text cannot be longer than 200 characters.'
    });
  }

});





app.use((error, request, response, next) => {
  response.status(500);
  response.json({
    message: error.message
  });
});





app.listen(5000, () => {
  console.log('Listening on port 5000');
});
