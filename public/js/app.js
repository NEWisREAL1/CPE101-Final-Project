let popup = document.getElementById('popup')

function openPopup(id){
  popup.classList.add('open-popup');
  loadPopupData(id);
}

function openPopup_movie(){
  popup.classList.add('open-popup-m')
}

function closePopup_movie(){
  popup.classList.remove('open-popup-m')
}

function closePopup(){
  popup.classList.remove('open-popup')
}

function toggleDarkLight() {
  var body = document.getElementById("body");
  var currentClass = body.className;
  body.className = currentClass == "dark-mode" ? "light-mode" : "dark-mode";   
}