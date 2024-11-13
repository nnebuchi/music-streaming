const { runValidation } = require('../lib/buchi__old');
const userAuthService =  require('../services/userAuthService');


exports.createUser = async (req, res) => {
  const user_data = {email, first_name, last_name, password } = req.body;
  
  const validate = await runValidation([

    {
      input: { value: email, field: "email", type: "text" },
      rules: { required: true, email: true, unique:'users'},
    },

    {
      input: { value: password, field: "password", type: "text" },
      rules: {
        required: true,
        has_special_character: true,
        min_length: 6,
        must_have_number: true,
      },
    },

    {
      input: { value: first_name, field: "first_name", type: "text" },
      rules: { required: true, min_length: 2 },
    },
    {
      input: { value: last_name, field: "last_name", type: "text"},
      rules: { required: true, min_length: 2 },
      alias:"surname"
    },
  ]);

  if(validate){
    if(validate?.status === false) {
      return res.status(409).json({
          status:"fail",
          errors:validate.errors,
          message:"Registration Failed",
      });
    }else{
      // const user_data = {}
      return userAuthService.createUser(user_data, res)
      
    }
  }
  
};


exports.verifyOtp = async(req, res) => {
  const otp = req.body.otp
  const email = req.body.email
  const new_password = req.body.new_password
  const purpose = req.body.purpose

  let validation_arr = [
    {
      input: { value: otp, field: "otp", type: "text" },
      rules: { required: true},
    },
    {
      input: { value: email, field: "email", type: "text" },
      rules: { required: true, email:true},
    },

  ];

  if(new_password){
    validation_arr.push({
      input: { value: new_password, field: "new_password", type: "text" },
      rules: {
        required: true,
        has_special_character: true,
        min_length: 6,
        must_have_number: true,
      },
    })
  }

  try {
    const validate = await runValidation(validation_arr);

    if(validate){
      
      if(validate?.status === false) {
        return res.status(409).json({
            status:"fail",
            errors:validate.errors,
            message:"Verification failed",
        });
      }else{
        // const user_data = {}
        return userAuthService.verifyOtp({email, otp, purpose, new_password}, res)
        
      }
    }
  } catch (error) {
    return res.status(400).json({
      status:"fail",
      error:error,
      message:"Verification failed",
    });
  }

}


exports.loginUser = async(req, res) => {
  // return res.status.send('HHH')
  const req_data = {email, password} = req.body;
  const validate = await runValidation([
    {
      input: { value: email, field: "email", type: "text" },
      rules: { required: true, email: true},
    },
    {
      input: { value: password, field: "password", type: "text" },
      rules: { required: true},
    }
  ])

  if(validate){
    if(validate?.status === false) {
      return res.status(409).json({
          status:"fail",
          errors:validate.errors,
          message:"Login Failed",
      });
    }else{
      return userAuthService.loginUser(req_data, res)
      
    }
  }
}

exports.sendOtp = async(req, res) => {
  const {email, purpose} = req.body;
  const validate = await runValidation([
    {
      input: { value: email, field: "email", type: "text" },
      rules: { required: true, email: true},
    },
    {
      input: { value: purpose, field: "purpose", type: "text" },
      rules: { required: true},
    },
  ]);

  if(validate){
    if(validate?.status === false) {
      return res.status(409).json({
          status:"fail",
          errors:validate.errors,
          message:"Request Failed",
      });
    }else{
      const handleOtp = await userAuthService.resendOtp(email, purpose, res);
      // console.log(handleOtp);
      if(handleOtp?.status){
          return res.status(200).json({
              status:"success",
              message:`otp resent successfully,  use ${handleOtp.otp} as your OTP while we fix our mail server`,
          });
      }else{
          return res.status(400).json({
              status:"fail",
              message:"Something went wrong",
              error: handleOtp?.error
          });
      }
      
    }
  }
}


exports.logoutUser = async(req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  const exp = req.user.exp;
  return await userAuthService.logoutUser(token, exp, res);
}
