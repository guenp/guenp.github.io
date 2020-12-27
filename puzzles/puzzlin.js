function setCookie(name, value) {
    document.cookie=`${name}=${value}; path=/`;
}

function deleteCookie(name) {
    setCookie(name, ";expires=Thu, 01 Jan 1970 00:00:00 UTC;");
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}

function decrypt(ciphertext, answer) {
    if (answer == "") {
        return false;
    }
    var bare_answer = answer.toLowerCase().replace(/\s/g, '');
    var result = CryptoJS.AES.decrypt(ciphertext, bare_answer).toString(CryptoJS.enc.Utf8);
    return result == "correct";
}
