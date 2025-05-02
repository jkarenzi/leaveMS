import pusher from './pusher'


const sendNotification = async(userId:string, data:{[key:string]:any}) => {
    try{
        await pusher.trigger(`public-${userId}`, "new-notification", data)
    }catch(err){
        console.log(err)
    } 
}

export default sendNotification