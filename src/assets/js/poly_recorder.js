(function(window){
  function myLibrary(){
    window.Upload_callback = function( user_id , content_id , data , w , l ){
      window.localStorage.setItem('record'+POLY.recordID, data);
      POLY.lastRecordCallback(POLY.recordID);
    }
    window.RecordState5M_callback = function( user_id , content_id , msg , w , l ) { }
    window.MicWizard_Message_callback = function( user_id , content_id , msg , w , l ) { }

    var _myLibraryObject = {
      browserPlatform: "windows",
      recordID: null,
      lastRecordCallback: null,

      callRecordStart: function (callback) {
        var user_id = '1234', content_id = '1110', type = '5m', sentense = '';

        switch(POLY.browserPlatform) {
          case 'windows':
            window.cefQuery({
              request: "PolyMessage:start?user_id=" + user_id + "&content_id=" + content_id + "&type=" + type + "&sentense=" + sentense,
              // 전용브라우저 구현영역
              onSuccess: function (response) {
                console.log('Record start success');
                callback(response);
              },
              onFailure: function (error_code, error_message) {
                console.log('Record start failed');
                callback([error_code, error_message]);
              }
            });
            break;
          case 'Android':
            // window.poly.callRecordStartClicked(user_id, content_id);
            window.poly.callNativeRecordStartClicked(user_id, content_id);
            callback();
            break;
          case 'iOS':
            // window.location.href = "jscall://callback?function=callRecordStartClicked&user_id=" + user_id + "&content_id=" + content_id;
            window.location.href = "jscall://callback?function=callNativeRecordStartClicked&user_id=" + user_id + "&content_id=" + content_id;
            callback();
            break;
        }
      },

      callRecordStop: function(callback, id) {
        POLY.recordID = id;
        var user_id = '1234', content_id = '1110';

        switch(POLY.browserPlatform) {
          case 'windows':
            window.cefQuery({
              request: "PolyMessage:stop?user_id=" + user_id + "&content_id=" + content_id, // 전용브라우저 구현영역
              onSuccess: function (response) {
                console.log('Record stop success');
                callback(response);
              },
              onFailure: function (error_code, error_message) {
                console.log('Record stop failed');
                callback([error_code, error_message]);
              }
            });
            break;
          case 'Android':
            // window.poly.callStopRecordClicked(user_id, content_id);
            window.poly.callNativeRecordStopClicked(user_id, content_id);
            setTimeout(function() {
              callback();
            }, 100);
            break;
          case 'iOS':
            // window.location.href = "jscall://callback?function=callRecordStopClicked&user_id="+user_id+"&content_id="+content_id;
            window.location.href = "jscall://callback?function=callNativeRecordStopClicked&user_id="+user_id+"&content_id="+content_id;
            setTimeout(function() {
              callback();
            }, 100);
            break;
        }
      },

      callRecordGetData: function(id, callback) {
        var user_id = '1234', content_id = '1110';
        POLY.lastRecordCallback = callback;
        console.log('request record getdata');

        switch(POLY.browserPlatform) {
          case 'windows':
            window.cefQuery({
              request: "PolyMessage:getData?uid=" + user_id + "&cid=" + content_id,    // 전용브라우저 구현영역
              onSuccess: function (response) {
                // console.log('record getdata success');
              },
              onFailure: function (error_code, error_message) {
                // console.log('record getdata fail');
              }
            });
            break;
          case 'Android':
            window.poly.callGetData(user_id, content_id);
            break;
          case 'iOS':
            window.location.href = "jscall://callback?function=callGetData&user_id="+user_id+"&content_id="+content_id;
            break;
        }
      }
    };
    return _myLibraryObject;
  }

  if(typeof(window.POLY) === 'undefined'){
    window.POLY = myLibrary();
  }
})(window);
