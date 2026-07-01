// Get random elements of an array
export const getRandomElements = (arr: string[], count: number) => {
    const shuffled = arr.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}