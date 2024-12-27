const { PrismaClient } = require('@prisma/client');
const prisma  = new PrismaClient();
const argon2 = require('argon2');
const crypto = require('crypto');
const {send_mail} = require('./mail/accountVerification');
const jwt = require('jsonwebtoken');
const secretKey= process.env.AUTH_SEC_KEY;
const {generateOTP} = require('../utils/generic');
const {slugify} = require('../utils/generic');


exports.createUser = async(user_data, res) => {
    try {
        const raw_password = user_data.password;
        const HashedPassword = await argon2.hash(raw_password)
        user_data.password = HashedPassword;
        user_data.slug = await slugify(`${user_data.first_name}-${user_data.last_name}`);
        const user = await prisma.users.create({
            data:user_data
        });

        if(user){
            const auth = await authenticate(user_data.email, raw_password);
            const handleOtp = await sendOtp({ name:user.first_name, recipient:user.email, purpose:"account_verification" }, res);
            if(handleOtp?.status){
                
                return res.status(201).json({
                    status:"success",
                    message:`Registration successful, check your mail for a verification code`,
                    // message:"Registration successful, check your email for a verification code",
                    token: auth?.token
                });
            }else{
                return res.status(201).json({
                    status:"success",
                    message:"registration successful, but OTP was not sent. Kindly resend OTP",
                    error: handleOtp.error,
                    token: auth?.token
                });
            }
        }

    } catch (error) {
        res.status(400).json({ 
            status: 'fail',
            error: error.message
        });
    }
   
}

exports.resendOtp = async (email, purpose, res) => {
    try {
        const user = await prisma.users.findFirst({
            where:{email:email, deleted_at:null}
        });
        
        if(user){
            
            return sendOtp({ name:user.first_name, recipient:user.email, purpose:purpose }, res)
        }
        else{
            return {
                status: false,
                error:"Could not get user"
            };
        }
    } catch (error) {
         return {
                status: false,
                error:error
            };
    }
    
}

const sendOtp = async (mail_data, res) => {
    
    try {
        const code = await generateOTP();
        const storeOtp = await saveOtp(code, mail_data.recipient);
        
        
        mail_data.code = code;
        if(storeOtp){
            // return {
            //     status: true,
            //     otp:code
            // };  
                
            const mail_res = await send_mail(mail_data, mail_data.purpose.replaceAll('_', " ").toUpperCase(), "Gracious Hearts Music", res)
            // return
            return {
                status: true
            };
        }
    } catch (error) {
        console.log(error);
        return {
            status: true,
            error:error
        };
       
    }
   
    
}

const saveOtp = async (otp, email) => {
    try {
        const delete_otps = await deleteUserOtps(email)
        // const existingOtp = await prisma.findMany()
        return await prisma.otps.create({
            data:{ email:email, otp:otp.toString()}
        });

    } catch (error) {
        console.log(error);
        return false
    }
}

const deleteUserOtps = async (email) => {
    try {
        await prisma.otps.deleteMany({
            where: {email:email},
        });
        return true;
    } catch (error) {
        console.log(error);
        return false
    }
}

exports.verifyOtp = async ({otp, email, purpose, new_password}, res) => {
    try {
        const otp_in_db =  await prisma.otps.findUnique({
            where: {email:email, otp:otp.toString()},
        })
        
        if(otp_in_db){
            console.log(otp_in_db);
            if(purpose && purpose === "reset_password") {
               
                return res.status(200).json({
                    status:"success",
                    message:"verified",
                });
            }
            const delete_otps = await deleteUserOtps(email)
            if(delete_otps === true){
                const user = await prisma.users.findFirst({
                    where: { email: email, deleted_at: null },
                })
                if(user){
                    if(new_password){
                        await prisma.users.update({
                            where: { id:user.id },
                            data: {
                                password: await argon2.hash(new_password)
                            }
                        }); 
                    }else{
                        await prisma.users.update({
                            where: { id:user.id },
                            data: {
                                is_verified: 1
                            }
                        }); 
                    }
                }
              
                return res.status(200).json({
                    status:"success",
                    message:"Completed",
                });
                
            }else{
                return res.status(400).json({
                    status:"fail",
                    message:"Failed to delete existing Otps",
                });
            }
        }else{
            return res.status(400).json({
                status:"fail",
                message:"Invalid OTP supplied",
                error:"Invalid OTP"
            });
        }
    } catch (error) {
        console.log(error);
        
        return res.status(400).json({
            status:"fail",
            message:"Something Went Wrong",
            error:error
        });
    }
}

// const authenticate = async (email, password) => {
//     try {
//         const user = await prisma.users.findUnique({
//             where:{email:email}
//         });
//         if(user){
//             const passwordCheck = await argon2.verify(user.password, password);

//             if(passwordCheck){
               
//                 const payload = {
//                     id: user.id,
//                     email: user.email
//                 }

//                 const options = {
//                     expiresIn: 7 * 24 * 60 * 60,
//                     // expiresIn: 30 * 24 * 60 * 60,
                   
//                 }
//                 jwt.sign(payload, secretKey, options)
//                 return{
//                     status:true,
//                     is_verified:user.is_verified == '0' ? false : true,
//                     token: jwt.sign(payload, secretKey, options)
//                 }
//             }else{
//                 return{
//                     status:false,
//                     error:"invalid credentials"
//                 }
//             }
//         }else{
//             return{
//                 status:false,
//                 error:"invalid credentials"
//             }
//         }
//     } catch (error) {
//         console.log(error);
        
//         return{
//             status:false,
//             error:error
//         }
//     }
// }

const authenticate = async (email, password) => {
    try {
        const user = await prisma.users.findFirst({
            where: {
                email: email,
                deleted_at: null, // Ensure the user is not soft-deleted
            },
        });

        if (user) {
            const passwordCheck = await argon2.verify(user.password, password);

            if (passwordCheck) {
                const payload = {
                    id: user.id,
                    email: user.email,
                };

                const options = {
                    expiresIn: 7 * 24 * 60 * 60, // Token expires in 7 days
                };

                return {
                    status: true,
                    is_verified: user.is_verified == 0 ? false : true,
                    token: jwt.sign(payload, secretKey, options),
                };
            } else {
                return {
                    status: false,
                    error: "Invalid credentials",
                };
            }
        } else {
            return {
                status: false,
                error: "Invalid credentials",
            };
        }
    } catch (error) {
        console.log(error);

        return {
            status: false,
            error: error.message || "An error occurred",
        };
    }
};

exports.loginUser = async(req_data, res) => {
    try {
        const auth = await authenticate(req_data.email, req_data.password);
    
        if(auth.status){
            return res.status(200).json({
                status:"success",
                message:"login successful",
                is_verified:auth.is_verified,
                token: auth.token
            })
        }else{
            return res.status(400).json({
                status:"fail",
                message:"login failed",
                error:auth.error
            });
        }
           
        // }else{
        //     return res.status(400).json({
        //         status:"fail",
        //         message:"login failed",
        //         error:"Invalid Credentials"
        //     });
        // }
       
    } catch (error) {
        console.log(error);
        
        return res.status(400).json({ 
            status: 'fail',
            error: error.message
        });
    }
   
}

exports.logoutUser = async(token, exp, res) => {
    try {
        await prisma.blacklisttoken.create({
            data:{
                token:token,
                exp:exp
            }
        });
        return res.status(200).json({
            status:"success",
            message: " Signed out"
        });
    } catch (error) {
        return res.status(400).json({
            status:"fail",
            error: error
        });
    }
}

// exports.checkTokenBlackList = (raw_token, decoded_token) => {
//     const blackList = await prisma.find({
//         where:{
//             exp
//         }
//     })
// }

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, secretKey, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

