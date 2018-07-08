function ipfsGet(aUrl, aCallback) {
  console.log('called')

  var anHttpRequest = new XMLHttpRequest();
  anHttpRequest.onreadystatechange = function() {
    if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
      aCallback(anHttpRequest.responseText);
  }
  anHttpRequest.open( "GET", 'https://ipfs.infura.io/ipfs/' + aUrl, true );
  anHttpRequest.send( null );
}

export default ipfsGet
