// Functie triunghiulara de apartenenta ce determina gradul de apartenenta la un set fuzzy
function getMembershipRatio(x, a, b, c) {
    if(x <= a || x >= c) {
        return 0;
    }

    if(a <= x && x <= b) {
        return (x - a) / (b - a);
    }

    if(b <= x && x <= c) {
        return (c - x) / (c - b);
    }
}

// Determina setul fuzzy din care face parte o valaore crips a numarului de masini
function fuzzifyNumOfCars(numOfCars) {
    let lowRatio = getMembershipRatio(numOfCars, 0, 4, 8);
    let mediumRatio = getMembershipRatio(numOfCars, 6, 10, 14);
    let highRatio = getMembershipRatio(numOfCars, 12, 16, 20);

    let max = Math.max(lowRatio, mediumRatio, highRatio);

    if(max === lowRatio) {
        return 'l';
    } else if(max === mediumRatio) {
        return 'm';
    } else {
        return 'h';
    }
}

// Determina setul fuzzy din care face parte o valaore crips a nivelului de ceata
function fuzzifyFogLevel(fogLevel) {
    let lowRatio = getMembershipRatio(fogLevel, 0, 100, 200);
    let mediumRatio = getMembershipRatio(fogLevel, 170, 270, 370);
    let highRatio = getMembershipRatio(fogLevel, 350, 450, 600);

    let max = Math.max(lowRatio, mediumRatio, highRatio);

    if(max === lowRatio) {
        return 'l';
    } else if(max === mediumRatio) {
        return 'm';
    } else {
        return 'h';
    }
}

// Functie ce calculeaza outputul fuzzy (durata culorii verzi a semaforului)
function calculateFuzzyOutput(fuzzyArrivingCars, fuzzyWaitingCars, fuzzyFogLevel) {
    // Structura set reguli:
    // fuzzy masini ce vin spre semafor pe verde,
    // fuzzy masini ce asteapta al rosu,
    // fuzzy ceata,
    // fuzzy durata semafor (verde)
    let rulesSet = [
        ['h', 'l', 'l', 'mica'],
        ['h', 'l', 'm', 'medie'],
        ['h', 'l', 'h', 'mare'],
        ['h', 'm', 'l', 'medie'],
        ['h', 'm', 'm', 'medie'],
        ['h', 'm', 'h', 'mare'],
        ['h', 'h', 'l', 'mare'],
        ['h', 'h', 'm', 'mare'],
        ['h', 'h', 'h', 'mare'],
        ['m', 'l', 'l', 'mica'],
        ['m', 'l', 'm', 'medie'],
        ['m', 'l', 'h', 'medie'],
        ['m', 'm', 'l', 'medie'],
        ['m', 'm', 'm', 'medie'],
        ['m', 'm', 'h', 'medie'],
        ['m', 'h', 'l', 'mare'],
        ['m', 'h', 'm', 'mare'],
        ['m', 'h', 'h', 'medie'],
        ['l', 'l', 'l', 'mica'],
        ['l', 'l', 'm', 'medie'],
        ['l', 'l', 'h', 'medie'],
        ['l', 'm', 'l', 'medie'],
        ['l', 'm', 'm', 'mare'],
        ['l', 'm', 'h', 'medie'],
        ['l', 'h', 'l', 'mica'],
        ['l', 'h', 'm', 'medie'],
        ['l', 'h', 'h', 'mare'],
    ];

    // Returneaza outputul in functie de reguli si parametrii functiei
    for(let i = 0; i < rulesSet.length; i++) {
        if(rulesSet[i][0] === fuzzyArrivingCars
            && rulesSet[i][1] === fuzzyWaitingCars
            && rulesSet[i][2] === fuzzyFogLevel) {
            return rulesSet[i][3];
        }
    }
}

// Functie ce transforma valoarea fuzzy a outputului in valoare crips
function defuzzifyOutput(trafficLightFuzzyDuration) {
    if(trafficLightFuzzyDuration === 'mica') {
        return 3;
    } else if(trafficLightFuzzyDuration === 'medie') {
        return 6;
    } else {
        return 10;
    }
}