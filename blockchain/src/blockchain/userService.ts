import { NewUserDto, SingInDto } from "../common";
import UserStore from "./userStore";

export const addUser = async (req: any, res: any) => {
    var userStore: UserStore = require('../app').userStore;
    const user: NewUserDto = req.body;
    userStore.addUser(user).then(()=>{
        res.send('success');
    }).catch(()=>{
        res.send('error');
    })
    
}

export const signIn = async (req: any, res: any) => {
    var userStore: UserStore = require('../app').userStore;
    const signIn: SingInDto = req.body;
    const response = await userStore.signIn(signIn);
    //console.log(response);
    res.json(response);

}

