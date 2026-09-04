const prisma = require("../../src/config/db");


require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const generateToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username}, SECRET_KEY, {
    expiresIn: "24h",
  });
};

exports.createUser = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    const existingUser = await prisma.usuario.findUnique({
      where: { email: email },
    });
    if (existingUser) {
      return res.status(400).json({ message: "Usuário já existe" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(senha, saltRounds);

    const newUser = await prisma.usuario.create({
      data: {
        nome: nome,
        email: email,
        senhaHash: hashedPassword
      },
    });

    console.log(newUser);
    return res
      .status(201)
      .json({ message: "Usuário criado com sucesso!", user: newUser });
  } catch (error) {
    console.error(error, "Erro ao criar usuário");
    return res.status(500).json({ message: "Erro ao criar usuário" });
  }
};
exports.readUsers = async (req, res)=>{
    try{
        const users = await prisma.usuario.findMany();
        if(users.length === 0){
            return res.status(404).json({ message: "Nenhum usuário encontrado" });
        }

        return res.status(200).json(users);
    }catch(error){
        console.error(error, "Erro ao listar usuários");
        return res.status(500).json({ message: "Erro ao listar usuários" });

    }
}

exports.updateUser = async (req, res)=>{
    try{
        // const { id } = req.params;
        const id = 6;
    const { nome } = req.body;
        const updatedUser = await prisma.usuario.update({
            where: { id: parseInt(id) },
            data: {
        nome: nome
            }
        }); 
        if(!updatedUser){
            return res.status(404).json({ message: "Usuário não encontrado" });
        }

        return res.status(200).json({ message: "Usuário atualizado com sucesso!", user: updatedUser });
    }catch(error){      
        console.error(error, "Erro ao atualizar usuário");
        return res.status(500).json({ message: "Erro ao atualizar usuário" });
    }
}

exports.loginUser = async(req, res)=>{
    try{

        const user = req.body;
        console.log(user);

        const existingUser = await prisma.usuario.findUnique({
            where: { email: user.email },
        });

        if (!existingUser) {
            return res.status(400).json({ message: "Usuário não encontrado" });
        }

        const isPasswordValid = await bcrypt.compare(user.senha, existingUser.senhaHash);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Senha incorreta" });
        }

        const token = generateToken(existingUser);
        console.log("Token gerado:", token);
        return res.status(200).json({ message: "Login bem-sucedido!", token: token });

    }catch(error){
        console.log(error, "Erro ao fazer login");
        return res.status(500).json({ message: "Erro ao fazer login" });
    }
}
exports.me = async (req, res) => {
  try {
    const user = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: { id: true, nome: true, email: true },
    });
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado!" });
    }
    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao buscar usuário!" });
  }
};
 