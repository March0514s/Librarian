import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import { config } from './Config';
import moment from 'moment';

class Firebase{
    constructor(){
        firebase.initializeApp(config);
        this.auth = firebase.auth();
        this.db = firebase.firestore();
        this.storage = firebase.storage();
    }

    //LOGIN
    async login(email, password){
        const user = await firebase.auth()
        .signInWithEmailAndPassword(email, password)
        .catch(err => {
            console.log(err);
            return err;
        });
        return user;
    }

    //SIGNIN
    async signin(email, password){
        const user = await firebase.auth()
        .createUserWithEmailAndPassword(email, password)
        .catch(err => {
            console.log(err);
            return err;
        });
        return user;
    }
    //LOGOUT
    async logout(){
        const logout = await firebase.auth()
        .signOut().catch(err => {
            console.log(err);
            return err;
        });
        return logout;
    }

    //USER STATE
    async getUserState(){
        return new Promise( resolve => {
            this.auth.onAuthStateChanged(resolve);
        });
    }

    //UPLOAD PROFILE PICTURE
    async uploadProfilePicture(file){
      const date = moment().format("YYYYMMDD-HHMMSS");
      const imageExtension = `.${file.name.split('.').pop()}`
      const imageName = `user-images/${this.auth.currentUser.uid}/${date}${imageExtension}`;
      const photoURL = await this.storage.ref().child(imageName).put(file)
      .then( snapshot => {
        return this.getProfilePictureURL(snapshot.metadata.fullPath)
      })
    //   .then(fullURL => {
    //     const oldImage = values.photoURL.split('./o/').pop().split('?')[0].replace(/%2F/g,'/');
    //     if (oldImage !== 'user-images/no-img.png'){
    //       store.child(oldImage).delete();
    //     }

    return photoURL;
    }
    
    async getProfilePictureURL(name){
        let nameFixed = name.replace(/\//g,'%2F');
        let fullURL = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${nameFixed}?alt=media`;
        return fullURL;
      }

    //UPDATE USER PROFILE
    async updateProfileData(profileData){
        if (profileData.displayName){
            this.auth.currentUser.updateProfile({
                displayName: profileData.displayName,
            });
        }

        if (profileData.photoURL){
            this.auth.currentUser.updateProfile({
                photoURL: profileData.photoURL,
            });
        }

        if (profileData.email){
            this.auth.currentUser.updateEmail(
                profileData.email,
            );
        }
    }

    //USER CREATION FOR TABLE LOADING
    //this.auth().currentUser.metadata.creationTime


}

export default new Firebase();