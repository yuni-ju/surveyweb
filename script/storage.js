
// Your web apps Firebase configuration
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
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
function upfile() {
    // Create a root reference
    var storageRef = firebase.storage().ref("/images");
    var file = document.getElementById("photoImg").files[0];

    // Create the file metadata
    var metadata = {
        contentType: 'image/jpeg'
    };

    // Upload file and metadata to the object 'images/mountains.jpg'
    //var uploadTask = storageRef.child('images/' + file.name).put(file, metadata);

    var uploadTask = storageRef.child(file.name).put(file, metadata);

    // Listen for state changes, errors, and completion of the upload.

    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
        function (snapshot) {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
                case firebase.storage.TaskState.PAUSED: // or 'paused'
                    console.log('Upload is paused');
                    break;

                case firebase.storage.TaskState.RUNNING: // or 'running'
                    console.log('Upload is running');
                    break;
            }

        }, function (error) {
            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors

            switch (error.code) {
                case 'storage/unauthorized':
                    // User doesn''t have permission to access the object
                    break;

                case 'storage/canceled':
                    // User canceled the upload
                    break;

                case 'storage/unknown':
                    // Unknown error occurred, inspect error.serverResponse
                    break;

                default:
                    // Unknown error occurred, inspect error.serverResponse
                    alert("upload error");
                    break;
            }
        }, function () {
            // Upload completed successfully, now we can get the download URL
            uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                //console.log('File available at', downloadURL);
                var elem = document.createElement("img");

                elem.setAttribute("src", downloadURL);
                elem.setAttribute("height", "100");
                elem.setAttribute("width", "100");
                document.getElementById("myimg").appendChild(elem);

                document.getElementById("photo").value = downloadURL;

            });
        });
}
