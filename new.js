var halvesAreAlike = function(s) {
    length = s.length;
    midpoint = Math.floor(length/2);
    firstPart = s.substring(0,midpoint);
    secondPart = s.substring(midpoint);
    vowel = 'aeiouAEIOU';
    count =0;
    count2= 0;
    for(let char of firstPart){
        if(vowel.includes(char)){
            count++;
        }
    }
    for(let char2 of secondPart){
        if(vowel.includes(char2)){
            count2++;
        }
    }
    console.log (count == count2);
};

str='textbook';
halvesAreAlike(str)