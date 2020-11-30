exports.stringIsEmpty = (string) =>                                           //Check if string is empty
{   
    return String(string).length <= 0
}

exports.isZipcode = (zipcode) =>
{
    const regex = /^[0-9]{5}(?:-[0-9]{4})?$/;
    return regex.test(String(zipcode))
}

exports.isEmail = (email) =>                                                  //Check if it's a valid email
{
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(String(email).toLowerCase()) 
}