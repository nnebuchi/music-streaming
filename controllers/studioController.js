const studioService = require("../services/studioService.js");
const { runValidation } = require("../lib/buchi.js");

exports.bookStudio = async (req, res) => {
    const validate = await runValidation([
        {
            input: { value: req.body.email, field: "email", type: "text" },
            rules: { required: true },
        },
        {
            input: { value: req.body.fullname, field: "fullname", type: "text" },
            rules: { required: true },
        },
        {
            input: { value: req.body.phone, field: "phone", type: "text" },
            rules: { required: true },
        },
        {
            input: { value: req.body.date, field: "date", type: "text" },
            rules: { required: true },
        },
        {
            input: { value: req.body.time, field: "time", type: "text" },
            rules: { required: true },
        },
        {
            input: { value: req.body.persons_count, field: "persons_count", type: "number" },
            rules: { required: true },
        },
        {
            input: { value: req.body.activities, field: "activities", type: "text" },
            rules: { required: true },
        },
        {
            input: { value: req.body.more_details, field: "more_details", type: "text" },
            rules: { required: true },
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
          const booking_data = req.body;
          booking_data.user_id =  req.user.id;
         //   convert booking_data.persons_count into an integer
          booking_data.persons_count = parseInt(booking_data.persons_count);
          return studioService.bookStudio(booking_data, res);
          
        }
    }
}