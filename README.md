# NativeScript Firebase Common plugin


### How this plugin differs from [nativescript-plugin-firebase](https://github.com/EddyVerbruggen/nativescript-plugin-firebase):

This plugin aims to provide a common interface for firebase instances that can be easily used across Android, iOS, and the Web.
This means that the API surface should be limited as much as possible and should try to mimic the
detail of the native APIs as much as possible.

As it currently stands, the `nativescript-plugin-firebase` project does not offer an API that is similar to any
of the Firebase SDK APIs and offers high-level functionality at the expense of composability.

For this project right now, the common API is quite limited, but can easily be expanded to encapsulate additional features.

### Use when
* you need to store JSON data in the cloud,
* you want to sync that data to other devices and platforms,
* you want to optionally protect that data by having users log in,
* you want to update clients at the moment the data changes (think chat and multiplayer games).

## Prerequisites
NativeScript 1.3.0 (`tns --version`) is required for smooth installation, so please upgrade if you need to.

Head on over to firebase.com and sign up for a free account.
Your first 'Firebase' will be automatically created and made available via a URL
like `https://resplendent-fire-4211.firebaseio.com/`.

## Installation
From the command prompt go to your app's root folder and execute:
```
tns plugin add nativescript-plugin-firebase-common
```

## Usage

### createNew
```js
  var Firebase = require("nativescript-plugin-firebase-common").Firebase;

  var firebase = Firebase.createNew({
    url: 'https://resplendent-fire-4211.firebaseio.com'
    // persist: false // turn off offline disk persistence
  });
```

All further examples assume `firebase` has been required.

### child
Gets a firebase reference for the location at the specified relative path.

```js
    var categories = firebase.child("categories");
```

### set
Replaces the data at the current firebase location. 
Analogous to [`set()` in the Firebase JavaScript SDK](https://www.firebase.com/docs/web/api/firebase/set.html).

```js

  // to store a JSON object
  var promise = firebase.set(
      {'foo':'bar'}
  );

  // to store an array of JSON objects
  var otherPromise = firebase.set(
      [
        {name: 'Telerik', country: 'Bulgaria'},
        {name: 'Google', country: 'USA'}
      ]
  );
```

### push
This function will store the given object as a new child at the current location:

```js
  var promise = firebase.push(
      {
        'first': 'Eddy',
        'last': 'Verbruggen',
        'birthYear': 1977,
        'isMale': true,
        'address': {
          'street': 'foostreet',
          'number': 123
        }
      }
  );
```

### on
To listen for changes in your database you can pass in a listener callback function.
The possible event types are:

- `value`, Observes the value for the firebase ref.
- `child_added`, Observes when a new child is added to the firebase ref.
- `child_changed`, Observes when a child was modified in the firebase ref.
- `child_moved`, Observes when a child was moved in the firebase ref.
- `child_removed`, Observes when a child was removed from the firebase ref.

The plugin will take care of serializing native data structures to JSON data.

```js
  var onChildAdded = function(result) {
    console.log("Key: " + result.key());
    console.log("Value: " + JSON.stringify(result.val()));
  };

  var users = firebase.child("users");

  // listen to new "children" in the /users path
  var cancellationToken = users.on("child_added", onChildAdded);
  
  // to disable the event listener:
  users.off("child_added", cancellationToken);
```

This method and the related `off()` method have been designed to be analogous to the [Firebase JavaScript SDK](https://www.firebase.com/docs/web/api/query/on.html) versions.

### remove
You can remove the entire database content by omitting the param,
but if you only want to wipe everything at `'/users'`, do this:

```js
  var promise = firebase.remove("/users");
```

### login
v 1.1.0 of this plugin adds the capability to log your users in. Either anonymously or by email and password.
You need to add support for those features in your Firebase instance at the 'Login & Auth' tab.

You can expect more login mechanisms to be added in the future.

#### Anonymous login
```js
  firebase.login({
    // note that you need to enable anonymous login in your firebase instance
    type: firebase.loginType.ANONYMOUS
  }).then(
      function (result) {
        // the result object has these properties: uid, provider, expiresAtUnixEpochSeconds, profileImageURL, token
        JSON.stringify(result);
      },
      function (errorMessage) {
        console.log(errorMessage);
      }
  )
```

#### Password login
```js
  firebase.login({
      // note that you need to enable email-password login in your firebase instance
    type: firebase.loginType.PASSWORD,
    email: 'useraccount@provider.com',
    password: 'theirpassword'
  }).then(
      function (result) {
        // the result object has these properties: uid, provider, expiresAtUnixEpochSeconds, profileImageURL, token
        JSON.stringify(result);
      },
      function (errorMessage) {
        console.log(errorMessage);
      }
  )
```

#### Creating a Password account
```js
  firebase.createUser({
    email: 'eddyverbruggen@gmail.com',
    password: 'firebase'
  }).then(
      function (uid) {
        dialogs.alert({
          title: "User created",
          message: "uid: " + uid,
          okButtonText: "Nice!"
        })
      },
      function (errorMessage) {
        dialogs.alert({
          title: "No user created",
          message: errorMessage,
          okButtonText: "OK, got it"
        })
      }
  )
```

### logout
Shouldn't be more complicated than:

```js
  firebase.logout();
```

## Credits
The starting point for this plugin was [this great Gist](https://gist.github.com/jbristowe/c89a7bcae7fc9a035ee7) by [John Bristowe](https://github.com/jbristowe).
