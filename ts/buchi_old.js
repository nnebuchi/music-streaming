const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

interface Input {
    field: string;
    type: string;
    value: string;
    files: object[];
}

interface Constraints {
    required: boolean;
    min_length: number;
    max_length: number;
    has_special_character: boolean;
    must_have_number: boolean;
    email: boolean;
    must_match: string;
    unique:string;
}

interface FieldObjects {
    input: Input;
    rules: Constraints;
    alias: string | null;
}

interface FindCriteria {
    [key: string]: string; // Index signature allows string keys
}

const getOriginalWordFromCompoundWord = (compound_word: string) => {
    return compound_word?.replace('_', ' ');
}

const checkEmailInDB = async (input:Input, db_model:string) => {
    const finder: FindCriteria = {};
    finder[input.field] = input.value;
    // const model = toPascalCase(db_table);
    const record =  await prisma[db_model].findUnique({
        where:finder
    });

    if (record) {
        console.log('found');
        return true
    } else {
        console.log('not found');
        return false
    }
}

const buchi_validate = async (input: Input, constraints: Constraints, alias: string | null = null, fields: FieldObjects[]) => {
    const matchFinder = fields.find((field) => {
        return constraints?.must_match === field.input?.field;
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
                pass: constraints?.required === true ? (input?.type != 'file' ? (input?.value?.length > 0) : (input?.files?.length > 0)) : true,
                message: alias === null ? getOriginalWordFromCompoundWord(input?.field) + " is required" : alias + " is required"
            },
            min_length: {
                pass: constraints?.hasOwnProperty('min_length') === true ? (input?.value?.length > 0 ? input?.value?.length >= constraints?.min_length : true) : true,
                message: alias === null ? getOriginalWordFromCompoundWord(input?.field) + " must have up to " + constraints?.min_length + " characters" : alias + " must have up to " + constraints?.min_length + " characters"
            },
            max_length: {
                pass: constraints?.hasOwnProperty('max_length') === true ? (input?.value?.length > 0 ? input?.value?.length <= constraints?.max_length : true) : true,
                message: alias === null ? getOriginalWordFromCompoundWord(input?.field) + " must not exceed " + constraints?.max_length + " characters" : alias + " must not exceed " + constraints?.max_length + " characters"
            },
            email: {
                pass: constraints?.email === true && input?.value?.length > 0 ? email_pattern.test(input?.value) : true,
                message: alias === null ? getOriginalWordFromCompoundWord(input?.field) + " must be a valid email" : alias + " must be a valid email"
            },
            has_special_character: {
                pass: constraints?.has_special_character === true && input?.value?.length > 0 ? specialCharsRegex.test(input?.value) : true,
                message: alias === null ? getOriginalWordFromCompoundWord(input?.field) + " must have special character" : alias + " must have special character"
            },
            must_have_number: {
                pass: constraints?.hasOwnProperty('must_have_number') === true ? (input?.value?.length > 0 ? (constraints?.must_have_number === true ? number.test(input?.value) : true) : true) : true,
                message: alias === null ? getOriginalWordFromCompoundWord(input?.field) + " must have a number" : alias + " must have a number"
            },
            must_match: {
                pass: constraints?.hasOwnProperty('must_match') ? (input?.value?.length > 0 ? (matchFinder ? input?.value === matchFinder.input?.value : false) : true) : true,
                message: alias === null ? getOriginalWordFromCompoundWord(input?.field) + " does not match the " + getOriginalWordFromCompoundWord(constraints?.must_match) + " field" : alias + " does not match the " + getOriginalWordFromCompoundWord(constraints?.must_match) + " field"
            },
            unique:{
                pass: constraints?.hasOwnProperty('unique') === true ? (await checkEmailInDB(input, constraints?.unique) ? false:true) : true,
                message: alias === null ? getOriginalWordFromCompoundWord(input?.field) + " already taken" : alias + " already taken"
            }

        };

        const feedback: { target: string; message: string }[] = [];

        for (let constraint in constraints) {
            if (rules.hasOwnProperty(constraint)) {
                const rule = rules[constraint as keyof typeof rules];
                if (rule.pass === false) {
                    feedback.push({
                        target: input?.field,
                        message: rule.message
                    });
                }
            } else {
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
        } else {
            return {
                status: "fail",
                feedback: feedback
            };
        }
    } else {
        return {
            status: "fail",
            error: `${input} cannot be null`
        };
    }
}

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

exports.runValidation = async (fields: FieldObjects[]) => {
    const negatives: boolean[] = [];
    const errors: { target: string; message: string }[][] = [];
    for (const field of fields) {
        const result = await buchi_validate(field.input, field.rules, field.alias, fields);
        if (result.error) {
            negatives.push(false);
        } else if (result?.status === 'success') {
            negatives.push(true);
        } else if (result?.feedback) {
            negatives.push(false);
            errors.push(result.feedback);
        }
    }

    if (negatives.includes(false)) {
        const nestedArray: { target: string; message: string }[][] = errors;

        const groupedMessages: { [key: string]: string[] } = {};

        nestedArray.forEach(subarray => {
            subarray.forEach(item => {
                const { message, target } = item;
                if (!groupedMessages[target]) {
                    groupedMessages[target] = [message];
                } else {
                    groupedMessages[target].push(message);
                }
            });
        });

        return { status: false, errors: groupedMessages };
    } else {
        return { status: true };
    }
    
}