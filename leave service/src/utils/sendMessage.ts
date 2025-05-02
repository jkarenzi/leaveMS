import pusher from './pusher'


const sendMessage = async(groupId:string, data:{[key:string]:any}) => {
    try{
        await pusher.trigger(`presence-chat-${groupId}`, "new-message", data)
    }catch(err){
        console.log(err)
    }
    
}

export default sendMessage