const express = require("express")
const bcrypt = require("bcrypt")


async function passwordencrypt (password) {

    let salt = await bcrypt.genSalt(10);
    let passwordHash = bcrypt.hash(password, salt);
    return passwordHash;

}

function passwordvalidation(password) {
    const passvalid = /^(?=.*[@#$&%])[a-zA-Z0-9@#$&%]{8,}$/;    
    return passvalid.test(password);
}

function NameValidation(Name) {
    return /^[A-Za-z\s]+$/.test(Name);
}

function EmailValidation(email) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}

function CompanyValidation(companyName) {
    return /^[a-zA-Z0-9\s]*$/.test(companyName);
}
 module.exports = { passwordencrypt, passwordvalidation ,NameValidation ,EmailValidation, CompanyValidation }