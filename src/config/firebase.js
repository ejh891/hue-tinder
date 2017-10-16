import firebase from 'firebase';

var config = {
    apiKey: "AIzaSyBwCMAgq12la8ADfWF5psfY63n7CftMJwk",
    databaseURL: "https://hue-tinder.firebaseio.com/",
    projectId: "hue-tinder",
    storageBucket: "hue-tinder.appspot.com",
    messagingSenderId: "417691378544"
};

firebase.initializeApp(config);

export const ref = firebase.database().ref()
export const firebaseDatabase = firebase.database;