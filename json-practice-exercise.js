//A set of variables that might as well have been imported from an external file
var apiUrl = 'http://jsonplaceholder.typicode.com/',
  searchGroup = 'users',
  searchGroup2 = 'albums',
  searchGroup3 = 'photos',
  searchGroup4 = 'zipcode',
  regexZipcode = /[\d]{5}[\-][\d]{4}/,
  photoTitleRegex = '/voluptate/',
  userListTemp = '',
  userListReal = [],
  userIds = [];

//A function that returns an array of Users that get through the zipcode validation
function getUsers(data) {
  for (i in data) {
    if (data[i].address.zipcode.match(regexZipcode)) {
      userListTemp = userListTemp + data[i].id + ",";
    }
  }
  //Returning the array with the use of string actions
  userListTemp = userListTemp.toString();
  userListTemp = userListTemp.split(",");
  var length = userListTemp.length - 1;
  userListTemp.splice(length, 1);
  return userListTemp;
}

//A function that returns a list of users that went through the photo title validation
function getPhotos(data, userListReal) {
  for (i in userListReal) {
    for (j in userListReal[i].photo[j]) {
      for (k in data) {
        if (data[k].albumId == userListReal[i].photo[j]) {
          if (data[k].title.match(/voluptate/)) {
            userIds = userIds + userListReal[i].userId + ",";
            break;
          }
        }
      }
      break;
    }
  }
  userIds = userIds.toString();
  userIds = userIds.split(",");
  var length = userIds.length - 1;
  userIds.splice(length, 1);
  return userIds;
}

//A function that will allow us to download the txt file with the validated list of users
function createDownload(dataToDL) {
    var a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([dataToDL], {
        type: 'text/json'
    }));
    a.download = 'users.json';
    document.body.appendChild(a)
    a.click();
    document.body.removeChild(a)
}

//The main call. I'm positive that it could have been written in a few separate functions,
//I'm a total beginner though - this works well! If you have any tips, don't hesitate to send me a message
$.ajax({
  url: apiUrl + searchGroup,
  method: 'GET'
}).then(function(data) {
  userListTemp = getUsers(data);
  //Security measure concerning an empty array
  if (userListTemp.length > 0) {
    $.ajax({
      url: apiUrl + searchGroup2,
      method: 'GET'
    }).then(function(data) {
      for (j in userListTemp) {
        var albums = "";
        var albumId = {};
        for (i in data) {
          if (userListTemp[j] == data[i].userId) {
            albums = albums + data[i].id + ",";
          }
        }
        albums = albums.toString();
        albums = albums.split(',');
        //Creating an object containing validated data that will be pushed into the
        //Previously created empty array
        albumId = {
          "userId": userListTemp[j],
          "photo": albums
        };
        userListReal.push(albumId);
      }
      //Validation concerning overwriting data
      if (userListReal[0] != undefined) {
        $.ajax({
          url: apiUrl + searchGroup3,
          method: 'GET'
        }).then(function(data) {
          id = getPhotos(data, userListReal);
          if (id[0] != undefined) {
            $.ajax({
              url: apiUrl + searchGroup,
              method: 'GET'
            }).then(function(data) {
              var userContainer = [];
              for (i in id) {
                for (j in data) {
                  if (id[i] == data[j].id) {
                    userContainer[i] = data[j];
                  }
                }
              }
              //Creating the data download using the previously stated function
              userContainer = JSON.stringify(userContainer);
              createDownload(userContainer);
            });
          };
        });
      };
    });
  };
});
