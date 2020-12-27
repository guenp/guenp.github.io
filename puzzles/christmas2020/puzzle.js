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
    const response = document.getElementById('puzzleResponse');
    const text = document.createElement("text");
    text.innerHTML = txt;
    replaceChild(response, text);
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
    const puzzle = puzzleData.puzzles[puzzleNumber];
    var results = [];

    answers.forEach((answer, index) => {
        var cipher = puzzle.questions[index].cipher;
        results.push(decrypt(cipher, answer));
    });

    var message;
    if (results.length > 0 & results.every(v => v === true)) {
        message = puzzle.success ? puzzle.success : "Your answer is correct!";
        const puzzleName = puzzle.name;
        setCookie(puzzleName, answers);
    } else {
        message = puzzle.fail ? puzzle.fail : "Your answer is not correct";
    }
    showResponse(message);
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
    const hasAnswers = getCookie(puzzle.name) ? true : false;

    if (showAnswerInput) {
        const questions = puzzleData.puzzles[puzzleNumber].questions;

        removeChildren(form);
        const br1 = document.createElement("br");
        form.appendChild(br1);
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
            const br = document.createElement("br");
            form.appendChild(br);
        }

    
        // submit button
        var button = document.createElement("button");
        button.id = `button${puzzleNumber}`;
        button.innerHTML = "submit answer";
        button.setAttribute("onclick", `submitAnswers(${puzzleNumber}, ${questions.length})`);
        replaceChild(submitButtonDiv, button);

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

        // clear button
        var button = document.createElement("button");
        button.id = `button${puzzleNumber}`;
        button.innerHTML = "clear answer";
        button.setAttribute("onclick", `clearAnswers(${puzzleNumber})`);
        replaceChild(clearButtonDiv, button);

        if (!hasAnswers) {
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
    const puzzle = puzzleData.puzzles[puzzleNumber];

    description = document.getElementById("puzzleDescription");
    description.innerHTML = puzzle.description;

    if (puzzleData.credits != null) {
        credits = document.getElementById("puzzleCredits");
        credits.innerHTML = puzzleData.credits;
    }

    image = document.getElementById("puzzleImage");
    var img = document.createElement("img");
    img.src = puzzleData.puzzles[puzzleNumber].images[0];
    img.height = 700;
    replaceChild(image, img);

    const dependencies = puzzleData.puzzles[puzzleNumber].dependencies;
    var showAnswerInput;

    if (puzzle.questions == null) {
        showAnswerInput = false;
        img.setAttribute("style", "");
        image.setAttribute("style", "");
    } else if (dependencies == null) {
        // Regular puzzle
        showAnswerInput = true;
        image.setAttribute("style", "");

    } else {
        // Meta puzzle (with dependencies)
        const metaProgress = getMetaProgress(puzzleNumber);

        if (metaProgress == 1.0) {
            showAnswerInput = true;

        } else {
            showAnswerInput = false;
            const polygon = getPolygon(metaProgress);
            img.setAttribute("style", `clip-path: polygon(${polygon});`);
            img.setAttribute("id", "puzzleImg");
            const meta = puzzleData.puzzles[puzzleNumber].images[1];
            image.setAttribute("style", `background-image: url(${meta}); background-repeat: no-repeat; background-size: contain`);
        }
    }

    showPuzzleAnswerInput(puzzleData, puzzleNumber, showAnswerInput);
}
