const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
const firebase =  require('firebase')
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'fgl-xbcad7319.appspot.com'
});


// This was adapted from YouTube
// https://youtu.be/YPsftzOURLw?si=T3D6akuxN8OkdFCN
// Syed Zano
// https://www.youtube.com/@SyedZano
const firebaseConfig = {
  apiKey: "AIzaSyCJZUXG-q4N3zavIjC8hiQGF6yXd-8OFWA",
  authDomain: "fgl-xbcad7319.firebaseapp.com",
  projectId: "fgl-xbcad7319",
  storageBucket: "fgl-xbcad7319.appspot.com",
  messagingSenderId: "227000419335",
  appId: "1:227000419335:web:ca99f81b7bf7b3edd2d6a2",
  measurementId: "G-1VBG7XRPRZ"
};
  
firebase.initializeApp(firebaseConfig)

const auth = firebase.auth();
const db = firebase.firestore()
const batch = db.batch()

const User = db.collection('Users')
const Property = db.collection('Property')
const Chat = db.collection('Chats')
const Valuation = db.collection('Valuations')
const Message = db.collection('Messages')
const Purchase = db.collection('Purchases')
const Bookmark = db.collection('Bookmarks')

 
module.exports = { auth, admin, db, batch, FieldValue, User, Message, Property, Chat, Valuation, Purchase, Bookmark};