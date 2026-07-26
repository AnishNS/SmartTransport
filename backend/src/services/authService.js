const bcrypt = require("bcrypt");
const supabase = require("../config/supabase");


async function registerUser(userData) {

    const {
        name,
        email,
        phone,
        password,
        role
    } = userData;


    // Check if user already exists

    const { data: existingUser, error: checkError } =
        await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .single();


    if(existingUser) {
        throw new Error("Email already registered");
    }


    // Hash password

    const hashedPassword = await bcrypt.hash(password, 10);



    // Insert new user

    const { data, error } =
        await supabase
            .from("users")
            .insert([
                {
                    name,
                    email,
                    phone,
                    password_hash: hashedPassword,
                    role
                }
            ])
            .select()
            .single();



    if(error) {
        throw new Error(error.message);
    }


    return data;

}


module.exports = {
    registerUser
};