exports.ipfsGet = (aUrl, aCallback) => {
    const anHttpRequest = new XMLHttpRequest();
    anHttpRequest.onreadystatechange = function() {
      if (anHttpRequest.readyState === 4 && anHttpRequest.status === 200)
        aCallback(anHttpRequest.responseText);
    }
    anHttpRequest.open( "GET", 'http://127.0.0.1:8080' + aUrl, true );
    anHttpRequest.send( null );
}
    