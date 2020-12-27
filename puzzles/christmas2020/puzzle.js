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

function checkAnswers(answers, puzzleNumber) {
    const puzzleData = getPuzzleData();
    var results = [];

    answers.forEach((answer, index) => {
        var cipher = puzzleData.puzzles[puzzleNumber].questions[index].cipher;
        results.push(decrypt(cipher, answer));
    });

    if (results.length > 0 & results.every(v => v === true)) {
        showResponse("Your answer is correct!");
        const puzzleName = puzzleData.puzzles[puzzleNumber].name;
        setCookie(puzzleName, answers);
    } else {
        showResponse("Your answer is not correct");
    }
}

function submitAnswers(puzzleNumber, numQuestions) {
    var answers = [];
    for (var questionNumber = 0; questionNumber < numQuestions; questionNumber++) {
        var answerInput = document.getElementById(`answer${puzzleNumber}_question${questionNumber}`);
        var answer = answerInput.value;
        answers.push(answer);
    }
    checkAnswers(answers, puzzleNumber);
}

function clearAnswers(puzzleNumber) {
    const puzzleData = getPuzzleData();
    const puzzleName = puzzleData.puzzles[puzzleNumber].name;
    deleteCookie(puzzleName);
    const questions = puzzleData.puzzles[puzzleNumber].questions;

    for (var questionNumber = 0; questionNumber < questions.length; questionNumber++) {
        var answerInput = document.getElementById(`answer${puzzleNumber}_question${questionNumber}`);
        answerInput.value = "";
    }
    showResponse("");
}

function getPolygon(frac) {
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

function getAnswerFromCookie(puzzleName, questionNumber) {
    var answers = getCookie(puzzleName).split(",");
    if (questionNumber == 0 | answers.length > questionNumber) {
        return answers[questionNumber];
    } else {
        return "";
    }
}

function numDepsAnsweredCorrectly(puzzleNumber) {
    const puzzleData = getPuzzleData();
    const dependencies = puzzleData.puzzles[puzzleNumber].dependencies;
    var numDeps = 0;
    for (dep in dependencies) {
        if (getCookie(dependencies[dep])) {
            numDeps++;
        };
    }
    return numDeps;
}

function getMetaProgress(puzzleNumber) {
    const puzzleData = getPuzzleData();
    const dependencies = puzzleData.puzzles[puzzleNumber].dependencies;
    const numDeps = numDepsAnsweredCorrectly(puzzleNumber);
    return numDeps/dependencies.length;
}

function showPuzzleAnswerInput(puzzleData, puzzleNumber, showAnswerInput) {
    const puzzle = puzzleData.puzzles[puzzleNumber];
    const form = document.getElementById("puzzleForm");
    const submitButtonDiv = document.getElementById("submitButton");
    const clearButtonDiv = document.getElementById("clearButton");

    if (showAnswerInput) {
        const questions = puzzleData.puzzles[puzzleNumber].questions;

        removeChildren(form);
        const numQuestions = questions.length;

        for (var questionNumber = 0; questionNumber < numQuestions; questionNumber++) {
            var question = questions[questionNumber];
            var input_text = document.createElement("text");
            input_text.innerHTML = question.text;
            form.appendChild(input_text);

            var input = document.createElement("input");
            input.name = `answer${puzzleNumber}_question${questionNumber}`;
            input.id = `answer${puzzleNumber}_question${questionNumber}`;
            input.value = getAnswerFromCookie(puzzle.name, questionNumber);

            if (question.options != null) {
                dl = document.createElement('datalist');
                dl.id = `answer${puzzleNumber}_question${questionNumber}_datalist`
                input.setAttribute("list", dl.id);

                for (var i=0; i < question.options.length; i += 1) {
                    var option = document.createElement('option');
                    option.value = question.options[i];
                    dl.appendChild(option);
                }

                form.appendChild(input);
                form.appendChild(dl);

            } else {
                input.type = "text";
                form.appendChild(input);
            }
        }

        var button = document.createElement("button");
        button.id = `button${puzzleNumber}`;
        button.innerHTML = "submit answer";
        button.setAttribute("onclick", `submitAnswers(${puzzleNumber}, ${questions.length})`);
        replaceChild(submitButtonDiv, button);

        var button = document.createElement("button");
        button.id = `button${puzzleNumber}`;
        button.innerHTML = "clear answer";
        button.setAttribute("onclick", `clearAnswers(${puzzleNumber})`);
        replaceChild(clearButtonDiv, button);

        // enter submits the answer
        if (question.options != null) {
            var t = document.querySelector(`[list=${dl.id}]`);
        } else {
            var t = document.querySelector('[type=text]');
        }
        t.addEventListener('keydown', function(event) {
            if (event.keyCode == 13) {
                submitAnswers(puzzleNumber, questions.length);
            }   
        });

        t.addEventListener('keypress', function(event) {
            if (event.keyCode == 13) {
                event.preventDefault();
            }
        });

        if (!input.value) {
            showResponse("");
        } else {
            submitAnswers(puzzleNumber, questions.length);
        }

    } else {
        removeChildren(form);
        removeChildren(submitButtonDiv);
        removeChildren(clearButtonDiv);
        showResponse("");
    }
}

function showPuzzle(puzzleNumber) {
    const puzzleData = getPuzzleData();
    image = document.getElementById("puzzleImage");
    var img = document.createElement("img");
    img.src = puzzleData.puzzles[puzzleNumber].images[0];
    img.height = 700;
    replaceChild(image, img);

    const dependencies = puzzleData.puzzles[puzzleNumber].dependencies;
    var showAnswerInput;
    if (dependencies == null) {
        // Regular puzzle
        showAnswerInput = true;
        image.setAttribute("style", "display: inline-block;");
    } else {
        // Meta puzzle (with dependencies)
        const metaProgress = getMetaProgress(puzzleNumber);
        if (metaProgress == 1.0) {
            showAnswerInput = true;
        } else {
            showAnswerInput = false;
            const polygon = getPolygon(metaProgress);
            img.setAttribute("style", `display: inline-block; clip-path: polygon(${polygon});`);
            const meta = puzzleData.puzzles[puzzleNumber].images[1];
            image.setAttribute("style", `display: inline-block; background-image: url(${meta});`);
        }
    }

    showPuzzleAnswerInput(puzzleData, puzzleNumber, showAnswerInput);
}
