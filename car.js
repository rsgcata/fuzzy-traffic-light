// Acest fisier se ocupa in special de simularea deplasarii masinilor pe cele 2 strazi
// De asemenea face update la DOM (pagina) pentru a afisa informatiile legate de semafoare
// cate masini circula, nivel ceata, valori fuzzy si crisp ale acestora

// Declararea constantelor initiale si a structurilor de date initiale
// necesare pentru a urmari elementele simulatorului

// Noduri DOM pentru semafoare
const topLeftTrafficLightNode = document.querySelector('.top-left-traffic-light');
const topRightTrafficLightNode = document.querySelector('.top-right-traffic-light');
const bottomRightTrafficLightNode = document.querySelector('.bottom-right-traffic-light');
const bottomLeftTrafficLightNode = document.querySelector('.bottom-left-traffic-light');

// Noduri DOM pentru informatiile afisate in pagina (date fuzzy/crisp)
const mainCrispNode = document.querySelector('.main-crips');
const mainFuzzyNode = document.querySelector('.main-fuzzy');
const secondaryCrispNode = document.querySelector('.secondary-crisp');
const secondaryFuzzyNode = document.querySelector('.secondary-fuzzy');
const fogCrispNode = document.querySelector('.fog-crisp');
const fogFuzzyNode = document.querySelector('.fog-fuzzy');
const outCrispNode = document.querySelector('.output-crisp');
const outFuzzyNode = document.querySelector('.output-fuzzy');
const greenLightForNode = document.querySelector('.green-light-for');

// Pozitia unde ar trebui sa se opreasca masinile la fiecare semafor
const carsLightStopPositions = {
    down: parseInt(topLeftTrafficLightNode.style.marginTop)
        + parseInt(topLeftTrafficLightNode.style.height),
    left: parseInt(topRightTrafficLightNode.style.marginLeft)
        + parseInt(topRightTrafficLightNode.style.width),
    right: parseInt(bottomLeftTrafficLightNode.style.marginLeft)
        + parseInt(bottomLeftTrafficLightNode.style.width),
    up: parseInt(bottomRightTrafficLightNode.style.marginTop)
        + parseInt(bottomRightTrafficLightNode.style.height)
};

// Pozitia unde ar trebui inserta masinile in pagina/fereastra
const carsSpawnPositions = {
    top: {
        top: '0px', left: '307px'
    },
    left: {
        top: '337px', left: '0px'
    },
    right: {
        top: '305px', left: '640px'
    },
    bottom: {
        top: '650px', left: '341px'
    }
};

// Directiile de mers ale masinilor
const movementDirections = {
    left: 'left', down: 'down', up: 'up', right: 'right'
};

// Structura de date pentru gestiunea masinilor create
let carNodes = {};

// Un hashtable ce arata pozitiile masinilor in pagina
// pixel position -> car id map
// Separate pe 4 pozitii (unde apar masinile initial in pagina)
let carPositions = {
    top: {},
    down: {},
    left: {},
    right: {}
};

// Starea culorii semafoarelor. Datele din acest hashtable vor fi schimbate in functie de datele de iesire fuzzy
let greenLight = {
    top: true,
    down: true,
    left: false,
    right: false
};

// Pozitia semafoarelor
let trafficLightPositions = {
    top: 300,
    down: 370,
    left: 300,
    right: 370
};

// Declararea obiectului ce stocheaza numarul de masini aflate in pagina in asteptare pentru
// fiecare zona (practic avem 4 zone / 4 drepte intersectate)
// Se face data binding pe variabilele top, down, left, right si se face update automat la
// informatiile din DOM
let carsWaiting = {
    top1: 0,
    down1: 0,
    left1: 0,
    right1: 0,
    fuzzyNum: function(abbreviation) {
        if(abbreviation === 'l') {
            return 'putine';
        } else if(abbreviation === 'm') {
            return 'mediu';
        } else {
            return 'multe';
        }
    }
};

Object.defineProperty(carsWaiting, 'top', {
    get: function () { return this.top1; },
    set: function (v) {
        this.top1 = v;
        let fuzzy = fuzzifyNumOfCars(this.top1 + this.down1);
        mainCrispNode.innerHTML = this.top1 + this.down1;
        mainFuzzyNode.innerHTML = this.fuzzyNum(fuzzy);
    }
});

Object.defineProperty(carsWaiting, 'down', {
    get: function () { return this.down1; },
    set: function (v) {
        this.down1 = v;
        let fuzzy = fuzzifyNumOfCars(this.top1 + this.down1);
        mainCrispNode.innerHTML = this.top1 + this.down1;
        mainFuzzyNode.innerHTML = this.fuzzyNum(fuzzy);
    }
});

Object.defineProperty(carsWaiting, 'left', {
    get: function () { return this.left1; },
    set: function (v) {
        this.left1 = v;
        let fuzzy = fuzzifyNumOfCars(this.left1 + this.right1);
        secondaryCrispNode.innerHTML = this.left1 + this.right1;
        secondaryFuzzyNode.innerHTML = this.fuzzyNum(fuzzy);
    }
});

Object.defineProperty(carsWaiting, 'right', {
    get: function () { return this.right1; },
    set: function (v) {
        this.right1 = v;
        let fuzzy = fuzzifyNumOfCars(this.left1 + this.right1);
        secondaryCrispNode.innerHTML = this.left1 + this.right1;
        secondaryFuzzyNode.innerHTML = this.fuzzyNum(fuzzy);
    }
});

// Schimba culoarea semafoarelor (in pagina) in functie de valoarea verde a celor 2 semafoare de pe strada principala
// adica cea de pe verticala
function changeTrafficLightColor(mainLaneIsGreen) {
    let topLeftLightNode = document.querySelector('.top-left-traffic-light');
    let topLeftRedNode = topLeftLightNode.querySelector('.red-light');
    let topLeftGreenNode = topLeftLightNode.querySelector('.green-light');

    let bottomRightLightNode = document.querySelector('.bottom-right-traffic-light');
    let bottomRightRedNode = bottomRightLightNode.querySelector('.red-light');
    let bottomRightGreenNode = bottomRightLightNode.querySelector('.green-light');

    let topRightLightNode = document.querySelector('.top-right-traffic-light');
    let topRightRedNode = topRightLightNode.querySelector('.red-light');
    let topRightGreenNode = topRightLightNode.querySelector('.green-light');

    let bottomLeftLightNode = document.querySelector('.bottom-left-traffic-light');
    let bottomLeftRedNode = bottomLeftLightNode.querySelector('.red-light');
    let bottomLeftGreenNode = bottomLeftLightNode.querySelector('.green-light');

    greenLight.top = mainLaneIsGreen;
    greenLight.down = mainLaneIsGreen;
    greenLight.left = !mainLaneIsGreen;
    greenLight.right = !mainLaneIsGreen;

    if(mainLaneIsGreen) {
        topLeftGreenNode.classList.add('on');
        bottomRightGreenNode.classList.add('on');
        topLeftRedNode.classList.remove('on');
        bottomRightRedNode.classList.remove('on');

        topRightGreenNode.classList.remove('on');
        bottomLeftGreenNode.classList.remove('on');
        topRightRedNode.classList.add('on');
        bottomLeftRedNode.classList.add('on');
    } else {
        topLeftGreenNode.classList.remove('on');
        bottomRightGreenNode.classList.remove('on');
        topLeftRedNode.classList.add('on');
        bottomRightRedNode.classList.add('on');

        topRightGreenNode.classList.add('on');
        bottomLeftGreenNode.classList.add('on');
        topRightRedNode.classList.remove('on');
        bottomLeftRedNode.classList.remove('on');
    }
}

// Verifica daca masina a iesit din partea vizibila din fereastra
// Necesar pentru a elibera resursele ocupate de masini (memorie/cpu)
function isInViewport (elem) {
    let bounding = elem.getBoundingClientRect();
    return (
        bounding.top >= 0 &&
        bounding.left >= 0 &&
        bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
};

// Genereaza un numar intreg aleator intre min si max
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

// Genereaza setari aleatoare pentru o masina (estetica)
function buildRandomCarSpecs() {
    const width = '20px';
    const height = getRandomInt(20, 30) + 'px';
    const borderRadius = getRandomInt(10, 40) + '%';
    const colors = ['#00695c', '#D84315', '#4E342E', '#424242', '#37474F', '#283593', '#1565C0'];
    const carColor = colors[getRandomInt(0, 6)];

    return {width, height, borderRadius, carColor};
}

// Construieste un nod DOM pentru o masina folosing setari aleatoare
function buildRandomCarNode() {
    let carNode = document.createElement('div');
    let carSpecs = buildRandomCarSpecs();

    carNode.classList.add('car');

    carNode.style.width = carSpecs.width;
    carNode.style.height = carSpecs.height;
    carNode.style.borderRadius = carSpecs.borderRadius;
    carNode.style.backgroundColor = carSpecs.carColor;
    carNode.style.backgroundColor = carSpecs.carColor;

    carNode.metaData = {};

    return carNode;
}

// Verifica daca masinile care vin de sus trebuie sa se opreasca sau nu
// Ele trebuie sa se opreasca daca vad semafor rosu sau daca exista o masina in fata lor care este oprita
function carTopHasToStop(carNode) {
    const carMarginTop = parseInt(carNode.style.marginTop);
    const carHeight = parseInt(carNode.style.height);
    const lookAheadStart = carMarginTop + carHeight;

    if(carPositions.top[lookAheadStart + 2]
        || carPositions.top[lookAheadStart + 3]
        || carPositions.top[lookAheadStart + 4]) {
        return true;
    }

    if(!greenLight.top
        && (lookAheadStart === trafficLightPositions.top
            || lookAheadStart === trafficLightPositions.top + 1
            || lookAheadStart === trafficLightPositions.top + 2)) {

        return true;
    }

    return false;
}

// Verifica daca masinile care vin de jos trebuie sa se opreasca sau nu
// Ele trebuie sa se opreasca daca vad semafor rosu sau daca exista o masina in fata lor care este oprita
function carDownHasToStop(carNode) {
    const lookAheadStart = parseInt(carNode.style.marginTop);

    if(carPositions.down[lookAheadStart - 2]
        || carPositions.down[lookAheadStart - 3]
        || carPositions.down[lookAheadStart - 4]) {
        return true;
    }

    if(!greenLight.down
        && (lookAheadStart === trafficLightPositions.down
            || lookAheadStart === trafficLightPositions.down - 1
            || lookAheadStart === trafficLightPositions.down - 2)) {

        return true;
    }

    return false;
}

// Verifica daca masinile care vin din dreapta trebuie sa se opreasca sau nu
// Ele trebuie sa se opreasca daca vad semafor rosu sau daca exista o masina in fata lor care este oprita
function carRightHasToStop(carNode) {
    const lookAheadStart = parseInt(carNode.style.marginLeft);

    if(carPositions.right[lookAheadStart - 2]
        || carPositions.right[lookAheadStart - 3]
        || carPositions.right[lookAheadStart - 4]) {
        return true;
    }

    if(!greenLight.right
        && (lookAheadStart === trafficLightPositions.right
            || lookAheadStart === trafficLightPositions.right - 1
            || lookAheadStart === trafficLightPositions.right - 2)) {

        return true;
    }

    return false;
}

// Verifica daca masinile care vin din stanga trebuie sa se opreasca sau nu
// Ele trebuie sa se opreasca daca vad semafor rosu sau daca exista o masina in fata lor care este oprita
function carLeftHasToStop(carNode) {
    const lookAheadStart = parseInt(carNode.style.marginLeft) + parseInt(carNode.style.height);

    if(carPositions.left[lookAheadStart + 2]
        || carPositions.left[lookAheadStart + 3]
        || carPositions.left[lookAheadStart + 4]) {
        return true;
    }

    if(!greenLight.left
        && (lookAheadStart === trafficLightPositions.left
            || lookAheadStart === trafficLightPositions.left + 1
            || lookAheadStart === trafficLightPositions.left + 2)) {

        return true;
    }

    return false;
}

// Verifica daca orice masina trebuie sa se opreasca sau nu (se ia directia de mers in calcul)
function carHasToStop(carNode) {
    let carHasToStop = false;

    if(carNode.metaData.movementDirection === movementDirections.down) {
        carHasToStop = carTopHasToStop(carNode);
    } else if(carNode.metaData.movementDirection === movementDirections.up) {
        carHasToStop = carDownHasToStop(carNode);
    } else if(carNode.metaData.movementDirection === movementDirections.left) {
        carHasToStop = carRightHasToStop(carNode);
    } else if(carNode.metaData.movementDirection === movementDirections.right) {
        carHasToStop = carLeftHasToStop(carNode);
    }

    return carHasToStop;
};

/**
 * Creaza un nod de masina pregatit pentru a fi inserat in pagina
 *
 * @returns {null|HTMLDivElement} Returneaza null daca s-a atins numarul maxim de masini pe o sectiune
 *                                sau nod masina
 */
function spawnRandomCar() {
    const availableDirections = [
        movementDirections.down, movementDirections.up,
        movementDirections.left, movementDirections.right
    ];
    const movementDirection = availableDirections[getRandomInt(0,4)];

    // Daca s-a depasit limita de 10 masini per sectiune (top/down/left/right) returneaza null
    // Altfel s-ar suprapune masinile
    if((movementDirection === movementDirections.down && carsWaiting.top > 9)
        || (movementDirection === movementDirections.up && carsWaiting.down > 9)
        || (movementDirection === movementDirections.left && carsWaiting.right > 9)
        || (movementDirection === movementDirections.right && carsWaiting.left > 9)) {
        return null;
    }

    const carId = Math.random();

    // Seteaza metadata pe fiecare obiect al masinii necesar global pentru logica masinii
    let carNode = buildRandomCarNode();
    carNode.metaData.movementDirection = movementDirection;
    carNode.metaData.id = carId;
    carNode.metaData.isWaiting = true;
    carNodes[carId] = carNode;

    // Ajusteaza afisarea masinilor si incrementeaza numarul masinilor aflate in asteptare
    // Teoretic ele sunt in asteptare in starea initiala pana sa ajunga la semafor
    if(movementDirection === movementDirections.left) {
        carNode.classList.add('car-horizontal');
        carNode.style.marginTop = carsSpawnPositions.right.top;
        carNode.style.marginLeft = carsSpawnPositions.right.left;
        carsWaiting.right++;
    } else if(movementDirection === movementDirections.right) {
        carNode.classList.add('car-horizontal');
        carNode.style.marginTop = carsSpawnPositions.left.top;
        carNode.style.marginLeft = carsSpawnPositions.left.left;
        carsWaiting.left++;
    } else if(movementDirection === movementDirections.down) {
        carNode.style.marginTop = carsSpawnPositions.top.top;
        carNode.style.marginLeft = carsSpawnPositions.top.left;
        carsWaiting.top++;
    } else {
        carNode.style.marginTop = carsSpawnPositions.bottom.top;
        carNode.style.marginLeft = carsSpawnPositions.bottom.left;
        carsWaiting.down++;
    }

    // Functie recursiva de deplasare a unei masini
    const moveCar = () => {
        // Opreste rularea functiei daca masina este in asteptare
        if(carHasToStop(carNode)) {
            setTimeout(moveCar, 10);
            return;
        }

        // Gestioneaza starea masinii relativ la simulator in functie de directia de mers
        // Pentru fiecare directie de mers se va repeta logica ca in "if"
        if(movementDirection === movementDirections.down) {
            // Sterge pozitia acestei masini pentru ca ea va inainta 2 pixeli
            delete carPositions.top[parseInt(carNode.style.marginTop)];
            carNode.style.marginTop = (parseInt(carNode.style.marginTop) + 2) + 'px';
            // Adauga noua pozitie a masinii in hashtable
            carPositions.top[parseInt(carNode.style.marginTop)] = carNode.metaData.id;

            // Daca a depasit semaforul masina nu mai e in asteptare, scaote din repo global de stocare
            // a masinilor in asteptare
            if(parseInt(carNode.style.marginTop) > trafficLightPositions.top + 40
                && carNode.metaData.isWaiting) {
                carsWaiting.top--;
                carNode.metaData.isWaiting = false;
            }

            // Daca masina a iesit din fereastra scoate-o din hashtable de pozitii ale masinilor
            if(!isInViewport(carNode)) {
                delete carPositions.top[parseInt(carNode.style.marginTop)];
            }
        } else if(movementDirection === movementDirections.up) {
            delete carPositions.down[parseInt(carNode.style.marginTop) + parseInt(carNode.style.height)];
            carNode.style.marginTop = (parseInt(carNode.style.marginTop) - 2) + 'px';
            carPositions.down[parseInt(carNode.style.marginTop) + parseInt(carNode.style.height)]
                = carNode.metaData.id;

            if(parseInt(carNode.style.marginTop) < trafficLightPositions.down - 40
                && carNode.metaData.isWaiting) {
                carsWaiting.down--;
                carNode.metaData.isWaiting = false;
            }

            if(!isInViewport(carNode)) {
                delete carPositions.down[parseInt(carNode.style.marginTop) + parseInt(carNode.style.height)];
            }
        } else if(movementDirection === movementDirections.left) {
            delete carPositions.right[parseInt(carNode.style.marginLeft) + parseInt(carNode.style.height)];
            carNode.style.marginLeft = (parseInt(carNode.style.marginLeft) - 2) + 'px';
            carPositions.right[parseInt(carNode.style.marginLeft) + parseInt(carNode.style.height)]
                = carNode.metaData.id;

            if(parseInt(carNode.style.marginLeft) < trafficLightPositions.right - 40
                && carNode.metaData.isWaiting) {
                carsWaiting.right--;
                carNode.metaData.isWaiting = false;
            }

            if(!isInViewport(carNode)) {
                delete carPositions.right[parseInt(carNode.style.marginLeft) + parseInt(carNode.style.height)];
            }
        } else if(movementDirection === movementDirections.right) {
            delete carPositions.left[parseInt(carNode.style.marginLeft)];
            carNode.style.marginLeft = (parseInt(carNode.style.marginLeft) + 2) + 'px';
            carPositions.left[parseInt(carNode.style.marginLeft)] = carNode.metaData.id;

            if(parseInt(carNode.style.marginLeft) > trafficLightPositions.left + 40
                && carNode.metaData.isWaiting) {
                carsWaiting.left--;
                carNode.metaData.isWaiting = false;
            }

            if(!isInViewport(carNode)) {
                delete carPositions.left[parseInt(carNode.style.marginLeft)];
            }
        }

        // Daca masina nu se mai afla in fereastra elibereaza resursele (memorie/cpu cleanup)
        if(!isInViewport(carNode)) {
            carNode.remove();
            delete carNodes[carNode.metaData.id];
            return;
        }

        // Recursivitate ce permite masiniii sa mearga constant
        setTimeout(moveCar, 10);
    };

    // Initializeaza miscarea masinii
    moveCar();

    return carNode;
}

// Functie ce adauga o masina aleatoare in pagina
function appendRandomCarToDom(delay) {
    setTimeout(() => {
        appendRandomCarToDom(getRandomInt(200, 700));

        let carNode = spawnRandomCar();

        if(carNode === null) {
            return;
        }

        document.body.append(carNode);
    }, delay);
}

// Adauga o masina aleatoare in pagina
appendRandomCarToDom(getRandomInt(200, 700));

let mainLaneGreen = true;
let fogLevel = getRandomInt(0, 600);
let fuzzyFogLevel = fuzzifyFogLevel(fogLevel);

// Functie ce transforma valaorea fuzzy pentru ceata intr-o valoare mai prietenoasa pentru utilizator
function fuzzyFog(abbreviation) {
    if(abbreviation === 'l') {
        return 'redus';
    } else if(abbreviation === 'm') {
        return 'mediu';
    } else {
        return 'ridicat';
    }
}

fogCrispNode.innerHTML = fogLevel;
fogFuzzyNode.innerHTML = fuzzyFog(fuzzyFogLevel);

// Functie ce alterneaza culoarea semafoarelor in functie de o amanare (delay)
// Aceasta se va apela pe ea insasi (recursivitate)
// Acest delay este practic data de outputul din sistemul fuzzy, conform regulilor setate in functie de
// variabilele de intrare si iesire
function alternateTrafficLights(delay) {
    setTimeout(() => {
        // Fuzzificare numar masini de pe strada verticala
        let fuzzyMainLane = fuzzifyNumOfCars(
            carsWaiting.top + carsWaiting.down
        );
        // Fuzzificare numar masini de pe strada orizontala
        let fuzzySecondaryLane = fuzzifyNumOfCars(
            carsWaiting.left + carsWaiting.right
        );
        // Fuzzificare nivel de ceata
        let fuzzyFogLevel = fuzzifyFogLevel(fogLevel);

        // Calcularea timpului pentru semafoare, ca valaore fuzzy
        let fuzzyGreenLightDuration = null;
        if(mainLaneGreen) {
            fuzzyGreenLightDuration = calculateFuzzyOutput(
                fuzzyMainLane, fuzzySecondaryLane, fuzzyFogLevel
            );
        } else {
            fuzzyGreenLightDuration = calculateFuzzyOutput(
                fuzzySecondaryLane, fuzzyMainLane, fuzzyFogLevel
            );
        }

        // Defuzzificare in valoare crips a valorii fuzzy pentru timp semafoare
        let crispDuration = defuzzifyOutput(fuzzyGreenLightDuration);
        outCrispNode.innerHTML = crispDuration + 'secunde';
        outFuzzyNode.innerHTML = fuzzyGreenLightDuration;
        mainLaneGreen = !mainLaneGreen;
        greenLightForNode.innerHTML = mainLaneGreen ? 'strada verticala' : 'strada orizontala';

        // Schimba culorile semaforului si reporneste calculele cand s-a scurs timpul pentru semafoarele verzi
        changeTrafficLightColor(mainLaneGreen);
        alternateTrafficLights(crispDuration * 1000);
    }, delay);
}

// Porneste semafoarele
alternateTrafficLights(500);

