function ipfsGet(aUrl, aCallback) {
  const anHttpRequest = new XMLHttpRequest();
  anHttpRequest.onreadystatechange = function() {
    if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
      aCallback(anHttpRequest.responseText);
  }
  anHttpRequest.open( "GET", 'https://ipfs.infura.io' + aUrl, true );
  anHttpRequest.send( null );
}

export default ipfsGet
