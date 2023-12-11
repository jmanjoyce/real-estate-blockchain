import mongoose from "mongoose"
import { NewUserDto, PeerNode, Permission, SingInDto, SingInResDto, User } from "../common";
import { createHash, randomBytes } from 'crypto';
import { response } from "express";




class UserStore {

    private readonly PeerNodeModel: mongoose.Model<PeerNode>;
    private readonly UserModel: mongoose.Model<User>;

    constructor() {

        const connectionUrl = `mongodb://${process.env.USER_DB}/app`;
        const conn: mongoose.Connection = mongoose.createConnection(connectionUrl, {});
        conn.on('error', console.error.bind(console, 'MongoDB connection error:'));
        conn.once('open', () => {
            console.log('Connected to MongoDB');
        });


        const peerNodeSchema = new mongoose.Schema<PeerNode>({
            ipAddress: { type: String, required: true },
            port: { type: String, required: true }
        })

        const userSchema = new mongoose.Schema<User>({
            name: { type: String, required: true },
            username: { type: String, required: true, unique: true },
            passwordHash: { type: String, required: true },
            salt: { type: String, required: true },
            permission: { type: String, enum: Object.values(Permission), required: true },
            balance: { type: Number, required: true },
            nodes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PeerNode' }],
        });

        this.PeerNodeModel = conn.model<PeerNode>('PeerNode', peerNodeSchema);
        this.UserModel = conn.model<User>('User', userSchema);


    }

    async addUser(user: NewUserDto): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const salt: string = randomBytes(16).toString('hex');
                const newHash: string = hash(user.password, salt);

                const nodeId = async (peerNode: PeerNode): Promise<mongoose.Types.ObjectId> => {
                    const ipAddress: string = peerNode.ipAddress;
                    const port: string = peerNode.port;
                    const hasNodes = await this.PeerNodeModel.findOne({ ipAddress, port });
                    if (hasNodes) {
                        const id = hasNodes._id;
                        return id;

                    } else {
                        const newPeerNode = new this.PeerNodeModel({ ipAddress: ipAddress, port: port });
                        await newPeerNode.save();
                        return newPeerNode.id;
                    }
                }
                const promises = (user.nodes ?? []).map((node: PeerNode) => nodeId(node));
                const ids: mongoose.Types.ObjectId[] = await Promise.all(promises);

                const newUser = new this.UserModel({
                    name: user.name,
                    username: user.username,
                    passwordHash: newHash,
                    salt: salt,
                    permission: user.permission,
                    balance: 100,
                    nodes: ids,

                })


                await newUser.save();
                this.dump();
                resolve();

            } catch (err) {

                reject();
                console.log(err);
            }


        })

    }

    async signIn(signIn: SingInDto): Promise<SingInResDto> {

        const username: string = signIn.username;
        const userQuery = await this.UserModel.findOne({ username: username });
        if (userQuery) {
            const user: User = userQuery.toObject();
            const passwordHash = user.passwordHash;
            const salt = user.salt;
            const attemptedHash = hash(signIn.password, salt);
            if (passwordHash === attemptedHash) {
                const response: SingInResDto = {
                    success: true,
                    name: user.name,
                    message: "Verification Complete"
                }
                return response;
            } else {
                const response: SingInResDto = {
                    success: false,
                    name: "",
                    message: "Incorrect Password"
                }
                return response;
            }

        } else {
            const response: SingInResDto = {
                success: false,
                name: "",
                message: "Account Does not exist"
            }
            return response;

        }


    }

    async dump(){
        
          
        const users = await this.UserModel.find({});
        const nodes = await this.PeerNodeModel.find({});
        console.log('users', users);
        console.log('nodes', nodes);
        
        
    }




}


const hash = (password: string, salt: string): string => {
    return createHash("sha256").update(password + salt).digest("hex");
}


//export const addUser = 

// export const addUser = async (req: any, res: any) => {
//     //const connection: mongoose.Connection = await getConnection();
//     try {
//         const peerNode: PeerNode = {
//             ipAddress: "testIp",
//             port: "testPort"
//         }
//         const peerNodeA: PeerNode = {
//             ipAddress: "testIp1",
//             port: "testPort1"
//         }



//         const salt: string = randomBytes(16).toString('hex');
//         const newHash: string = hash(user.password, salt);

//         const peerNodes: PeerNode[] = [];
//         peerNodes.push(peerNode);
//         peerNodes.push(peerNodeA);


//         const nodeId = async (peerNode: PeerNode): Promise<mongoose.Types.ObjectId> => {
//             const ipAddress: string = peerNode.ipAddress;
//             const port: string = peerNode.port;
//             const hasNodes = await PeerNodeModel.findOne({ ipAddress, port });
//             if (hasNodes) {
//                 const id = hasNodes._id;
//                 return id;

//             } else {
//                 const newPeerNode = new PeerNodeModel({ ipAddress: ipAddress, port: port });
//                 await newPeerNode.save();
//                 return newPeerNode.id;
//             }
//         }
//         const promises = (user.nodes ?? []).map((node: PeerNode) => nodeId(node));
//         const ids: mongoose.Types.ObjectId[] = await Promise.all(promises);

//         const newUser = new UserModel({
//             name: user.name,
//             username: user.username,
//             passwordHash: newHash,
//             salt: salt,
//             permission: user.permission,
//             balance: 100,
//             nodes: ids,

//         })


//         await newUser.save();
//         dump();
//         res.send('success');
//     } catch (err) {
//         res.send('error')
//         console.log(err);
//     }
// }


// export const signIn = async (req: any, res: any) => {
//     const signIn: SingInDto = req.body;
//     const username: string = signIn.username;
//     const userQuery = await UserModel.findOne({ username: username });
//     if (userQuery) {
//         const user: User = userQuery.toObject();
//         const passwordHash = user.passwordHash;
//         const salt = user.salt;
//         const attemptedHash = hash(signIn.password, salt);
//         if (passwordHash === attemptedHash) {
//             const response: SingInResDto = {
//                 success: true,
//                 name: user.name,
//                 message: "Verification Complete"
//             }
//             res.json(response);
//         } else {
//             const response: SingInResDto = {
//                 success: false,
//                 name: "",
//                 message: "Incorrect Password"
//             }
//             res.json(response);
//         }

//     } else {
//         const reponse: SingInResDto = {
//             success: false,
//             name: "",
//             message: "Account Does not exist"
//         }
//         res.json(response);

//     }
// }

// export const updatePermission = () => { };




export default UserStore;