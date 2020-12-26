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

function getPuzzleData() {
    return JSON.parse(getCookie("puzzleData"));
}

function loadPuzzle() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            setCookie("puzzleData", JSON.stringify(JSON.parse(this.responseText)));
            showControls();
        }
    };
    xmlhttp.open("GET", "puzzle.json", true);
    xmlhttp.send();
}

function showControls() {
    const controls = document.getElementById("puzzleControls");
    const puzzleData = getPuzzleData();
    const numPuzzles = puzzleData.puzzles.length;

    for (puzzleNumber = 0; puzzleNumber < numPuzzles; puzzleNumber++) {
        var button = document.createElement("button");
        button.id = `buttonShow${puzzleNumber}`;
        button.innerHTML = puzzleData.puzzles[puzzleNumber].name;
        button.setAttribute("onclick", `showPuzzle(${puzzleNumber})`);
        controls.appendChild(button);
    }

    showPuzzle(0);
}

function showResponse(txt) {
    var response = document.getElementById('puzzleResponse');
    replaceChild(response, document.createTextNode(txt));
}

function replaceChild(parent, child) {
    if (parent.childNodes.length > 0) { 
        parent.replaceChild(child, parent.childNodes[0]);
    } else { 
        parent.appendChild(child);
    }
}

function removeChildren(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.lastChild);
    }
}

function decrypt(ciphertext, answer) {
    if (answer == "") {
        return false;
    }
    var bare_answer = answer.toLowerCase().replace(/\s/g, '');
    var result = CryptoJS.AES.decrypt(ciphertext, bare_answer).toString(CryptoJS.enc.Utf8);
    return result == "correct";
}

function checkAnswer(answer, puzzleNumber) {
    const puzzleData = getPuzzleData();
    const cipher = puzzleData.puzzles[puzzleNumber].cipher;

    if (decrypt(cipher, answer)) {
        showResponse("Your answer is correct!");
        const puzzleName = puzzleData.puzzles[puzzleNumber].name;
        setCookie(puzzleName, answer);
    } else {
        showResponse("Your answer is not correct");
    }
}

function submitAnswer(puzzleNumber) {
    var answerInput = document.getElementById('answer' + puzzleNumber);
    var answer = answerInput.value;
    checkAnswer(answer, puzzleNumber);
}

function clearAnswer(puzzleNumber) {
    var answerInput = document.getElementById('answer' + puzzleNumber);
    const puzzleData = getPuzzleData();
    const puzzleName = puzzleData.puzzles[puzzleNumber].name;
    deleteCookie(puzzleName);
    answerInput.value = "";
    showResponse("");
}

function getPolygon(num, total) {
    const frac = num/total;
    if (frac == 0.25) {
        return "0% 0%, 50% 0%, 50% 50%, 0% 50%";
    } else if (frac == 0.5) {
        return "0% 0%, 100% 0%, 100% 50%, 0% 50%";
    } else if (frac == 0.75) {
        return "0% 0%, 100% 0%, 100% 100%, 50% 100%, 50% 50%, 0% 50%";
    } else if (frac == 1.0) {
        return "0% 0%, 100% 0%, 100% 100%, 0% 100%";
    } else {
        return "0% 0%";
    }
}

function showPuzzle(puzzleNumber) {    
    image = document.getElementById("puzzleImage");
    var img = document.createElement("img");
    img.src = `puzzle${puzzleNumber}.png`;
    img.height = 700;
    replaceChild(image, img);

    const puzzleData = getPuzzleData();
    const puzzleName = puzzleData.puzzles[puzzleNumber].name;
    var dependencies = puzzleData.puzzles[puzzleNumber].dependencies;
    var showButton = false;
    if (dependencies == null) {
        showButton = true;
    }

    if (dependencies != null) {
        var numDeps = 0;

        for (dep in dependencies) {
            if (getCookie(dependencies[dep])) {
                numDeps++;
            };
        }

        if (dependencies.length == numDeps) {
            showButton = true;
        } else {
            const polygon = getPolygon(numDeps, dependencies.length);
            img.setAttribute("style", `display: inline-block; clip-path: polygon(${polygon});`);
            image.setAttribute("style", "display: inline-block; background-image: url(https://cdn.pixabay.com/photo/2017/07/31/19/51/hall-roof-2560454__340.jpg);");
        }
    } else {
        image.setAttribute("style", "display: inline-block;");
    }

    const form = document.getElementById("puzzleForm");
    const submitButtonDiv = document.getElementById("submitButton");
    const clearButtonDiv = document.getElementById("clearButton");

    if (showButton) {
        var input = document.createElement("input");
        input.type = "text";
        input.name = `answer${puzzleNumber}`;
        input.id = `answer${puzzleNumber}`;
        input.value = getCookie(puzzleName);
        replaceChild(form, input);

        var button = document.createElement("button");
        button.id = `button${puzzleNumber}`;
        button.innerHTML = "submit answer";
        button.setAttribute("onclick", `submitAnswer(${puzzleNumber})`);
        replaceChild(submitButtonDiv, button);

        var button = document.createElement("button");
        button.id = `button${puzzleNumber}`;
        button.innerHTML = "clear answer";
        button.setAttribute("onclick", `clearAnswer(${puzzleNumber})`);
        replaceChild(clearButtonDiv, button);

        // enter submits the answer
        var t = document.querySelector('[type=text]');
        t.addEventListener('keydown', function(event) {
            if (event.keyCode == 13) {
                submitAnswer(puzzleNumber);
            }
        });

        t.addEventListener('keypress', function(event) {
            if (event.keyCode == 13) {
                event.preventDefault();
            }
        });

        if (input.value) {
            checkAnswer(input.value, puzzleNumber);
        } else {
            showResponse("");
        }

    } else {

        removeChildren(form);
        removeChildren(submitButtonDiv);
        removeChildren(clearButtonDiv);
        showResponse("");

    }
}
