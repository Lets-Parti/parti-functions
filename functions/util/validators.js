exports.isEmpty = (string) =>                                           //Check if string is empty
{
    return string.length === 0;
}

exports.isZipcode = (zipcode) => {
    const regex = /^[0-9]{5}(?:-[0-9]{4})?$/;
    return regex.test(String(zipcode))
}

//Check if string email is a type email 
exports.isEmail = (email) =>                                                  //Check if it's a valid email
{
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(String(email).toLowerCase())
}

exports.containsSpecialCharacters = (str) => {
    const regex = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g
    return regex.test(str)
}

exports.isPhone = (str) => {
    //const regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
    if(!str.match(/\d/g)) return false; 
    return str.match(/\d/g).length===10;
}

exports.getDigits = (str) => {
    //const regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
    str1 = str.match(/\d/g).join("");
    return str1.slice(0,3) + "-" + str1.slice(3,6) + "-" + str1.slice(6);
}

exports.bioExceedLimit = (str) => {
    return str.length > 500;
}

exports.eventTitleLimit = (str) => {
    return str.length > 60;
}
exports.eventDescriptionLimit = (str) => {
    return str.length > 500;
}

exports.usernameLimit = (str) => {
    return str.length > 17;
}
exports.nameOfUserLimit = (str) => {
    return str.length > 30;
}
