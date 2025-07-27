import { Router } from "express";

const router = Router();

router.get("/register", (req, res) => {
    res.sendFile("register.html", { root: "./public/html" });
});

router.get("/login", (req, res) => {
    res.sendFile("login.html", { root: "./public/html" });
});

router.get("/",(req,res)=>{
    res.sendFile("home.html",{root:"./public/html"});
})

router.get("/watch/:vedioID",(req,res)=>{
    res.sendFile("watchVedio.html",{root:"./public/html"});
})

export default router;