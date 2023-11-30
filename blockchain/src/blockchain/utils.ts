export function pickRandomElements<T>(arr: T[], n: number): T[] | undefined {
    const length = arr.length;
    if (n > length) {
      console.error("Cannot pick more elements than the array contains");
      return undefined;
    }
    const shuffled = arr.slice(); 
    let currentIndex = length;
    let temporaryValue;
    let randomIndex;
  
  
    while (currentIndex !== 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      
      temporaryValue = shuffled[currentIndex];
      shuffled[currentIndex] = shuffled[randomIndex];
      shuffled[randomIndex] = temporaryValue;
    }
  
    return shuffled.slice(0, n); 
  }


  export function generateRandomPrice(): number {
    
    const base = 10; // Base of the logarithm
    const scalingFactor = 0.8; 
  
    // Generate a random number between 0 and 1 and use it as the exponent
    const exponent = Math.random();
    
    
    const price = Math.pow(base, scalingFactor * exponent) * 100000;
    
  
    return Math.floor(price);
  }