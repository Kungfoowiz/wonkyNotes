const form = document.querySelector('form');
const errorElement = document.querySelector('.error-message');
const loadingElement = document.querySelector('.loading');
const notesElement = document.querySelector('.notes');
// const API_URL = 'http://localhost:5000/notes';
const API_URL = 'https://wonkynotes.glitch.me/notes';
const jumpy = $(".jumpy");
const primaryButton = $(".button-primary");

errorElement.style.display = 'none';


$(function() {
  jumpy.hover(function() {
    shakeEffect(jumpy, "up", 7, 3, 3000);
  });

  primaryButton.hover(function () {
    shakeEffect(primaryButton, "right", 3, 2, 1000);
  });

  // Reusable.

  var shakeEffect = function(target, direction, times, distance, duration) {
    target.effect(
      "shake",
      { direction: direction, times: times, distance: distance },
      duration
    );
  };
});



listAllNotes();





form.addEventListener('submit', (event) => {
  event.preventDefault();
  
  const formData = new FormData(form);
  const text = formData.get('text');

  if (text.trim()) {
    errorElement.style.display = 'none';
    form.style.display = 'none';
    loadingElement.style.display = '';

    const note = {
      text
    };
    
    fetch(getUrlWithPass(), {
      method: 'POST',
      body: JSON.stringify(note),
      headers: {
        'content-type': 'application/json'
      }
    }).then(response => {      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType.includes('json')) {
          return response.json().then(error => Promise.reject(error.message));
        } else {
          return response.text().then(message => Promise.reject(message));
        }
      }
    }).then(() => {
      form.reset();
      setTimeout(() => {
        form.style.display = '';
      }, 300);
      listAllNotes();
    }).catch(errorMessage => {
      form.style.display = '';
      errorElement.textContent = errorMessage;
      errorElement.style.display = '';
      loadingElement.style.display = 'none';
    });
  } else {
    errorElement.textContent = 'Text is required!';
    errorElement.style.display = '';
  }
});

function getUrlWithPass(){
  var params = (new URL(document.location)).searchParams;
  var pass = params.get("pass");
  
  return API_URL + '?pass=' + pass;
}

function listAllNotes() {
  
  notesElement.innerHTML = '';
  
  fetch(getUrlWithPass())

    .then(response => response.json())
    
    .then(notes => {

      if(notes !== undefined){
        
        notes.reverse();
        
        notes.forEach(note => {
          const div = document.createElement('div');

          const text = document.createElement('div');
          text.textContent = note.text;
          text.setAttribute('class', 'right');

          const created = document.createElement('small');
          created.textContent = new Date(note.created.seconds * 1e3).toUTCString();
          
          const deleteButton = document.createElement('span');
          deleteButton.onclick = function()
          {
            deleteNote('AvO77cDDf7V8Qxudqe9d');
          }
          deleteButton.setAttribute('class', 'hoverable fas fa-backspace');
          
          const line = document.createElement('hr');

          div.appendChild(text);
          text.appendChild(deleteButton);
          
          div.appendChild(created);
          
          div.appendChild(line);
          

          notesElement.appendChild(div);
        });
        loadingElement.style.display = 'none';
      }

    });

}


function deleteNote(id)
{

   fetch(API_URL, {
      method: 'DELETE',
      body: JSON.stringify('AvO77cDDf7V8Qxudqe9d'),
      headers: {
        'content-type': 'application/json'
      }
    }).then(response => {      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType.includes('json')) {
          return response.json().then(error => Promise.reject(error.message));
        } else {
          return response.text().then(message => Promise.reject(message));
        }
      }
    }).then(() => {
      form.reset();
      setTimeout(() => {
        form.style.display = '';
      }, 300);
      listAllNotes();
    }).catch(errorMessage => {
      form.style.display = '';
      errorElement.textContent = errorMessage;
      errorElement.style.display = '';
      loadingElement.style.display = 'none';
    });
  
}