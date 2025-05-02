import moment from "moment-timezone"


export const getPriorityClass = (priorityLevel:string) => {
    if(priorityLevel === 'high'){
        return 'bg-[#FF9D9D]'
    }else if(priorityLevel === 'low'){
        return 'bg-[#B5FF9C]'
    }else if(priorityLevel === 'medium'){
        return 'bg-[#D391D2]'
    }
}

export const getStatusClass = (status:string) => {
    if(status === 'to_do'){
        return 'bg-[#FFBB00]'
    }else if(status === 'in_progress'){
        return 'bg-[#D391D2]'
    }else if(status === 'completed'){
        return 'bg-[#B5FF9C]'
    }else if(status === 'stuck'){
        return 'bg-red-400'
    }
}

export const formatDate = (date:string, format:string) => {
    return moment(date).tz("Africa/Kigali").format(format);
}

export const getUserInitials = (name:string) => {
    const names = name.split(" ")
    if(names.length === 1){
        return names[0][0]
    }else{
        return `${names[0][0]}${names[1][0]}`
    }
}