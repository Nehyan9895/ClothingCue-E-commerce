const nums = [75, 123, 987, 456];

const sortedNums = nums.map(num => {
    const sortedDigits = num.toString().split('').sort((a, b) => a - b).join('');
    return parseInt(sortedDigits, 10);
});

console.log(sortedNums);
