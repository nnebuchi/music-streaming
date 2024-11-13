"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getOriginalWordFromCompoundWord = (compound_word) => {
    return compound_word === null || compound_word === void 0 ? void 0 : compound_word.replace('_', ' ');
};
const checkEmailInDB = (input, db_model) => __awaiter(void 0, void 0, void 0, function* () {
    const finder = {};
    finder[input.field] = input.value;
    // const model = toPascalCase(db_table);
    const record = yield prisma[db_model].findUnique({
        where: finder
    });
    if (record) {
        console.log('found');
        return true;
    }
    else {
        console.log('not found');
        return false;
    }
});
const buchi_validate = (input_1, constraints_1, ...args_1) => __awaiter(void 0, [input_1, constraints_1, ...args_1], void 0, function* (input, constraints, alias = null, fields) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const matchFinder = fields.find((field) => {
        var _a;
        return (constraints === null || constraints === void 0 ? void 0 : constraints.must_match) === ((_a = field.input) === null || _a === void 0 ? void 0 : _a.field);
    });
    if (input != null) {
        // Remove existing validation message
        // REGEX for valid email fields
        const email_pattern = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
        // REGEX for special character fields
        const specialCharsRegex = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        const number = /[0-9]/g;
        // Rules Definition
        const rules = {
            required: {
                pass: (constraints === null || constraints === void 0 ? void 0 : constraints.required) === true ? ((input === null || input === void 0 ? void 0 : input.type) != 'file' ? (((_a = input === null || input === void 0 ? void 0 : input.value) === null || _a === void 0 ? void 0 : _a.length) > 0) : (((_b = input === null || input === void 0 ? void 0 : input.files) === null || _b === void 0 ? void 0 : _b.length) > 0)) : true,
                message: alias === null ? getOriginalWordFromCompoundWord(input === null || input === void 0 ? void 0 : input.field) + " is required" : alias + " is required"
            },
            min_length: {
                pass: (constraints === null || constraints === void 0 ? void 0 : constraints.hasOwnProperty('min_length')) === true ? (((_c = input === null || input === void 0 ? void 0 : input.value) === null || _c === void 0 ? void 0 : _c.length) > 0 ? ((_d = input === null || input === void 0 ? void 0 : input.value) === null || _d === void 0 ? void 0 : _d.length) >= (constraints === null || constraints === void 0 ? void 0 : constraints.min_length) : true) : true,
                message: alias === null ? getOriginalWordFromCompoundWord(input === null || input === void 0 ? void 0 : input.field) + " must have up to " + (constraints === null || constraints === void 0 ? void 0 : constraints.min_length) + " characters" : alias + " must have up to " + (constraints === null || constraints === void 0 ? void 0 : constraints.min_length) + " characters"
            },
            max_length: {
                pass: (constraints === null || constraints === void 0 ? void 0 : constraints.hasOwnProperty('max_length')) === true ? (((_e = input === null || input === void 0 ? void 0 : input.value) === null || _e === void 0 ? void 0 : _e.length) > 0 ? ((_f = input === null || input === void 0 ? void 0 : input.value) === null || _f === void 0 ? void 0 : _f.length) <= (constraints === null || constraints === void 0 ? void 0 : constraints.max_length) : true) : true,
                message: alias === null ? getOriginalWordFromCompoundWord(input === null || input === void 0 ? void 0 : input.field) + " must not exceed " + (constraints === null || constraints === void 0 ? void 0 : constraints.max_length) + " characters" : alias + " must not exceed " + (constraints === null || constraints === void 0 ? void 0 : constraints.max_length) + " characters"
            },
            email: {
                pass: (constraints === null || constraints === void 0 ? void 0 : constraints.email) === true && ((_g = input === null || input === void 0 ? void 0 : input.value) === null || _g === void 0 ? void 0 : _g.length) > 0 ? email_pattern.test(input === null || input === void 0 ? void 0 : input.value) : true,
                message: alias === null ? getOriginalWordFromCompoundWord(input === null || input === void 0 ? void 0 : input.field) + " must be a valid email" : alias + " must be a valid email"
            },
            has_special_character: {
                pass: (constraints === null || constraints === void 0 ? void 0 : constraints.has_special_character) === true && ((_h = input === null || input === void 0 ? void 0 : input.value) === null || _h === void 0 ? void 0 : _h.length) > 0 ? specialCharsRegex.test(input === null || input === void 0 ? void 0 : input.value) : true,
                message: alias === null ? getOriginalWordFromCompoundWord(input === null || input === void 0 ? void 0 : input.field) + " must have special character" : alias + " must have special character"
            },
            must_have_number: {
                pass: (constraints === null || constraints === void 0 ? void 0 : constraints.hasOwnProperty('must_have_number')) === true ? (((_j = input === null || input === void 0 ? void 0 : input.value) === null || _j === void 0 ? void 0 : _j.length) > 0 ? ((constraints === null || constraints === void 0 ? void 0 : constraints.must_have_number) === true ? number.test(input === null || input === void 0 ? void 0 : input.value) : true) : true) : true,
                message: alias === null ? getOriginalWordFromCompoundWord(input === null || input === void 0 ? void 0 : input.field) + " must have a number" : alias + " must have a number"
            },
            must_match: {
                pass: (constraints === null || constraints === void 0 ? void 0 : constraints.hasOwnProperty('must_match')) ? (((_k = input === null || input === void 0 ? void 0 : input.value) === null || _k === void 0 ? void 0 : _k.length) > 0 ? (matchFinder ? (input === null || input === void 0 ? void 0 : input.value) === ((_l = matchFinder.input) === null || _l === void 0 ? void 0 : _l.value) : false) : true) : true,
                message: alias === null ? getOriginalWordFromCompoundWord(input === null || input === void 0 ? void 0 : input.field) + " does not match the " + getOriginalWordFromCompoundWord(constraints === null || constraints === void 0 ? void 0 : constraints.must_match) + " field" : alias + " does not match the " + getOriginalWordFromCompoundWord(constraints === null || constraints === void 0 ? void 0 : constraints.must_match) + " field"
            },
            unique: {
                pass: (constraints === null || constraints === void 0 ? void 0 : constraints.hasOwnProperty('unique')) === true ? ((yield checkEmailInDB(input, constraints === null || constraints === void 0 ? void 0 : constraints.unique)) ? false : true) : true,
                message: alias === null ? getOriginalWordFromCompoundWord(input === null || input === void 0 ? void 0 : input.field) + " already taken" : alias + " already taken"
            }
        };
        const feedback = [];
        for (let constraint in constraints) {
            if (rules.hasOwnProperty(constraint)) {
                const rule = rules[constraint];
                if (rule.pass === false) {
                    feedback.push({
                        target: input === null || input === void 0 ? void 0 : input.field,
                        message: rule.message
                    });
                }
            }
            else {
                return {
                    status: 'fail',
                    error: `invalid rule "${constraint}"`
                };
            }
        }
        if (feedback.length === 0) {
            return {
                status: "success",
            };
        }
        else {
            return {
                status: "fail",
                feedback: feedback
            };
        }
    }
    else {
        return {
            status: "fail",
            error: `${input} cannot be null`
        };
    }
});
// const collateErrors = async (fields: FieldObjects[]) => {
//     for (const field of fields) {
//         const result = await buchi_validate(field.input, field.rules, field.alias, fields);
//         if (result.error) {
//             negatives.push(false);
//         } else if (result?.status === 'success') {
//             negatives.push(true);
//         } else if (result?.feedback) {
//             negatives.push(false);
//             errors.push(result.feedback);
//         }
//     }
//     return negatives;
// }
exports.runValidation = (fields) => __awaiter(void 0, void 0, void 0, function* () {
    const negatives = [];
    const errors = [];
    for (const field of fields) {
        const result = yield buchi_validate(field.input, field.rules, field.alias, fields);
        if (result.error) {
            negatives.push(false);
        }
        else if ((result === null || result === void 0 ? void 0 : result.status) === 'success') {
            negatives.push(true);
        }
        else if (result === null || result === void 0 ? void 0 : result.feedback) {
            negatives.push(false);
            errors.push(result.feedback);
        }
    }
    if (negatives.includes(false)) {
        const nestedArray = errors;
        const groupedMessages = {};
        nestedArray.forEach(subarray => {
            subarray.forEach(item => {
                const { message, target } = item;
                if (!groupedMessages[target]) {
                    groupedMessages[target] = [message];
                }
                else {
                    groupedMessages[target].push(message);
                }
            });
        });
        return { status: false, errors: groupedMessages };
    }
    else {
        return { status: true };
    }
});
