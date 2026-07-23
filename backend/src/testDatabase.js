require("dotenv").config();

const supabase = require("./config/supabase");


async function testConnection(){

    const { data, error } = await supabase
        .from("users")
        .select("*");


    if(error){
        console.log("Database connection error:");
        console.log(error.message);
    }
    else{
        console.log("Database connected successfully");
        console.log(data);
    }

}


testConnection();