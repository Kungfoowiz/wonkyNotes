var firebase = require('firebase');

const express = require('express');
const cors = require('cors');
const Filter = require('bad-words');
const rateLimit = require("express-rate-limit");

const app = express();

var config = 
{
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



app.get('/', (request, response) => 
{
  
  if(canAccess(request))
  {
      response.sendFile(__dirname + "/views/index.html");
  }
  else
  {
    response.sendFile(__dirname + "/views/unknown.html");
  }
  
});



app.get('/notes', (request, response, next) => 
{
  
  if(canAccess(request))
  {

    firestore.collection("notes").
      orderBy("created", "asc").get().then(function (snapshot) 
    {
      var result = snapshot.docs.map(doc => { 
        var docResult = doc.data();
        
        docResult.id = doc.id;

        return docResult;
      });

      response.json(result);
    })
    .catch(next);
    
  }

});



function isValidText(note) 
{
  return note.text.length <= 200 && note.text.length > 0;
}



app.post('/notes', (request, response, next) => {
  
  if(canAccess(request))
  {
  
    if (isValidText(request.body)) 
    {

      const note = {
        text: filter.clean(request.body.text.toString().trim()),
        created: new Date()
      };

      firestore.collection("notes").add(note)
        .then(function (createdNote) {
          console.log("Document written with ID: ", createdNote.id);
          response.json(createdNote.id);
        })
        .catch(next);


    }
    
    else 
    {
      
      response.status(422);

      response.json({
        message: 'Hey! Text is required! Text cannot be longer than 200 characters.'
      });
      
    }
    
  }

});


  
  app.delete('/notes/:id', (request, response, next) => {
  
  //if(canAccess(request))
  //{
  
    // if (isValidText(request.body)) 
    // {

      //const noteId = filter.clean(request.params.id.toString().trim());
    
    firestore.collection("notes").doc('AvO77cDDf7V8Qxudqe9d').delete().then(function() {
    console.log("Document successfully deleted!");
      response.json('Doc deleted "AvO77cDDf7V8Qxudqe9d"');
}).catch(function(error) {
    console.error("Error removing document: ", error);
});


    // }
    
//     else 
//     {
      
//       response.status(422);

//       response.json({
//         message: 'Hey! Text is required! Text cannot be longer than 200 characters.'
//       });
      
//     }
    
  //}

});



function canAccess(request)
{
  
  var result = false;
  
  if(request.query.pass === process.env.pass)
  {
    result = true;
  }
  
  return result;
    
}



app.use(rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 100
}));



app.use((error, request, response, next) => {
  response.status(500);
  response.json({
    message: error.message
  });
});



app.listen(5000, () => {
  console.log('Listening on port 5000');
});
