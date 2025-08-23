// model importing 
const { where } = require('sequelize');
const {localAdmin}=require('../models');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt');

const createLocalAdmin = async (req , res )=>{
    try{
        const {name,email,password,role}=req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({message:"All feilds are required"});
        }
        
        const exsitingLocalAdmin=await localAdmin.findOne({
            where: {email}
        });
        if (exsitingLocalAdmin) {
            return res.status(409).json({message:"User already exisit   "})
        }

        //password encryption is hapening here before creating the localadminuser
        const saltRounds=10;
        const hashedPassword=await bcrypt.hash(password,saltRounds); // this will create the hased password 
        
        
        const newLocalAdmin=await localAdmin.create({
            name,
            email,
            password:hashedPassword,
            role
        });
        res.status(201).json({message:"Local Admin User created succesfully",
                LocalAdmin:{
                    id:newLocalAdmin.id,
                    email:newLocalAdmin.email,
                    // password:newLocalAdmin.password,
                    role:newLocalAdmin.role
                }
                
        });
    }catch(err){
        return res.status(500).json({message:"Server Error"});
    }
};

//creating local admins 
const loginLocalAdmin =async (req,res)=>{
    try {
        const {email,password}=req.body;
        
        const existingLocalAdmin= await localAdmin.findOne({where:{email}});
        if (!existingLocalAdmin) {
            return res.status(404).json({message:"No User Found"});
        }
        const hashedPassword=await bcrypt.compare(password,existingLocalAdmin.password);
        if (!hashedPassword) {
            return res.status(401).json({message:"Invalid Credentials"});

        }

        const token =jwt.sign({
            id:existingLocalAdmin.id,
            email:existingLocalAdmin.email,
            role:existingLocalAdmin.role
        },
        process.env.JWT_SECRET,{expiresIn:"2h"}
    );

        res.json({
            message:"Local Admin login successfull",
            username:existingLocalAdmin.name,
            role:existingLocalAdmin.role,
            token:token
        });
    } catch (error) {
        return res.status(500).json({message:"Server Error"});
    }
}

//delete the local admins
const deleteLocalAdmis = async (req,res)=>{
    try {
        const id= req.params.id;
    } catch (error) {
        return res.status(500).json({message:"Server Error"})
    }
}

module.exports={
    createLocalAdmin
    ,loginLocalAdmin
}