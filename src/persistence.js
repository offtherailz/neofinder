export const saveSetting = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};
export const getSetting = (key) => {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
}