exports.ipfsGet = (aUrl, aCallback) => {
    const anHttpRequest = new XMLHttpRequest();
    anHttpRequest.onreadystatechange = function() {
      if (anHttpRequest.readyState === 4 && anHttpRequest.status === 200)
        aCallback(anHttpRequest.responseText);
    }
    anHttpRequest.open( "GET", process.env.REACT_APP_IPFS_URL + aUrl, true );
    anHttpRequest.send( null );
}
    