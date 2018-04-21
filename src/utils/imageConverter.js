function imageConverter(input) {
    var uInt8Array = new Uint8Array(input),
          i = uInt8Array.length;
    var biStr = [];
    while (i--) { biStr[i] = String.fromCharCode(uInt8Array[i]);  }
    var base64 = window.btoa(biStr.join(''));
    return base64;
};

export default imageConverter
