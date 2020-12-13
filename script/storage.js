var firebaseConfig = {
    apiKey: "AIzaSyAbf5diDxtGfsIq4_AxeL9xRKqih8kZXQk",
    authDomain: "modu-survey.firebaseapp.com",
    databaseURL: "https://modu-survey.firebaseio.com",
    projectId: "modu-survey",
    storageBucket: "modu-survey.appspot.com",
    messagingSenderId: "560434797628",
    appId: "1:560434797628:web:9df79c7bb8fafe98d43739",
    measurementId: "G-4W5JPS689E"
};

firebase.initializeApp(firebaseConfig);

var storage = firebase.storage();
var storageRef = storage.ref();
var tangRef = storageRef.child('images/logo.png');



